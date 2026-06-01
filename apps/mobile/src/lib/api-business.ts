import { api } from "./api-client";

export interface BusinessDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  instagram?: string;
  website?: string;
  brand_color?: string;
  pix_key?: string;
  opening_hours?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  vertical_id?: string;
  subvertical_id?: string;
  onboarding_completed: boolean;
  setup_step: number;
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
  title?: string;
  destination_url?: string;
  scan_count: number;
  is_active: boolean;
  qr_type?: string;
  page?: { id: string; title: string; slug: string };
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

export const businessApi = {
  list: () => api.get<BusinessDTO[]>("/api/businesses"),
  getById: (id: string) => api.get<BusinessDTO>(`/api/businesses/${id}`),
  create: (data: any) => api.post<BusinessDTO>("/api/businesses", data),
  update: (id: string, data: any) => api.patch<BusinessDTO>(`/api/businesses/${id}`, data),
  remove: (id: string) => api.del(`/api/businesses/${id}`),
  getPages: (businessId: string) => api.get<PageDTO[]>("/api/pages", { params: { businessId } }),
  getQrCodes: (businessId: string) => api.get<QrCodeDTO[]>("/api/qr-codes", { params: { businessId } }),
  getAnalytics: (businessId: string) => api.get<AnalyticsSummaryDTO>("/api/analytics/summary", { params: { businessId } }),
  getEnabledModules: (businessId: string) => api.get("/api/modules/enabled/" + businessId),
};

export const qrApi = {
  listAll: () => api.get<QrCodeDTO[]>("/api/qr-codes"),
  getById: (id: string) => api.get<QrCodeDTO>(`/api/qr-codes/${id}`),
  create: (data: any) => api.post<QrCodeDTO>("/api/qr-codes", data),
  update: (id: string, data: any) => api.patch<QrCodeDTO>(`/api/qr-codes/${id}`, data),
  remove: (id: string) => api.del(`/api/qr-codes/${id}`),
  recordScan: (id: string) => api.post(`/api/qr-codes/${id}/scan`),
};

export const pageApi = {
  list: (businessId: string) => api.get<PageDTO[]>("/api/pages", { params: { businessId } }),
  getById: (id: string) => api.get(`/api/pages/${id}`),
  create: (data: any) => api.post("/api/pages", data),
  update: (id: string, data: any) => api.patch(`/api/pages/${id}`, data),
  remove: (id: string) => api.del(`/api/pages/${id}`),
  duplicate: (id: string) => api.post(`/api/pages/${id}/duplicate`),
  publish: (id: string) => api.post(`/api/pages/${id}/publish`),
  unpublish: (id: string) => api.post(`/api/pages/${id}/unpublish`),
  addSection: (data: any) => api.post("/api/pages/sections", data),
  updateSection: (sectionId: string, data: any) => api.patch(`/api/pages/sections/${sectionId}`, data),
  removeSection: (sectionId: string) => api.del(`/api/pages/sections/${sectionId}`),
};

export const analyticsApi = {
  getSummary: (businessId: string) => api.get<AnalyticsSummaryDTO>("/api/analytics/summary", { params: { businessId } }),
  trackEvent: (data: any) => api.post("/api/analytics/event", data),
};

export const leadApi = {
  list: (businessId: string) => api.get("/api/leads", { params: { businessId } }),
  remove: (id: string) => api.del(`/api/leads/${id}`),
};

export const orderApi = {
  list: (businessId: string) => api.get("/api/orders", { params: { businessId } }),
  update: (id: string, data: any) => api.patch(`/api/orders/${id}`, data),
};

export const quoteApi = {
  list: (businessId: string) => api.get("/api/quote-requests", { params: { businessId } }),
  update: (id: string, data: any) => api.patch(`/api/quote-requests/${id}`, data),
  remove: (id: string) => api.del(`/api/quote-requests/${id}`),
};

export const memberApi = {
  list: (businessId: string) => api.get("/api/members", { params: { businessId } }),
  invite: (data: any) => api.post("/api/members", data),
  remove: (id: string) => api.del(`/api/members/${id}`),
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
  getEnabled: (businessId: string) => api.get(`/api/modules/enabled/${businessId}`),
  enable: (data: any) => api.post("/api/modules/enable", data),
  disable: (data: any) => api.post("/api/modules/disable", data),
};
