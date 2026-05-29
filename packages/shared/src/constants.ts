import type { PlanConfig } from "./types";

// ===== App Info =====

export const APP_NAME = "MeuQR";
export const APP_DESCRIPTION = "Páginas inteligentes com QR Code para seu negócio";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ===== Business Categories =====

export const BUSINESS_CATEGORIES = [
  { value: "restaurant", label: "Restaurante", icon: "Utensils" },
  { value: "construction_materials", label: "Material de Construção", icon: "Building2" },
  { value: "salon", label: "Salão / Barbearia", icon: "Scissors" },
  { value: "pet_shop", label: "Pet Shop", icon: "Dog" },
  { value: "hotel", label: "Hotel", icon: "Hotel" },
  { value: "real_estate", label: "Imobiliária", icon: "Home" },
  { value: "event", label: "Evento", icon: "Calendar" },
  { value: "clinic", label: "Clínica", icon: "Stethoscope" },
  { value: "gym", label: "Academia", icon: "Dumbbell" },
  { value: "mechanic", label: "Mecânico", icon: "Wrench" },
  { value: "freelancer", label: "Freelancer", icon: "Briefcase" },
  { value: "church", label: "Igreja", icon: "Church" },
  { value: "product_shelf", label: "Prateleira de Produto", icon: "Package" },
  { value: "other", label: "Outro", icon: "MoreHorizontal" },
] as const;

// ===== Subscription Plans =====

export const PLANS: PlanConfig = {
  free: {
    name: "Free",
    namePt: "Grátis",
    max_businesses: 1,
    max_qrs: 1,
    max_items: 20,
    custom_qr: false,
    analytics: false,
    staff_members: false,
    api_access: false,
    price_monthly: 0,
    price_yearly: 0,
  },
  pro: {
    name: "Pro",
    namePt: "Profissional",
    max_businesses: 3,
    max_qrs: -1, // unlimited
    max_items: 500,
    custom_qr: true,
    analytics: true,
    staff_members: false,
    api_access: false,
    price_monthly: 29.9,
    price_yearly: 299,
  },
  business: {
    name: "Business",
    namePt: "Empresarial",
    max_businesses: -1, // unlimited
    max_qrs: -1,
    max_items: -1,
    custom_qr: true,
    analytics: true,
    staff_members: true,
    api_access: true,
    price_monthly: 79.9,
    price_yearly: 799,
  },
};

// ===== QR Defaults =====

export const QR_DEFAULTS = {
  foregroundColor: "#1877F2", // Facebook Blue
  backgroundColor: "#FFFFFF",
  dotStyle: "rounded" as const,
  cornerStyle: "rounded" as const,
  errorCorrectionLevel: "M" as const,
  margin: 10,
};

// ===== Colors =====

export const COLORS = {
  primary: "#1877F2", // Facebook Blue
  accent: "#31A24C", // Facebook Green (active state)
  secondary: "#E4E6EB", // Facebook Secondary Light
  background: "#F0F2F5", // Facebook Athens Gray background
  white: "#FFFFFF",
  muted: "#65676B", // Facebook Muted Gray
  border: "#E4E6EB", // Facebook Border Gray
  error: "#FA3E3E", // Facebook Red
  success: "#31A24C", // Facebook Green
  warning: "#F5C33B", // Facebook Yellow
};

// ===== Limits =====

export const UPLOAD_LIMITS = {
  max_file_size_mb: 5,
  allowed_image_types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  max_logo_size_mb: 2,
};

export const RATE_LIMITS = {
  public_analytics: { requests: 60, window_seconds: 60 },
  api_general: { requests: 1000, window_seconds: 3600 },
};
