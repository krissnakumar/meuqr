export type ModuleKey =
  | "overview"
  | "pages"
  | "qr_codes"
  | "whatsapp_actions"
  | "analytics"
  | "inbox"
  | "customers"
  | "settings"
  | "products"
  | "services"
  | "menu"
  | "appointments"
  | "orders"
  | "quote_requests"
  | "leads"
  | "patients"
  | "courses"
  | "hotel_concierge"
  | "loyalty"
  | "coupons";

export interface ModuleDTO {
  key: ModuleKey;
  name: string;
  description: string;
  icon: string;
  isCore: boolean;
  category: string;
}
