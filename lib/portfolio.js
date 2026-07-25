import { unstable_noStore as noStore } from "next/cache";
import { fallbackCv, fallbackProjects } from "./fallbackData";
import { createAdminSupabaseClient, createPublicSupabaseClient } from "./supabase";

export const revalidate = 300;

export async function getProjects({ includeHidden = false, noCache = false } = {}) {
  if (noCache) noStore();

  const supabase = createPublicSupabaseClient();
  if (!supabase) return fallbackProjects;

  let query = supabase
    .from("projects")
    .select("id,title,description,tech_stack,source_url,demo_url,display_order,is_featured,created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!includeHidden) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase projects fetch failed:", error.message);
    return fallbackProjects;
  }

  return data?.length ? data : fallbackProjects;
}

export async function getLatestCv({ noCache = false } = {}) {
  if (noCache) noStore();

  const supabase = createPublicSupabaseClient();
  if (!supabase) return fallbackCv;

  const { data, error } = await supabase
    .from("cv_files")
    .select("title,file_url,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase CV fetch failed:", error.message);
    return fallbackCv;
  }

  return data
    ? { title: data.title, fileUrl: data.file_url }
    : fallbackCv;
}

export async function getCvFiles({ noCache = false } = {}) {
  if (noCache) noStore();

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [
      {
        id: "fallback-cv",
        title: fallbackCv.title,
        file_url: fallbackCv.fileUrl,
        file_path: "",
        is_active: true,
        created_at: null,
      },
    ];
  }

  const { data, error } = await supabase
    .from("cv_files")
    .select("id,title,file_path,file_url,is_active,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase CV list fetch failed:", error.message);
    return [];
  }

  return data || [];
}

export async function getAdminCvFiles({ noCache = false } = {}) {
  if (noCache) noStore();

  const supabase = createAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cv_files")
    .select("id,title,file_path,file_url,is_active,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase admin CV list fetch failed:", error.message);
    return [];
  }

  return data || [];
}
