// ===== Enums =====

export type BusinessCategory =
  | "restaurant"
  | "construction_materials"
  | "salon"
  | "pet_shop"
  | "hotel"
  | "real_estate"
  | "event"
  | "clinic"
  | "gym"
  | "mechanic"
  | "freelancer"
  | "church"
  | "product_shelf"
  | "other";

export type SubscriptionTier = "free" | "pro" | "business";

export type QRCornerStyle = "square" | "extra-rounded" | "rounded" | "circle";

export type QRDotStyle = "square" | "rounded" | "classy" | "dots" | "extra-rounded";

export type ItemType = "product" | "service" | "combo";

// ===== Database Row Types =====

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  pix_key: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  instagram: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: "owner" | "admin" | "staff";
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string | null;
  preview_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Page {
  id: string;
  business_id: string;
  template_id: string | null;
  title: string;
  slug: string;
  is_published: boolean;
  custom_css: string | null;
  custom_js: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  name: string;
  slug: string;
  section_type: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  item_type: ItemType;
  is_available: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  business_id: string;
  page_id: string | null;
  short_code: string;
  title: string | null;
  destination_url: string | null;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export interface QRStyle {
  id: string;
  qr_code_id: string;
  dot_style: QRDotStyle;
  corner_style: QRCornerStyle;
  foreground_color: string;
  background_color: string;
  gradient: boolean;
  gradient_color: string | null;
  logo_url: string | null;
  margin: number;
  error_correction_level: "L" | "M" | "Q" | "H";
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  qr_code_id: string;
  page_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  created_at: string;
}

export interface Click {
  id: string;
  scan_id: string | null;
  qr_code_id: string | null;
  page_id: string | null;
  click_type: "whatsapp" | "pix" | "phone" | "instagram" | "website" | "maps" | "share" | "quote" | "order";
  created_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  page_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  business_id: string;
  page_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: { name: string; quantity: number }[];
  message: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  page_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  payment_method: string | null;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  order_id: string | null;
  subscription_id: string | null;
  amount: number;
  currency: string;
  provider: "mercado_pago" | "stripe";
  provider_payment_id: string | null;
  status: "pending" | "approved" | "rejected" | "refunded";
  created_at: string;
}

export interface Subscription {
  id: string;
  business_id: string;
  tier: SubscriptionTier;
  provider: "mercado_pago" | "stripe";
  provider_subscription_id: string | null;
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface StorageFile {
  id: string;
  business_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  uploaded_by: string;
  created_at: string;
}

// ===== API & View Types =====

export interface PublicPageData {
  business: Business;
  page: Page;
  sections: (Section & { items: Item[] })[];
  qr_codes: QRCode[];
}

export interface DashboardStats {
  total_scans: number;
  total_clicks: number;
  total_leads: number;
  total_quotes: number;
  scans_today: number;
  clicks_today: number;
}

export interface SubscriptionLimits {
  max_businesses: number;
  max_qrs: number;
  max_items: number;
  custom_qr: boolean;
  analytics: boolean;
  staff_members: boolean;
  api_access: boolean;
}

export type PlanConfig = {
  [key in SubscriptionTier]: SubscriptionLimits & {
    name: string;
    namePt: string;
    price_monthly: number;
    price_yearly: number;
  };
};
