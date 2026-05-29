import type { PlanConfig } from "./types";

// ===== App Info =====

export const APP_NAME = "MeuQR";
export const APP_DESCRIPTION = "Páginas inteligentes com QR Code para seu negócio";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ===== Business Categories =====

export const BUSINESS_CATEGORIES = [
  // Food & Beverage
  { value: "restaurant", label: "Restaurante / Lanchonete", icon: "UtensilsCrossed" },
  { value: "pizzeria", label: "Pizzaria", icon: "Pizza" },
  { value: "burger_shop", label: "Hamburgueria", icon: "Sandwich" },
  { value: "bakery", label: "Padaria / Confeitaria", icon: "Bread" },
  { value: "coffee_shop", label: "Cafeteria", icon: "Coffee" },
  { value: "acai_sorveteria", label: "Açaí / Sorveteria", icon: "IceCream" },
  { value: "bar_pub", label: "Bar / Pub", icon: "Wine" },
  { value: "food_truck", label: "Food Truck", icon: "Truck" },
  // Construction & Hardware
  { value: "construction_materials", label: "Material de Construção", icon: "Building2" },
  { value: "hardware_store", label: "Loja de Ferragens", icon: "Wrench" },
  { value: "paint_store", label: "Loja de Tintas", icon: "PaintBucket" },
  { value: "electrical_supplies", label: "Materiais Elétricos", icon: "Zap" },
  { value: "plumbing_supplies", label: "Materiais Hidráulicos", icon: "Droplets" },
  // Retail
  { value: "furniture_store", label: "Loja de Móveis", icon: "Sofa" },
  { value: "clothing_store", label: "Loja de Roupas", icon: "Shirt" },
  { value: "shoe_store", label: "Loja de Calçados", icon: "Footprints" },
  { value: "cosmetics_store", label: "Loja de Cosméticos", icon: "Sparkles" },
  { value: "supermarket", label: "Supermercado / Mercearia", icon: "ShoppingCart" },
  // Pets
  { value: "pet_shop", label: "Pet Shop", icon: "Dog" },
  { value: "veterinary", label: "Clínica Veterinária", icon: "Stethoscope" },
  // Beauty & Wellness
  { value: "salon", label: "Salão de Beleza", icon: "Scissors" },
  { value: "barber_shop", label: "Barbearia", icon: "Beard" },
  { value: "nail_studio", label: "Estúdio de Unhas", icon: "Hand" },
  { value: "spa", label: "Spa / Massagem", icon: "Flower2" },
  { value: "dental_clinic", label: "Clínica Odontológica", icon: "Tooth" },
  { value: "medical_clinic", label: "Clínica Médica", icon: "Stethoscope" },
  { value: "physiotherapy", label: "Fisioterapia", icon: "Activity" },
  { value: "gym", label: "Academia / Personal", icon: "Dumbbell" },
  // Hospitality
  { value: "hotel", label: "Hotel / Pousada", icon: "Hotel" },
  // Real Estate & Automotive
  { value: "real_estate", label: "Imobiliária", icon: "Home" },
  { value: "car_dealership", label: "Concessionária", icon: "Car" },
  { value: "auto_repair", label: "Oficina Mecânica", icon: "Wrench" },
  { value: "motorcycle_repair", label: "Oficina de Motos", icon: "Bike" },
  { value: "car_wash", label: "Lava Rápido", icon: "SprayCan" },
  // Events
  { value: "event", label: "Organizador de Eventos", icon: "Calendar" },
  { value: "party_rental", label: "Aluguel para Festas", icon: "PartyPopper" },
  // Education & Community
  { value: "school", label: "Escola / Curso", icon: "BookOpen" },
  { value: "daycare", label: "Creche", icon: "Baby" },
  { value: "church", label: "Igreja / Grupo", icon: "Church" },
  // Services
  { value: "freelancer", label: "Freelancer / Profissional", icon: "Briefcase" },
  { value: "photographer", label: "Fotógrafo", icon: "Camera" },
  { value: "cleaning_services", label: "Serviços de Limpeza", icon: "SprayCan" },
  { value: "laundry", label: "Lavanderia", icon: "Shirt" },
  // Tech & Electronics
  { value: "electronics_repair", label: "Assistência Técnica", icon: "Monitor" },
  { value: "cellphone_store", label: "Loja de Celulares", icon: "Smartphone" },
  // Print & Specialty
  { value: "print_shop", label: "Gráfica / Impressão", icon: "Printer" },
  { value: "florist", label: "Floricultura", icon: "Flower2" },
  { value: "pharmacy", label: "Farmácia / Drogaria", icon: "Pill" },
  { value: "travel_agency", label: "Agência de Viagens", icon: "Plane" },
  { value: "delivery_business", label: "Delivery", icon: "Truck" },
  // Generic
  { value: "product_shelf", label: "Prateleira de Produto", icon: "Package" },
  { value: "other", label: "Outro", icon: "MoreHorizontal" },
] as const;

export type BusinessCategoryInfo = (typeof BUSINESS_CATEGORIES)[number];

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
