// ============================================
// MeuQR Business OS — Module Vendor Catalog
// Used for the "Add Features" page
// ============================================

export interface ModuleVendorInfo {
  slug: string;
  name: string;
  description: string;
  bestFor: string;
  icon: string;
  group: string;
  requiredPlan: 'free' | 'pro' | 'business';
}

/**
 * Friendly module catalog for non-technical users.
 * Used in the "Add Features" page to help users understand what each module does.
 */
export const MODULE_VENDOR_CATALOG: Record<string, ModuleVendorInfo> = {
  // --- Sell Online ---
  menu: {
    slug: 'menu',
    name: 'Digital Menu',
    description: 'Create a beautiful digital menu with categories, photos, and prices that customers can view on their phone.',
    bestFor: 'Restaurants, cafes, bars, pizzerias, and food trucks.',
    icon: 'UtensilsCrossed',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  products: {
    slug: 'products',
    name: 'Products Catalog',
    description: 'Add products with photos, prices, and descriptions so customers can browse and order.',
    bestFor: 'Restaurants, retail stores, construction materials, and any business selling physical items.',
    icon: 'Package',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  orders: {
    slug: 'orders',
    name: 'Orders',
    description: 'Receive and manage customer orders directly through WhatsApp. No app needed.',
    bestFor: 'Restaurants, bakeries, markets, and product-based businesses accepting WhatsApp orders.',
    icon: 'ShoppingCart',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  coupons: {
    slug: 'coupons',
    name: 'Coupons & Discounts',
    description: 'Create discount coupons and promotional codes to attract new customers.',
    bestFor: 'Retail stores, restaurants, and e-commerce businesses.',
    icon: 'TicketPercent',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  properties: {
    slug: 'properties',
    name: 'Properties',
    description: 'List properties with photos, prices, and details. Let customers browse and schedule visits.',
    bestFor: 'Real estate agencies, property brokers, and vacation rental managers.',
    icon: 'Home',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  courses: {
    slug: 'courses',
    name: 'Courses',
    description: 'Create and list your courses with descriptions, pricing, and enrollment forms.',
    bestFor: 'Schools, training centers, tutors, and online course creators.',
    icon: 'BookOpen',
    group: 'sell_online',
    requiredPlan: 'pro',
  },
  packages: {
    slug: 'packages',
    name: 'Packages & Bundles',
    description: 'Create service packages and bundles with combined pricing for special offers.',
    bestFor: 'Event planners, photographers, spas, and any business offering bundled services.',
    icon: 'Package',
    group: 'sell_online',
    requiredPlan: 'pro',
  },

  // --- Services ---
  services: {
    slug: 'services',
    name: 'Services',
    description: 'List your services with durations and prices so customers can see what you offer and book online.',
    bestFor: 'Clinics, salons, mechanics, consultants, and any service-based business.',
    icon: 'Briefcase',
    group: 'bookings',
    requiredPlan: 'free',
  },

  // --- Bookings ---
  appointments: {
    slug: 'appointments',
    name: 'Appointments',
    description: 'Let customers book appointments online. Get notified and manage your calendar from the dashboard.',
    bestFor: 'Clinics, dentists, salons, barbers, spas, and professional services.',
    icon: 'Calendar',
    group: 'bookings',
    requiredPlan: 'pro',
  },
  reservations: {
    slug: 'reservations',
    name: 'Reservations',
    description: 'Accept table reservations, room bookings, and event reservations online.',
    bestFor: 'Restaurants, hotels, event venues, and any business that takes reservations.',
    icon: 'CalendarCheck',
    group: 'bookings',
    requiredPlan: 'pro',
  },
  bookings: {
    slug: 'bookings',
    name: 'Bookings',
    description: 'Manage event bookings, room reservations, and service bookings in one place.',
    bestFor: 'Event venues, hotels, photographers, and service providers.',
    icon: 'CalendarDays',
    group: 'bookings',
    requiredPlan: 'pro',
  },
  tables: {
    slug: 'tables',
    name: 'Table Management',
    description: 'Manage table layouts and reservations for your restaurant or event space.',
    bestFor: 'Restaurants, event venues, and bars with table service.',
    icon: 'Table2',
    group: 'bookings',
    requiredPlan: 'pro',
  },
  professionals: {
    slug: 'professionals',
    name: 'Professionals / Staff',
    description: 'Add team profiles with photos, bios, and schedules so customers can choose who to book with.',
    bestFor: 'Clinics, salons, agencies, and any business with multiple service providers.',
    icon: 'UserCheck',
    group: 'bookings',
    requiredPlan: 'pro',
  },

  // --- Leads ---
  quote_requests: {
    slug: 'quote_requests',
    name: 'Quote Requests',
    description: 'Let customers request personalized quotes for products or services before buying.',
    bestFor: 'Construction stores, automotive shops, events, and custom service businesses.',
    icon: 'ClipboardList',
    group: 'leads',
    requiredPlan: 'free',
  },
  leads: {
    slug: 'leads',
    name: 'Lead Capture',
    description: 'Capture and manage customer inquiries and leads from your public pages.',
    bestFor: 'Real estate, education, professional services, and any business generating leads.',
    icon: 'UserPlus',
    group: 'leads',
    requiredPlan: 'free',
  },
  forms: {
    slug: 'forms',
    name: 'Custom Forms',
    description: 'Create contact forms, intake forms, surveys, and registration forms to capture customer information.',
    bestFor: 'Any business that needs to collect information from customers or leads.',
    icon: 'FileSpreadsheet',
    group: 'leads',
    requiredPlan: 'pro',
  },
  proposals: {
    slug: 'proposals',
    name: 'Proposals',
    description: 'Create and send professional proposals and service agreements to your clients.',
    bestFor: 'Consultants, agencies, architects, and professional service providers.',
    icon: 'FileSignature',
    group: 'leads',
    requiredPlan: 'business',
  },

  // --- Marketing ---
  campaigns: {
    slug: 'campaigns',
    name: 'Campaigns',
    description: 'Create and manage promotional campaigns, seasonal offers, and special events.',
    bestFor: 'Retail stores, restaurants, and any business running promotions.',
    icon: 'Megaphone',
    group: 'marketing',
    requiredPlan: 'business',
  },
  loyalty: {
    slug: 'loyalty',
    name: 'Loyalty Program',
    description: 'Reward repeat customers with points, discounts, and special offers to keep them coming back.',
    bestFor: 'Salons, cafes, pet shops, retail stores, and any business with repeat customers.',
    icon: 'Gift',
    group: 'marketing',
    requiredPlan: 'pro',
  },
  reviews: {
    slug: 'reviews',
    name: 'Reviews & Testimonials',
    description: 'Collect and display customer reviews and testimonials on your public pages.',
    bestFor: 'Any business that wants to build trust and social proof.',
    icon: 'Star',
    group: 'marketing',
    requiredPlan: 'free',
  },
  portfolio: {
    slug: 'portfolio',
    name: 'Portfolio / Gallery',
    description: 'Showcase your work with a beautiful image gallery on your public page.',
    bestFor: 'Photographers, tattoo artists, beauty salons, event planners, and creative professionals.',
    icon: 'Image',
    group: 'marketing',
    requiredPlan: 'free',
  },

  // --- Operations ---
  documents: {
    slug: 'documents',
    name: 'Documents',
    description: 'Upload and share PDFs, price lists, catalogs, contracts, and other documents with customers.',
    bestFor: 'Clinics, construction stores, real estate, and professional services.',
    icon: 'FileText',
    group: 'operations',
    requiredPlan: 'business',
  },
  delivery_requests: {
    slug: 'delivery_requests',
    name: 'Delivery Management',
    description: 'Let customers request deliveries and track their delivery status.',
    bestFor: 'Construction stores, furniture stores, and any business offering delivery.',
    icon: 'Truck',
    group: 'operations',
    requiredPlan: 'pro',
  },
  vehicle_records: {
    slug: 'vehicle_records',
    name: 'Vehicle Records',
    description: 'Track customer vehicles, service history, and maintenance schedules.',
    bestFor: 'Auto repair shops, mechanics, and automotive service centers.',
    icon: 'Car',
    group: 'operations',
    requiredPlan: 'pro',
  },
  service_orders: {
    slug: 'service_orders',
    name: 'Service Orders',
    description: 'Manage work orders, assign tasks to staff, and track service progress.',
    bestFor: 'Auto repair shops, maintenance services, and field service businesses.',
    icon: 'Wrench',
    group: 'operations',
    requiredPlan: 'pro',
  },
  staff: {
    slug: 'staff',
    name: 'Staff Management',
    description: 'Add team members, assign roles, and manage permissions for your business.',
    bestFor: 'Growing businesses with multiple employees or collaborators.',
    icon: 'UsersRound',
    group: 'operations',
    requiredPlan: 'business',
  },

  // --- Hospitality ---
  guest_portal: {
    slug: 'guest_portal',
    name: 'Guest Portal',
    description: 'Create a digital guest portal with room information, services, and local guides.',
    bestFor: 'Hotels, hostels, pousadas, and resorts.',
    icon: 'Hotel',
    group: 'operations',
    requiredPlan: 'business',
  },
  room_service: {
    slug: 'room_service',
    name: 'Room Service',
    description: 'Let guests order room service, request amenities, and contact reception from their phone.',
    bestFor: 'Hotels, resorts, and any accommodation offering in-room services.',
    icon: 'RoomService',
    group: 'operations',
    requiredPlan: 'business',
  },
  concierge: {
    slug: 'concierge',
    name: 'Concierge',
    description: 'Digital concierge service for guest requests, recommendations, and local information.',
    bestFor: 'Hotels, resorts, and luxury accommodations.',
    icon: 'ConciergeBell',
    group: 'operations',
    requiredPlan: 'business',
  },

  // --- Health ---
  patients: {
    slug: 'patients',
    name: 'Patient Records',
    description: 'Manage patient profiles, medical history, and treatment records securely.',
    bestFor: 'Medical clinics, dental clinics, and healthcare providers.',
    icon: 'HeartPulse',
    group: 'operations',
    requiredPlan: 'pro',
  },
  treatments: {
    slug: 'treatments',
    name: 'Treatments',
    description: 'Create and manage treatment plans, procedures, and pricing.',
    bestFor: 'Dental clinics, medical clinics, and physiotherapy centers.',
    icon: 'Stethoscope',
    group: 'operations',
    requiredPlan: 'pro',
  },

  // --- Education ---
  enrollments: {
    slug: 'enrollments',
    name: 'Enrollments',
    description: 'Handle student registrations, enrollments, and course sign-ups online.',
    bestFor: 'Schools, training centers, language schools, and course providers.',
    icon: 'GraduationCap',
    group: 'operations',
    requiredPlan: 'pro',
  },
  teachers: {
    slug: 'teachers',
    name: 'Teachers',
    description: 'Manage teacher profiles, specializations, and class schedules.',
    bestFor: 'Schools, music schools, dance studios, and training centers.',
    icon: 'ChalkboardTeacher',
    group: 'operations',
    requiredPlan: 'pro',
  },
};

/**
 * Get all modules in a group for the Add Features page.
 */
export function getModulesByGroup(group: string): ModuleVendorInfo[] {
  return Object.values(MODULE_VENDOR_CATALOG).filter(m => m.group === group);
}

/**
 * Get module groups with their display info.
 */
export const MODULE_GROUPS: Record<string, { label: string; description: string; icon: string }> = {
  sell_online: {
    label: 'Sell Online',
    description: 'Product catalogs, menus, orders, and payments',
    icon: 'ShoppingCart',
  },
  bookings: {
    label: 'Take Bookings',
    description: 'Appointments, reservations, and scheduling',
    icon: 'Calendar',
  },
  leads: {
    label: 'Get More Leads',
    description: 'Forms, quotes, and proposal tools',
    icon: 'UserPlus',
  },
  marketing: {
    label: 'Marketing & Loyalty',
    description: 'Promotions, reviews, loyalty programs, and coupons',
    icon: 'Megaphone',
  },
  operations: {
    label: 'Operations',
    description: 'Staff, documents, deliveries, and business management',
    icon: 'Settings',
  },
};
