export type SectionType =
  | "hero"
  | "product_grid"
  | "service_list"
  | "menu_list"
  | "gallery"
  | "whatsapp_cta"
  | "quote_form"
  | "order_form"
  | "appointment_form"
  | "reviews"
  | "faq"
  | "business_hours"
  | "map_contact";

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
