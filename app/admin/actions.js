"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminCookie, isAdminAuthenticated, setAdminCookie } from "../../lib/adminAuth";
import { createAdminSupabaseClient, getSupabaseConfigStatus, hasAdminSupabaseConfig } from "../../lib/supabase";

function requireAdminConfig() {
  if (!hasAdminSupabaseConfig()) {
    const status = getSupabaseConfigStatus();
    const missing = [
      !status.hasUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !status.hasServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);
    throw new Error(`Missing ${missing.join(" and ")} in .env.local. Restart the dev server after adding it.`);
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) throw new Error("Supabase admin client could not be created.");
  return supabase;
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
}

function cleanUrl(value) {
  const text = String(value || "").trim();
  return text || null;
}

function adminStatusUrl(params) {
  const searchParams = new URLSearchParams(params);
  return `/admin?${searchParams.toString()}`;
}

function isRedirectError(error) {
  return error?.digest?.startsWith("NEXT_REDIRECT");
}

function readProject(formData) {
  return {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    tech_stack: String(formData.get("tech_stack") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    source_url: cleanUrl(formData.get("source_url")),
    demo_url: cleanUrl(formData.get("demo_url")),
    display_order: Number(formData.get("display_order") || 0),
    is_featured: formData.get("is_featured") === "on",
  };
}

export async function loginAction(formData) {
  const password = String(formData.get("password") || "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    redirect("/admin?error=invalid");
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin");
}

export async function createProjectAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const project = readProject(formData);

    if (!project.title || !project.description) {
      redirect(adminStatusUrl({ projectError: "Project title and description are required." }));
    }

    const { error } = await supabase.from("projects").insert(project);
    if (error) {
      redirect(adminStatusUrl({ projectError: error.message }));
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ projectError: error.message || "Project save failed." }));
  }

  redirect(adminStatusUrl({ projectSaved: "1" }));
}

export async function updateProjectAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const id = String(formData.get("id") || "");
    const project = readProject(formData);

    if (!id) {
      redirect(adminStatusUrl({ projectError: "Missing project id." }));
    }

    const { error } = await supabase.from("projects").update(project).eq("id", id);
    if (error) {
      redirect(adminStatusUrl({ projectError: error.message }));
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ projectError: error.message || "Project update failed." }));
  }

  redirect(adminStatusUrl({ projectSaved: "1" }));
}

export async function deleteProjectAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const id = String(formData.get("id") || "");

    if (!id) {
      redirect(adminStatusUrl({ projectError: "Missing project id." }));
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      redirect(adminStatusUrl({ projectError: error.message }));
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ projectError: error.message || "Project delete failed." }));
  }

  redirect(adminStatusUrl({ projectDeleted: "1" }));
}

export async function uploadCvAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const file = formData.get("cv");
    const title = String(formData.get("title") || "Nihal T Resume").trim();

    if (!file || typeof file === "string" || file.size === 0) {
      redirect(adminStatusUrl({ cvError: "Choose a PDF file to upload." }));
    }

    if (file.type && file.type !== "application/pdf") {
      redirect(adminStatusUrl({ cvError: "Only PDF CV uploads are supported." }));
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `cv/${Date.now()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      redirect(adminStatusUrl({ cvError: uploadError.message }));
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    const fileUrl = data.publicUrl;

    const { error: deactivateError } = await supabase
      .from("cv_files")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      redirect(adminStatusUrl({ cvError: deactivateError.message }));
    }

    const { error: insertError } = await supabase.from("cv_files").insert({
      title,
      file_path: path,
      file_url: fileUrl,
      is_active: true,
    });

    if (insertError) {
      redirect(adminStatusUrl({ cvError: insertError.message }));
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ cvError: error.message || "CV upload failed." }));
  }

  redirect(adminStatusUrl({ cvUploaded: "1" }));
}

export async function activateCvAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const id = String(formData.get("id") || "");

    if (!id) {
      redirect(adminStatusUrl({ cvError: "Missing CV id." }));
    }

    const { error: deactivateError } = await supabase
      .from("cv_files")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      redirect(adminStatusUrl({ cvError: deactivateError.message }));
    }

    const { error: activateError } = await supabase
      .from("cv_files")
      .update({ is_active: true })
      .eq("id", id);

    if (activateError) {
      redirect(adminStatusUrl({ cvError: activateError.message }));
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ cvError: error.message || "CV activation failed." }));
  }

  redirect(adminStatusUrl({ cvActivated: "1" }));
}

export async function deleteCvAction(formData) {
  try {
    await requireAdmin();
    const supabase = requireAdminConfig();
    const id = String(formData.get("id") || "");
    const filePath = String(formData.get("file_path") || "");

    if (!id) {
      redirect(adminStatusUrl({ cvError: "Missing CV id." }));
    }

    const { data: cv, error: lookupError } = await supabase
      .from("cv_files")
      .select("is_active")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      redirect(adminStatusUrl({ cvError: lookupError.message }));
    }

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("portfolio")
        .remove([filePath]);

      if (storageError) {
        redirect(adminStatusUrl({ cvError: storageError.message }));
      }
    }

    const { error: deleteError } = await supabase
      .from("cv_files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      redirect(adminStatusUrl({ cvError: deleteError.message }));
    }

    if (cv?.is_active) {
      const { data: nextCv, error: nextError } = await supabase
        .from("cv_files")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (nextError) {
        redirect(adminStatusUrl({ cvError: nextError.message }));
      }

      if (nextCv?.id) {
        const { error: activateError } = await supabase
          .from("cv_files")
          .update({ is_active: true })
          .eq("id", nextCv.id);

        if (activateError) {
          redirect(adminStatusUrl({ cvError: activateError.message }));
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(adminStatusUrl({ cvError: error.message || "CV delete failed." }));
  }

  redirect(adminStatusUrl({ cvDeleted: "1" }));
}
