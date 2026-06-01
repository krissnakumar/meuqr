// ============================================
// MeuQR Business OS — Onboarding Helpers
// ============================================

/**
 * Vertical configuration for the onboarding wizard UI.
 * Each vertical has a user-friendly label, icon, description, and emoji.
 */
export const VERTICAL_CONFIGS: Record<string, {
  label: string;
  icon: string;
  emoji: string;
  description: string;
  color: string;
  subverticals: Record<string, string>;
}> = {
  health: {
    label: 'Saúde',
    icon: 'HeartPulse',
    emoji: '🏥',
    description: 'Clínicas, consultórios e profissionais de saúde',
    color: 'from-red-500 to-rose-600',
    subverticals: {
      medical_clinic: 'Clínica Médica',
      dental_clinic: 'Clínica Odontológica',
      physiotherapy: 'Fisioterapia',
      psychology: 'Consultório de Psicologia',
      veterinary: 'Clínica Veterinária',
      nutritionist: 'Nutricionista',
      eye_clinic: 'Clínica Oftalmológica',
      speech_therapy: 'Fonoaudiologia',
      chiropractic: 'Quiropraxia',
    },
  },
  beauty_wellness: {
    label: 'Beleza & Bem-Estar',
    icon: 'Sparkles',
    emoji: '💇',
    description: 'Salões, barbearias, spas e estúdios',
    color: 'from-pink-500 to-purple-600',
    subverticals: {
      beauty_salon: 'Salão de Beleza',
      barber_shop: 'Barbearia',
      nail_studio: 'Estúdio de Unhas',
      spa: 'Spa & Massagem',
      massage_therapist: 'Massoterapeuta',
      tattoo_studio: 'Estúdio de Tatuagem',
      aesthetic_clinic: 'Clínica Estética',
      laser_clinic: 'Clínica de Laser',
    },
  },
  food_beverage: {
    label: 'Alimentação & Bebidas',
    icon: 'UtensilsCrossed',
    emoji: '🍽️',
    description: 'Restaurantes, cafés, padarias e bares',
    color: 'from-orange-500 to-amber-600',
    subverticals: {
      restaurant: 'Restaurante',
      cafe: 'Cafeteria',
      bakery: 'Padaria & Confeitaria',
      pizza_shop: 'Pizzaria',
      burger_shop: 'Hamburgueria',
      food_truck: 'Food Truck',
      ice_cream_shop: 'Sorveteria',
      bar_pub: 'Bar & Pub',
    },
  },
  construction: {
    label: 'Construção & Reforma',
    icon: 'Building2',
    emoji: '🏗️',
    description: 'Lojas de materiais e acabamentos',
    color: 'from-blue-600 to-indigo-700',
    subverticals: {
      construction_materials: 'Material de Construção',
      paint_store: 'Loja de Tintas',
      electrical_store: 'Materiais Elétricos',
      plumbing_store: 'Materiais Hidráulicos',
      hardware_store: 'Loja de Ferragens',
      flooring_store: 'Loja de Pisos',
      tool_rental: 'Locadora de Ferramentas',
    },
  },
  retail: {
    label: 'Varejo & Lojas',
    icon: 'ShoppingBag',
    emoji: '🛍️',
    description: 'Lojas de roupas, calçados e presentes',
    color: 'from-emerald-500 to-teal-600',
    subverticals: {
      clothing_store: 'Loja de Roupas',
      shoe_store: 'Loja de Calçados',
      jewelry_store: 'Joalheria',
      electronics_store: 'Loja de Eletrônicos',
      toy_store: 'Loja de Brinquedos',
      pet_store: 'Pet Shop',
      gift_shop: 'Loja de Presentes',
      furniture_store: 'Loja de Móveis',
      supermarket: 'Supermercado',
      pharmacy: 'Farmácia',
    },
  },
  automotive: {
    label: 'Automotivo',
    icon: 'Car',
    emoji: '🚗',
    description: 'Oficinas, lava-rápidos e auto peças',
    color: 'from-slate-600 to-slate-800',
    subverticals: {
      auto_repair: 'Oficina Mecânica',
      car_wash: 'Lava Rápido',
      tire_shop: 'Borracheiro',
      auto_parts: 'Loja de Auto Peças',
      motorcycle_shop: 'Loja de Motos',
      detailing_studio: 'Detalhamento',
    },
  },
  real_estate: {
    label: 'Imobiliário',
    icon: 'Home',
    emoji: '🏠',
    description: 'Imobiliárias, corretores e construtoras',
    color: 'from-violet-500 to-purple-700',
    subverticals: {
      real_estate_agency: 'Imobiliária',
      property_broker: 'Corretor Autônomo',
      property_manager: 'Administradora de Imóveis',
      vacation_rentals: 'Aluguel por Temporada',
      construction_developer: 'Construtora',
    },
  },
  hotels_tourism: {
    label: 'Hotéis & Turismo',
    icon: 'Hotel',
    emoji: '🏨',
    description: 'Hotéis, pousadas e agências de viagem',
    color: 'from-sky-500 to-blue-600',
    subverticals: {
      hotel: 'Hotel',
      hostel: 'Hostel',
      guest_house: 'Pousada',
      resort: 'Resort',
      travel_agency: 'Agência de Viagens',
      tour_guide: 'Guia Turístico',
    },
  },
  education: {
    label: 'Educação',
    icon: 'BookOpen',
    emoji: '📚',
    description: 'Escolas, cursos e centros de treinamento',
    color: 'from-green-500 to-emerald-700',
    subverticals: {
      school: 'Escola',
      language_school: 'Escola de Idiomas',
      training_center: 'Centro de Treinamento',
      tutor: 'Professor Particular',
      music_school: 'Escola de Música',
      dance_school: 'Escola de Dança',
      online_course: 'Criador de Cursos Online',
    },
  },
  professional_services: {
    label: 'Serviços Profissionais',
    icon: 'Briefcase',
    emoji: '💼',
    description: 'Advogados, contadores e consultores',
    color: 'from-amber-500 to-orange-600',
    subverticals: {
      lawyer: 'Advocacia',
      accountant: 'Contabilidade',
      consultant: 'Consultoria',
      architect: 'Arquitetura',
      engineer: 'Engenharia',
      insurance_agent: 'Corretor de Seguros',
      marketing_agency: 'Agência de Marketing',
    },
  },
  events: {
    label: 'Eventos',
    icon: 'Calendar',
    emoji: '🎉',
    description: 'Organizadores, fotógrafos e buffets',
    color: 'from-fuchsia-500 to-pink-600',
    subverticals: {
      wedding_planner: 'Cerimonialista',
      event_venue: 'Espaço para Eventos',
      photographer: 'Fotógrafo',
      dj: 'DJ',
      catering: 'Buffet',
      party_decorator: 'Decorador de Festas',
      event_organizer: 'Organizador de Eventos',
    },
  },
};

/**
 * Get a friendly description of what the workspace will include
 * for a given vertical/subvertical combination.
 */
export function getWorkspacePreview(
  verticalSlug: string,
  subverticalSlug?: string
): {
  pages: string[];
  modules: string[];
  description: string;
} {
  const config = VERTICAL_CONFIGS[verticalSlug];

  if (!config) {
    return {
      pages: ['Home', 'Contact'],
      modules: ['Pages', 'QR Codes', 'Inbox', 'Analytics'],
      description: 'A generic digital workspace',
    };
  }

  const subverticalName = subverticalSlug
    ? config.subverticals[subverticalSlug]
    : null;

  const pages = [
    'Home',
    'Services / Products',
    'Contact',
  ];

  const modules = [
    'Pages',
    'QR Codes',
    'Inbox',
    'Customers',
    'Analytics',
    'WhatsApp Actions',
  ];

  // Add vertical-specific items
  switch (verticalSlug) {
    case 'health':
    case 'beauty_wellness':
      pages.splice(1, 0, 'Book Appointment');
      modules.push('Appointments', 'Professionals');
      break;
    case 'food_beverage':
      pages.splice(1, 0, 'Menu');
      modules.push('Menu', 'Orders');
      break;
    case 'construction':
    case 'automotive':
      pages.splice(1, 0, 'Request Quote');
      modules.push('Products', 'Quote Requests');
      break;
    case 'retail':
      modules.push('Products', 'Orders');
      break;
    case 'real_estate':
      pages.splice(1, 0, 'Properties');
      modules.push('Properties', 'Leads');
      break;
    case 'hotels_tourism':
      pages.splice(1, 0, 'Rooms');
      modules.push('Bookings', 'Guest Portal');
      break;
    case 'education':
      pages.splice(1, 0, 'Courses');
      modules.push('Courses', 'Enrollments');
      break;
    case 'professional_services':
      pages.splice(1, 0, 'Book Consultation');
      modules.push('Appointments', 'Proposals');
      break;
    case 'events':
      modules.push('Packages', 'Portfolio', 'Bookings');
      break;
  }

  const businessName = subverticalName || config.label;

  return {
    pages,
    modules,
    description: `For ${businessName}, we'll create a complete digital workspace with ${pages.join(', ')} pages, and tools like ${modules.join(', ')}.`,
  };
}
