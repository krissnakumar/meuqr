export type SectionType =
  | "hero"
  | "product_grid"
  | "menu_list"
  | "menu"
  | "product_catalog"
  | "products"
  | "promotions"
  | "gallery"
  | "info"
  | "list"
  | "text"
  | "service_list"
  | "services"
  | "service"
  | "whatsapp_cta"
  | "whatsapp"
  | "quote_form"
  | "quote"
  | "quote_request"
  | "order_form"
  | "appointment_form"
  | "booking"
  | "appointment"
  | "appointment_booking"
  | "bookings"
  | "reviews"
  | "faq"
  | "business_hours"
  | "hours"
  | "opening_hours"
  | "map_contact"
  | "contact"
  | "schedule"
  | "events";

export interface PublicPage {
  id: string;
  businessId: string;
  title: string;
  slug: string;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOrService {
  id: string;
  sectionId: string;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  itemType: "product" | "service" | "combo";
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageSection {
  id: string;
  pageId: string;
  name: string;
  slug: string;
  sectionType: SectionType;
  sortOrder: number;
  isVisible: boolean;
  items: ProductOrService[];
}
