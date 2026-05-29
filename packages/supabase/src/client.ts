import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createBrowserClient(url?: string, anonKey?: string): SupabaseClient {
  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const finalAnonKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!finalUrl || !finalAnonKey) {
    throw new Error("Supabase URL and Anon Key are required for browser client.");
  }

  return createClient(finalUrl, finalAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/** @deprecated Use createBrowserClient() for browser, or createServerClient from @supabase/ssr for Next.js server components/API routes. */
export function createServerClientDeprecated(url?: string, anonKey?: string): SupabaseClient {
  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const finalAnonKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!finalUrl || !finalAnonKey) {
    throw new Error("Supabase URL and Anon Key are required for server client.");
  }

  return createClient(finalUrl, finalAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServiceClient(url?: string, serviceRoleKey?: string): SupabaseClient {
  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const finalKey = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!finalUrl || !finalKey) {
    throw new Error("Supabase URL and Service Role Key are required for service client.");
  }

  return createClient(finalUrl, finalKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
