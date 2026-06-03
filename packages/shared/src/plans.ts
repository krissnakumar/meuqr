// ============================================
// MeuQR Business OS — Subscription Plans Configuration
// ============================================

export interface SubscriptionLimits {
  max_businesses: number;
  max_qrs: number;
  max_items: number;
  custom_qr: boolean;
  analytics: boolean;
  staff_members: boolean;
  api_access: boolean;
}

export interface PlanConfig extends SubscriptionLimits {
  name: string;
  namePt: string;
  price_monthly: number;
  price_yearly: number;

  // Camel case limits (new standard)
  maxBusinesses: number;
  maxPages: number;
  maxItems: number;
  hasQuoteRequests: boolean;
  hasOrders: boolean;
  hasAppointments: boolean;
  hasAdvancedAnalytics: boolean;
  removeBranding: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    namePt: "Grátis",
    price_monthly: 0,
    price_yearly: 0,
    // Snake case limits (old)
    max_businesses: 1,
    max_qrs: 1,
    max_items: 20,
    custom_qr: false,
    analytics: false,
    staff_members: false,
    api_access: false,
    // Camel case limits (new)
    maxBusinesses: 1,
    maxPages: 1,
    maxItems: 10,
    hasQuoteRequests: false,
    hasOrders: false,
    hasAppointments: false,
    hasAdvancedAnalytics: false,
    removeBranding: false,
  },
  pro: {
    name: "Pro",
    namePt: "Profissional",
    price_monthly: 29.9,
    price_yearly: 299,
    // Snake case limits (old)
    max_businesses: 3,
    max_qrs: -1, // unlimited
    max_items: 500,
    custom_qr: true,
    analytics: true,
    staff_members: false,
    api_access: false,
    // Camel case limits (new)
    maxBusinesses: 3,
    maxPages: 999,
    maxItems: 500,
    hasQuoteRequests: true,
    hasOrders: true,
    hasAppointments: true,
    hasAdvancedAnalytics: true,
    removeBranding: true,
  },
  business: {
    name: "Business",
    namePt: "Empresarial",
    price_monthly: 79.9,
    price_yearly: 799,
    // Snake case limits (old)
    max_businesses: -1, // unlimited
    max_qrs: -1,
    max_items: -1,
    custom_qr: true,
    analytics: true,
    staff_members: true,
    api_access: true,
    // Camel case limits (new)
    maxBusinesses: 999,
    maxPages: 999,
    maxItems: 9999,
    hasQuoteRequests: true,
    hasOrders: true,
    hasAppointments: true,
    hasAdvancedAnalytics: true,
    removeBranding: true,
  },
  past_due: {
    name: "Past Due",
    namePt: "Atrasado",
    price_monthly: 0,
    price_yearly: 0,
    // Snake case limits (old)
    max_businesses: 1,
    max_qrs: 1,
    max_items: 20,
    custom_qr: false,
    analytics: false,
    staff_members: false,
    api_access: false,
    // Camel case limits (new)
    maxBusinesses: 1,
    maxPages: 1,
    maxItems: 10,
    hasQuoteRequests: false,
    hasOrders: false,
    hasAppointments: false,
    hasAdvancedAnalytics: false,
    removeBranding: false,
  },
};
