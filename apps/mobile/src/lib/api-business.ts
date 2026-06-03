import { api } from "./api-client";

export interface BusinessDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  brand_color: string | null;
  pix_key: string | null;
  opening_hours: Record<string, string> | null;
  is_active: boolean;
  created_at: string;
  vertical_id?: string;
  subvertical_id?: string;
  onboarding_completed: boolean;
  setup_step: number;
  subscription_tier: string;
}

export interface PageDTO {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  show_in_navigation: boolean;
  sort_order: number;
  page_type?: string;
  created_at: string;
}

export interface QrCodeDTO {
  id: string;
  short_code: string;
  title: string | null;
  destination_url: string | null;
  scan_count: number;
  is_active: boolean;
  qr_type?: string;
  page: { id: string; title: string; slug: string } | null;
  pages: { title: string } | null;
  created_at: string;
}

export interface AnalyticsSummaryDTO {
  pageViews: number;
  qrScans: number;
  whatsappClicks: number;
  newLeads: number;
  appointments: number;
  quotes: number;
  totalQrScans: number;
}

const toStr = (val: string | string[] | undefined): string => {
  if (!val) return "";
  return Array.isArray(val) ? val[0] : val;
};

export const businessApi = {
  list: () => api.get<BusinessDTO[]>("/api/businesses"),
  getById: (id: string | string[]) => api.get<BusinessDTO>(`/api/businesses/${toStr(id)}`),
  create: (data: any) => api.post<BusinessDTO>("/api/businesses", data),
  update: (id: string | string[], data: any) => api.patch<BusinessDTO>(`/api/businesses/${toStr(id)}`, data),
  remove: (id: string | string[]) => api.del(`/api/businesses/${toStr(id)}`),
  getPages: (businessId: string | string[]) => api.get<PageDTO[]>("/api/pages", { params: { businessId: toStr(businessId) } }),
  getQrCodes: (businessId: string | string[]) => api.get<QrCodeDTO[]>("/api/qr-codes", { params: { businessId: toStr(businessId) } }),
  getAnalytics: (businessId: string | string[]) => api.get<AnalyticsSummaryDTO>("/api/analytics/summary", { params: { businessId: toStr(businessId) } }),
  getEnabledModules: (businessId: string | string[]) => api.get("/api/modules/enabled/" + toStr(businessId)),
};

export const qrApi = {
  listAll: () => api.get<QrCodeDTO[]>("/api/qr-codes"),
  getById: (id: string | string[]) => api.get<QrCodeDTO>(`/api/qr-codes/${toStr(id)}`),
  create: (data: any) => api.post<QrCodeDTO>("/api/qr-codes", data),
  update: (id: string | string[], data: any) => api.patch<QrCodeDTO>(`/api/qr-codes/${toStr(id)}`, data),
  remove: (id: string | string[]) => api.del(`/api/qr-codes/${toStr(id)}`),
  recordScan: (id: string | string[]) => api.post(`/api/qr-codes/${toStr(id)}/scan`),
};

export const pageApi = {
  list: (businessId: string | string[]) => api.get<PageDTO[]>("/api/pages", { params: { businessId: toStr(businessId) } }),
  getById: (id: string | string[]) => api.get(`/api/pages/${toStr(id)}`),
  create: (data: any) => api.post("/api/pages", data),
  update: (id: string | string[], data: any) => api.patch(`/api/pages/${toStr(id)}`, data),
  remove: (id: string | string[]) => api.del(`/api/pages/${toStr(id)}`),
  duplicate: (id: string | string[]) => api.post(`/api/pages/${toStr(id)}/duplicate`),
  publish: (id: string | string[]) => api.post(`/api/pages/${toStr(id)}/publish`),
  unpublish: (id: string | string[]) => api.post(`/api/pages/${toStr(id)}/unpublish`),
  addSection: (data: any) => api.post("/api/pages/sections", data),
  updateSection: (sectionId: string | string[], data: any) => api.patch(`/api/pages/sections/${toStr(sectionId)}`, data),
  removeSection: (sectionId: string | string[]) => api.del(`/api/pages/sections/${toStr(sectionId)}`),
};

export const analyticsApi = {
  getSummary: (businessId: string | string[]) => api.get<AnalyticsSummaryDTO>("/api/analytics/summary", { params: { businessId: toStr(businessId) } }),
  trackEvent: (data: any) => api.post("/api/analytics/event", data),
};

export const leadApi = {
  list: (businessId: string | string[]) => api.get("/api/leads", { params: { businessId: toStr(businessId) } }),
  remove: (id: string | string[]) => api.del(`/api/leads/${toStr(id)}`),
};

export const orderApi = {
  list: (businessId: string | string[]) => api.get("/api/orders", { params: { businessId: toStr(businessId) } }),
  update: (id: string | string[], data: any) => api.patch(`/api/orders/${toStr(id)}`, data),
};

export const quoteApi = {
  list: (businessId: string | string[]) => api.get("/api/quote-requests", { params: { businessId: toStr(businessId) } }),
  update: (id: string | string[], data: any) => api.patch(`/api/quote-requests/${toStr(id)}`, data),
  remove: (id: string | string[]) => api.del(`/api/quote-requests/${toStr(id)}`),
};

export const memberApi = {
  list: (businessId: string | string[]) => api.get("/api/members", { params: { businessId: toStr(businessId) } }),
  invite: (data: any) => api.post("/api/members", data),
  remove: (id: string | string[]) => api.del(`/api/members/${toStr(id)}`),
};

export const profileApi = {
  get: () => api.get<{ id: string; email: string; profile: { full_name?: string; avatar_url?: string; phone?: string; language?: string } | null }>("/api/me"),
  update: (data: any) => api.patch("/api/me/profile", data),
};

export const verticalApi = {
  list: () => api.get("/api/verticals"),
  getBySlug: (slug: string) => api.get(`/api/verticals/${slug}`),
};

export const moduleApi = {
  list: () => api.get("/api/modules"),
  getEnabled: (businessId: string | string[]) => api.get(`/api/modules/enabled/${toStr(businessId)}`),
  enable: (data: any) => api.post("/api/modules/enable", data),
  disable: (data: any) => api.post("/api/modules/disable", data),
};
