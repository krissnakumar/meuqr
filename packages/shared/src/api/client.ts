const API_BASE_URL =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"
    : "http://localhost:4000";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  token?: string;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, token, ...fetchOpts } = options;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((fetchOpts.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      ...fetchOpts,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new ApiError(response.status, error.error || "Request failed", error.message || error.error);
    }

    return response.json();
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const supabase = (window as any).__supabaseClient;
      if (supabase?.auth?.getSession) {
        return null; // Token should be injected by the caller
      }
    } catch {}
    return null;
  }

  get<T>(path: string, options: FetchOptions = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: FetchOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown, options: FetchOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options: FetchOptions = {}) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

export const api = new ApiClient(API_BASE_URL);
export { ApiClient };
