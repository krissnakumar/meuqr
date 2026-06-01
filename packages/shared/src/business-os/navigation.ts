// ============================================
// MeuQR Business OS — Dynamic Module Navigation
// ============================================

import type { NavigationItem } from './types';
import { VERTICAL_CONFIGS } from './onboarding';

/**
 * Module slug to navigation item mapping.
 * Each module maps to a sidebar navigation entry.
 */
const MODULE_NAVIGATION: Record<string, NavigationItem> = {
  overview: {
    label: 'Overview',
    href: '/dashboard/business/{id}',
    icon: 'LayoutDashboard',
    module_slug: 'overview',
    is_core: true,
    match: '/dashboard/business/{id}$',
  },
  pages: {
    label: 'Pages',
    href: '/dashboard/business/{id}/pages',
    icon: 'FileText',
    module_slug: 'pages',
    is_core: true,
    match: '/pages',
  },
  qr_codes: {
    label: 'QR Codes',
    href: '/dashboard/business/{id}/qr',
    icon: 'QrCode',
    module_slug: 'qr_codes',
    is_core: true,
    match: '/qr',
  },
  media_library: {
    label: 'Media',
    href: '/dashboard/business/{id}/media',
    icon: 'Image',
    module_slug: 'media_library',
    is_core: true,
    match: '/media',
  },
  inbox: {
    label: 'Inbox',
    href: '/dashboard/business/{id}/inbox',
    icon: 'MessageSquare',
    module_slug: 'inbox',
    is_core: true,
    match: '/inbox',
  },
  customers: {
    label: 'Customers',
    href: '/dashboard/business/{id}/customers',
    icon: 'Users',
    module_slug: 'customers',
    is_core: true,
    match: '/customers',
  },
  analytics: {
    label: 'Analytics',
    href: '/dashboard/business/{id}/analytics',
    icon: 'BarChart3',
    module_slug: 'analytics',
    is_core: true,
    match: '/analytics',
  },
  whatsapp_actions: {
    label: 'WhatsApp',
    href: '/dashboard/business/{id}/whatsapp',
    icon: 'MessageCircle',
    module_slug: 'whatsapp_actions',
    is_core: true,
    match: '/whatsapp',
  },
  reviews: {
    label: 'Reviews',
    href: '/dashboard/business/{id}/reviews',
    icon: 'Star',
    module_slug: 'reviews',
    is_core: true,
    match: '/reviews',
  },
  notifications: {
    label: 'Notifications',
    href: '/dashboard/business/{id}/notifications',
    icon: 'Bell',
    module_slug: 'notifications',
    is_core: true,
    match: '/notifications',
  },
  settings: {
    label: 'Settings',
    href: '/dashboard/business/{id}/setup',
    icon: 'Settings',
    module_slug: 'settings',
    is_core: true,
    match: '/setup',
  },
  billing: {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: 'CreditCard',
    module_slug: 'billing',
    is_core: true,
    match: '/billing',
  },
  // --- Optional modules ---
  products: {
    label: 'Products',
    href: '/dashboard/business/{id}/products',
    icon: 'Package',
    module_slug: 'products',
    is_core: false,
    match: '/products',
  },
  services: {
    label: 'Services',
    href: '/dashboard/business/{id}/services',
    icon: 'Briefcase',
    module_slug: 'services',
    is_core: false,
    match: '/services',
  },
  menu: {
    label: 'Menu',
    href: '/dashboard/business/{id}/menu',
    icon: 'UtensilsCrossed',
    module_slug: 'menu',
    is_core: false,
    match: '/menu',
  },
  appointments: {
    label: 'Appointments',
    href: '/dashboard/business/{id}/appointments',
    icon: 'Calendar',
    module_slug: 'appointments',
    is_core: false,
    match: '/appointments',
  },
  orders: {
    label: 'Orders',
    href: '/dashboard/business/{id}/orders',
    icon: 'ShoppingCart',
    module_slug: 'orders',
    is_core: false,
    match: '/orders',
  },
  reservations: {
    label: 'Reservations',
    href: '/dashboard/business/{id}/reservations',
    icon: 'CalendarCheck',
    module_slug: 'reservations',
    is_core: false,
    match: '/reservations',
  },
  quote_requests: {
    label: 'Quotes',
    href: '/dashboard/business/{id}/quote-requests',
    icon: 'ClipboardList',
    module_slug: 'quote_requests',
    is_core: false,
    match: '/quote-requests',
  },
  forms: {
    label: 'Forms',
    href: '/dashboard/business/{id}/forms',
    icon: 'FileSpreadsheet',
    module_slug: 'forms',
    is_core: false,
    match: '/forms',
  },
  campaigns: {
    label: 'Campaigns',
    href: '/dashboard/business/{id}/campaigns',
    icon: 'Megaphone',
    module_slug: 'campaigns',
    is_core: false,
    match: '/campaigns',
  },
  loyalty: {
    label: 'Loyalty',
    href: '/dashboard/business/{id}/loyalty',
    icon: 'Gift',
    module_slug: 'loyalty',
    is_core: false,
    match: '/loyalty',
  },
  coupons: {
    label: 'Coupons',
    href: '/dashboard/business/{id}/coupons',
    icon: 'TicketPercent',
    module_slug: 'coupons',
    is_core: false,
    match: '/coupons',
  },
  documents: {
    label: 'Documents',
    href: '/dashboard/business/{id}/documents',
    icon: 'FileText',
    module_slug: 'documents',
    is_core: false,
    match: '/documents',
  },
  staff: {
    label: 'Staff',
    href: '/dashboard/business/{id}/staff',
    icon: 'UsersRound',
    module_slug: 'staff',
    is_core: false,
    match: '/staff',
  },
  professionals: {
    label: 'Professionals',
    href: '/dashboard/business/{id}/professionals',
    icon: 'UserCheck',
    module_slug: 'professionals',
    is_core: false,
    match: '/professionals',
  },
  patients: {
    label: 'Patients',
    href: '/dashboard/business/{id}/patients',
    icon: 'HeartPulse',
    module_slug: 'patients',
    is_core: false,
    match: '/patients',
  },
  treatments: {
    label: 'Treatments',
    href: '/dashboard/business/{id}/treatments',
    icon: 'Stethoscope',
    module_slug: 'treatments',
    is_core: false,
    match: '/treatments',
  },
  properties: {
    label: 'Properties',
    href: '/dashboard/business/{id}/properties',
    icon: 'Home',
    module_slug: 'properties',
    is_core: false,
    match: '/properties',
  },
  leads: {
    label: 'Leads',
    href: '/dashboard/business/{id}/leads',
    icon: 'UserPlus',
    module_slug: 'leads',
    is_core: false,
    match: '/leads',
  },
  courses: {
    label: 'Courses',
    href: '/dashboard/business/{id}/courses',
    icon: 'BookOpen',
    module_slug: 'courses',
    is_core: false,
    match: '/courses',
  },
  enrollments: {
    label: 'Enrollments',
    href: '/dashboard/business/{id}/enrollments',
    icon: 'GraduationCap',
    module_slug: 'enrollments',
    is_core: false,
    match: '/enrollments',
  },
  teachers: {
    label: 'Teachers',
    href: '/dashboard/business/{id}/teachers',
    icon: 'ChalkboardTeacher',
    module_slug: 'teachers',
    is_core: false,
    match: '/teachers',
  },
  packages: {
    label: 'Packages',
    href: '/dashboard/business/{id}/packages',
    icon: 'Package',
    module_slug: 'packages',
    is_core: false,
    match: '/packages',
  },
  bookings: {
    label: 'Bookings',
    href: '/dashboard/business/{id}/bookings',
    icon: 'CalendarDays',
    module_slug: 'bookings',
    is_core: false,
    match: '/bookings',
  },
  portfolio: {
    label: 'Portfolio',
    href: '/dashboard/business/{id}/portfolio',
    icon: 'Image',
    module_slug: 'portfolio',
    is_core: false,
    match: '/portfolio',
  },
  guest_portal: {
    label: 'Guest Portal',
    href: '/dashboard/business/{id}/guest-portal',
    icon: 'Hotel',
    module_slug: 'guest_portal',
    is_core: false,
    match: '/guest-portal',
  },
  room_service: {
    label: 'Room Service',
    href: '/dashboard/business/{id}/room-service',
    icon: 'RoomService',
    module_slug: 'room_service',
    is_core: false,
    match: '/room-service',
  },
  concierge: {
    label: 'Concierge',
    href: '/dashboard/business/{id}/concierge',
    icon: 'ConciergeBell',
    module_slug: 'concierge',
    is_core: false,
    match: '/concierge',
  },
  delivery_requests: {
    label: 'Deliveries',
    href: '/dashboard/business/{id}/deliveries',
    icon: 'Truck',
    module_slug: 'delivery_requests',
    is_core: false,
    match: '/deliveries',
  },
  vehicle_records: {
    label: 'Vehicles',
    href: '/dashboard/business/{id}/vehicles',
    icon: 'Car',
    module_slug: 'vehicle_records',
    is_core: false,
    match: '/vehicles',
  },
  service_orders: {
    label: 'Service Orders',
    href: '/dashboard/business/{id}/service-orders',
    icon: 'Wrench',
    module_slug: 'service_orders',
    is_core: false,
    match: '/service-orders',
  },
  proposals: {
    label: 'Proposals',
    href: '/dashboard/business/{id}/proposals',
    icon: 'FileSignature',
    module_slug: 'proposals',
    is_core: false,
    match: '/proposals',
  },
  members: {
    label: 'Team',
    href: '/dashboard/business/{id}/members',
    icon: 'UsersRound',
    module_slug: 'members',
    is_core: false,
    match: '/members',
  },
  clients: {
    label: 'Clients',
    href: '/dashboard/business/{id}/clients',
    icon: 'Users',
    module_slug: 'clients',
    is_core: false,
    match: '/clients',
  },
};

/**
 * Get navigation items for a business based on its enabled modules.
 * Replaces {id} with the actual business ID in href and match patterns.
 * 
 * @param businessId - The business UUID
 * @param enabledModuleSlugs - Array of enabled module slugs
 * @returns Array of navigation items
 */
export function getNavigationForBusiness(
  businessId: string,
  enabledModuleSlugs: string[],
  category?: string
): NavigationItem[] {
  const navItems: NavigationItem[] = [];

  // Find the vertical slug if category is provided
  let verticalSlug = '';
  if (category) {
    for (const [vSlug, config] of Object.entries(VERTICAL_CONFIGS)) {
      if (category in config.subverticals || vSlug === category) {
        verticalSlug = vSlug;
        break;
      }
    }
  }

  // Core slugs that must always be visible (the main desktop)
  const coreSlugs = ['overview', 'pages', 'qr_codes', 'inbox', 'customers', 'analytics'];

  let orderedSlugs: string[] = [];

  if (verticalSlug) {
    // Vertical-specific navigation ordering
    const VERTICAL_NAV_ORDER: Record<string, string[]> = {
      health: ['overview', 'pages', 'appointments', 'services', 'professionals', 'patients', 'treatments', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      beauty_wellness: ['overview', 'pages', 'appointments', 'services', 'professionals', 'packages', 'loyalty', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      food_beverage: ['overview', 'pages', 'menu', 'products', 'orders', 'reservations', 'tables', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      construction: ['overview', 'pages', 'products', 'quote_requests', 'documents', 'delivery_requests', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      retail: ['overview', 'pages', 'products', 'orders', 'coupons', 'loyalty', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      automotive: ['overview', 'pages', 'appointments', 'services', 'quote_requests', 'service_orders', 'vehicle_records', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      real_estate: ['overview', 'pages', 'properties', 'leads', 'appointments', 'forms', 'documents', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      hotels_tourism: ['overview', 'pages', 'bookings', 'guest_portal', 'room_service', 'concierge', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      education: ['overview', 'pages', 'courses', 'enrollments', 'teachers', 'events', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      professional_services: ['overview', 'pages', 'appointments', 'services', 'leads', 'forms', 'documents', 'proposals', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
      events: ['overview', 'pages', 'packages', 'bookings', 'portfolio', 'quote_requests', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    };

    orderedSlugs = VERTICAL_NAV_ORDER[verticalSlug] || [
      ...coreSlugs,
      'settings'
    ];

    // Append any enabled modules that are not in the vertical order
    const extraModules = enabledModuleSlugs.filter(slug => !orderedSlugs.includes(slug));
    // Insert them before 'settings'
    const settingsIdx = orderedSlugs.indexOf('settings');
    if (settingsIdx !== -1) {
      orderedSlugs.splice(settingsIdx, 0, ...extraModules);
    } else {
      orderedSlugs.push(...extraModules, 'settings');
    }
  } else {
    // Default fallback ordering
    const optionalModules = enabledModuleSlugs.filter(
      slug => !coreSlugs.includes(slug)
    );
    orderedSlugs = [
      ...coreSlugs,
      ...optionalModules,
      'settings',
    ];
  }

  for (const slug of orderedSlugs) {
    const nav = MODULE_NAVIGATION[slug];
    if (nav && (coreSlugs.includes(slug) || slug === 'settings' || enabledModuleSlugs.includes(slug))) {
      navItems.push({
        ...nav,
        href: nav.href.replace('{id}', businessId),
        match: nav.match?.replace('{id}', businessId) || '',
      });
    }
  }

  return navItems;
}

/**
 * Get icon component name for a given module slug.
 */
export function getModuleIcon(moduleSlug: string): string {
  return MODULE_NAVIGATION[moduleSlug]?.icon || 'Package';
}

/**
 * Get all available modules with their navigation metadata.
 */
export function getAllModuleNavigation(): Record<string, NavigationItem> {
  return MODULE_NAVIGATION;
}

/**
 * Get navigation items grouped by category for the "Add Features" page.
 */
export function getModuleGroups(): Record<string, { label: string; description: string; modules: NavigationItem[] }> {
  return {
    sell_online: {
      label: 'Sell Online',
      description: 'Accept orders and payments online',
      modules: ['products', 'orders', 'menu', 'coupons', 'loyalty']
        .map(slug => MODULE_NAVIGATION[slug])
        .filter(Boolean),
    },
    bookings: {
      label: 'Take Bookings',
      description: 'Let customers book appointments and reservations',
      modules: ['appointments', 'reservations', 'bookings', 'services', 'professionals']
        .map(slug => MODULE_NAVIGATION[slug])
        .filter(Boolean),
    },
    leads: {
      label: 'Get More Leads',
      description: 'Capture and manage customer inquiries',
      modules: ['quote_requests', 'forms', 'campaigns', 'leads', 'proposals']
        .map(slug => MODULE_NAVIGATION[slug])
        .filter(Boolean),
    },
    customer_mgmt: {
      label: 'Manage Customers',
      description: 'Build relationships with your customers',
      modules: ['customers', 'inbox', 'documents', 'reviews', 'loyalty']
        .map(slug => MODULE_NAVIGATION[slug])
        .filter(Boolean),
    },
    operations: {
      label: 'Operations',
      description: 'Streamline your daily operations',
      modules: ['delivery_requests', 'vehicle_records', 'service_orders', 'staff']
        .map(slug => MODULE_NAVIGATION[slug])
        .filter(Boolean),
    },
  };
}

/**
 * Get navigation for a specific vertical based on its default_navigation config.
 * Falls back to the module-based navigation if the vertical slug is not recognized.
 * 
 * @param verticalSlug - The vertical slug (e.g. 'health', 'food_beverage', 'construction')
 * @param enabledModuleSlugs - Array of enabled module slugs for the business
 * @param businessId - Optional business ID for replacing {id} in hrefs
 * @returns Array of navigation items ordered according to the vertical's default_navigation
 */
export function getNavigationForVertical(
  verticalSlug: string,
  enabledModuleSlugs: string[],
  businessId?: string
): NavigationItem[] {
  // Vertical-specific navigation ordering
  const VERTICAL_NAV_ORDER: Record<string, string[]> = {
    health: ['overview', 'pages', 'appointments', 'services', 'professionals', 'patients', 'treatments', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    beauty_wellness: ['overview', 'pages', 'appointments', 'services', 'professionals', 'packages', 'loyalty', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    food_beverage: ['overview', 'pages', 'menu', 'products', 'orders', 'reservations', 'tables', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    construction: ['overview', 'pages', 'products', 'quote_requests', 'documents', 'delivery_requests', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    retail: ['overview', 'pages', 'products', 'orders', 'coupons', 'loyalty', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    automotive: ['overview', 'pages', 'appointments', 'services', 'quote_requests', 'service_orders', 'vehicle_records', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    real_estate: ['overview', 'pages', 'properties', 'leads', 'appointments', 'forms', 'documents', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    hotels_tourism: ['overview', 'pages', 'bookings', 'guest_portal', 'room_service', 'concierge', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    education: ['overview', 'pages', 'courses', 'enrollments', 'teachers', 'events', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    professional_services: ['overview', 'pages', 'appointments', 'services', 'leads', 'forms', 'documents', 'proposals', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
    events: ['overview', 'pages', 'packages', 'bookings', 'portfolio', 'quote_requests', 'inbox', 'customers', 'qr_codes', 'analytics', 'settings'],
  };

  // Get the navigation order for this vertical, or use default ordering
  const navOrder = VERTICAL_NAV_ORDER[verticalSlug] || [
    'overview', 'pages', 'qr_codes', 'inbox', 'customers', 'analytics', 'settings'
  ];

  const navItems: NavigationItem[] = [];
  const coreSlugs = ['overview', 'pages', 'qr_codes', 'inbox', 'customers', 'analytics', 'settings'];

  for (const slug of navOrder) {
    const nav = MODULE_NAVIGATION[slug];
    if (nav && (coreSlugs.includes(slug) || enabledModuleSlugs.includes(slug))) {
      navItems.push({
        ...nav,
        href: businessId ? nav.href.replace('{id}', businessId) : nav.href,
        match: businessId ? (nav.match?.replace('{id}', businessId) || '') : (nav.match || ''),
      });
    }
  }

  return navItems;
}
