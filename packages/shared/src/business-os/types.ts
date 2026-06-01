// ============================================
// MeuQR Business OS — Core Types
// ============================================

// ===== Verticals =====

export interface BusinessVertical {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  status: 'active' | 'inactive';
  default_modules: string[];
  default_pages: DefaultPage[];
  default_navigation: string[];
  recommended_modules: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessSubvertical {
  id: string;
  vertical_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  default_modules: string[];
  default_pages: DefaultPage[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DefaultPage {
  title: string;
  slug: string;
  page_type: PageType;
  show_in_navigation: boolean;
}

export type PageType =
  | 'home'
  | 'menu'
  | 'product_catalog'
  | 'services'
  | 'appointment_booking'
  | 'quote_request'
  | 'contact'
  | 'about'
  | 'gallery'
  | 'promotions'
  | 'professionals'
  | 'rooms'
  | 'properties'
  | 'courses'
  | 'packages'
  | 'portfolio'
  | 'guest_services'
  | 'local_guide'
  | 'delivery_info'
  | 'brands'
  | 'enrollment'
  | 'events'
  | 'teachers'
  | 'agents'
  | 'schedule_visit'
  | 'opening_hours'
  | 'location'
  | 'documents'
  | 'faq'
  | 'custom';

// ===== Modules =====

export interface Module {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: ModuleCategory;
  is_core: boolean;
  status: 'active' | 'inactive';
  required_plan: 'free' | 'pro' | 'business';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ModuleCategory =
  | 'core'
  | 'sell_online'
  | 'bookings'
  | 'leads'
  | 'marketing'
  | 'customer_mgmt'
  | 'staff'
  | 'health'
  | 'operations'
  | 'real_estate'
  | 'hospitality'
  | 'education'
  | 'automotive'
  | 'optional';

export interface BusinessEnabledModule {
  id: string;
  business_id: string;
  module_id: string;
  enabled: boolean;
  source: 'default_vertical' | 'user_enabled' | 'admin_enabled' | 'plan_enabled';
  created_at: string;
  updated_at: string;
}

// ===== Inbox =====

export interface InboxItem {
  id: string;
  business_id: string;
  customer_id: string | null;
  source_type: InboxSourceType;
  source_id: string | null;
  title: string;
  message: string | null;
  status: InboxStatus;
  priority: InboxPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export type InboxSourceType =
  | 'contact_form'
  | 'appointment'
  | 'quote_request'
  | 'booking'
  | 'product_inquiry'
  | 'whatsapp_click'
  | 'review'
  | 'document_request';

export type InboxStatus = 'new' | 'open' | 'waiting' | 'resolved' | 'archived';

export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent';

// ===== Customers / CRM =====

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tags: string[];
  source: string;
  last_interaction_at: string | null;
  total_visits: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

// ===== Analytics =====

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  page_id: string | null;
  qr_code_id: string | null;
  event_type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  visitor_id: string | null;
  device: string | null;
  referrer: string | null;
  created_at: string;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'qr_scan'
  | 'whatsapp_click'
  | 'product_click'
  | 'appointment_started'
  | 'appointment_submitted'
  | 'quote_submitted'
  | 'form_submitted';

// ===== Navigation Helpers =====

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  module_slug: string;
  is_core: boolean;
  match?: string;
}

// ===== WhatsApp Actions =====

export type WhatsAppActionType =
  | 'contact'
  | 'product_inquiry'
  | 'quote_request'
  | 'book_appointment'
  | 'confirm_appointment'
  | 'send_reminder'
  | 'ask_review'
  | 'ask_availability';

export interface WhatsAppActionParams {
  businessPhone: string;
  actionType: WhatsAppActionType;
  customerName?: string;
  productName?: string;
  serviceName?: string;
  pageTitle?: string;
  customMessage?: string;
}
