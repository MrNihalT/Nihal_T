import { createClient } from "@supabase/supabase-js";

function readEnv(name) {
  return process.env[name]?.trim();
}

export function getSupabaseConfigStatus() {
  return {
    hasUrl: Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL")),
    hasAnonKey: Boolean(readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
    hasServiceRoleKey: Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY")),
  };
}

export function getSupabasePublicConfig() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getSupabaseAdminConfig() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasPublicSupabaseConfig() {
  const { url, anonKey } = getSupabasePublicConfig();
  return Boolean(url && anonKey);
}

export function hasAdminSupabaseConfig() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();
  return Boolean(url && serviceRoleKey);
}

export function createPublicSupabaseClient() {
  const { url, anonKey } = getSupabasePublicConfig();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminSupabaseClient() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
