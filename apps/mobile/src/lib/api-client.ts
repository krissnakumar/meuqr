import { ApiClient } from "@meuqr/shared";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

let cachedToken: string | null = null;

async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const { data } = await supabase.auth.getSession();
  cachedToken = data.session?.access_token ?? null;
  return cachedToken;
}

export function invalidateToken() {
  cachedToken = null;
}

supabase.auth.onAuthStateChange((event, session) => {
  if ((event as string) === "SIGNED_OUT" || (event as string) === "USER_DELETED") {
    cachedToken = null;
  } else if (session?.access_token) {
    cachedToken = session.access_token;
  }
});

const client = new ApiClient(API_BASE_URL);

export const api = {
  async get<T = any>(path: string, options?: { params?: Record<string, string> }) {
    const token = await getToken();
    return client.get<T>(path, { ...options, token: token ?? undefined });
  },

  async post<T = any>(path: string, body?: unknown, options?: { params?: Record<string, string> }) {
    const token = await getToken();
    return client.post<T>(path, body, { ...options, token: token ?? undefined });
  },

  async patch<T = any>(path: string, body?: unknown, options?: { params?: Record<string, string> }) {
    const token = await getToken();
    return client.patch<T>(path, body, { ...options, token: token ?? undefined });
  },

  async del<T = any>(path: string, options?: { params?: Record<string, string> }) {
    const token = await getToken();
    return client.delete<T>(path, { ...options, token: token ?? undefined });
  },
};
