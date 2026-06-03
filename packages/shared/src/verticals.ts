// ============================================
// MeuQR Business OS — Central Verticals Configuration
// ============================================

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: "boolean" | "text" | "select";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface SampleProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  itemType: "product" | "service";
}

export interface VerticalConfig {
  id: string;
  name: string;
  description: string;
  defaultModules: string[];
  hiddenModules: string[];
  dashboardMenuItems: string[];
  publicPageSections: string[];
  defaultTemplate: string;
  sampleProducts: SampleProduct[];
  onboardingQuestions: OnboardingQuestion[];
}

export const VERTICALS_CONFIG: Record<string, VerticalConfig> = {
  food_beverage: {
    id: "food_beverage",
    name: "Restaurante / Alimentação",
    description: "Restaurantes, pizzarias, hamburguerias, cafeterias e bares",
    defaultModules: ["menu", "orders", "whatsapp_actions", "coupons", "loyalty", "analytics"],
    hiddenModules: ["appointments", "patients", "properties", "courses", "guest_portal", "room_service", "concierge", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "menu", "orders", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "menu_list", "order_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "restaurant_modern",
    onboardingQuestions: [
      {
        id: "delivery_available",
        question: "Oferece serviço de entrega (Delivery)?",
        type: "boolean",
        required: true,
      },
      {
        id: "pickup_available",
        question: "Permite retirada no local (Takeaway)?",
        type: "boolean",
        required: true,
      },
      {
        id: "main_category",
        question: "Qual é a categoria principal de comida?",
        type: "select",
        options: ["Pizzaria", "Hamburgueria", "Comida Japonesa", "Comida Brasileira", "Cafeteria", "Doces & Confeitaria", "Outros"],
        required: true,
        placeholder: "Selecione uma opção",
      }
    ],
    sampleProducts: [
      {
        name: "Pizza Marguerita Especial",
        description: "Molho de tomate artesanal, muçarela, tomate cereja, manjericão fresco e azeite extravirgem.",
        price: 49.90,
        itemType: "product"
      },
      {
        name: "Burger Smash Duplo",
        description: "Dois blends smash de 80g, queijo cheddar derretido, maionese da casa no pão brioche selado.",
        price: 28.90,
        itemType: "product"
      },
      {
        name: "Batata Frita Rústica",
        description: "Batatas fritas com casca, salpicadas com alecrim fresco e alho confitado.",
        price: 15.00,
        itemType: "product"
      }
    ]
  },
  construction: {
    id: "construction",
    name: "Material de Construção",
    description: "Lojas de materiais de construção, ferragens, tintas e acabamentos",
    defaultModules: ["products", "quote_requests", "whatsapp_actions", "customers", "orders", "analytics"],
    hiddenModules: ["appointments", "patients", "courses", "guest_portal", "room_service", "concierge", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "products", "quote_requests", "orders", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "product_grid", "quote_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "construction_shop",
    onboardingQuestions: [
      {
        id: "sell_by_quote",
        question: "Trabalha com orçamentos personalizados via WhatsApp?",
        type: "boolean",
        required: true,
      },
      {
        id: "deliver_materials",
        question: "Realiza entrega de materiais pesados (areia, cimento, tijolo)?",
        type: "boolean",
        required: true,
      },
      {
        id: "main_category",
        question: "Qual o nicho principal da sua loja?",
        type: "select",
        options: ["Material Básico", "Acabamentos & Revestimentos", "Ferragens & Ferramentas", "Tintas & Pintura", "Materiais Elétricos & Hidráulicos", "Geral"],
        required: true,
        placeholder: "Selecione o nicho",
      }
    ],
    sampleProducts: [
      {
        name: "Cimento Votoran CP-II 50kg",
        description: "Cimento de alta qualidade, ideal para reboco, concreto e assentamento.",
        price: 38.90,
        itemType: "product"
      },
      {
        name: "Areia Média Lavada Saco 20kg",
        description: "Areia limpa ensacada de excelente qualidade para preparação de argamassas e concreto.",
        price: 9.50,
        itemType: "product"
      },
      {
        name: "Tijolo Cerâmico 8 Furos 9x19x19cm (Milheiro)",
        description: "Tijolo cerâmico ideal para alvenaria de vedação. Preço por lote de 1000 unidades.",
        price: 1200.00,
        itemType: "product"
      }
    ]
  },
  health: {
    id: "health",
    name: "Clínica / Dentista",
    description: "Consultórios médicos, odontológicos, clínicas e profissionais de saúde",
    defaultModules: ["services", "appointments", "patients", "whatsapp_actions", "reviews", "analytics"],
    hiddenModules: ["products", "orders", "menu", "courses", "guest_portal", "room_service", "concierge", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "appointments", "services", "patients", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "appointment_form", "whatsapp_cta", "reviews", "business_hours"],
    defaultTemplate: "health_clinic",
    onboardingQuestions: [
      {
        id: "appointment_required",
        question: "Atendimento somente com agendamento prévio?",
        type: "boolean",
        required: true,
      },
      {
        id: "telemedicine",
        question: "Oferece consultas por telemedicina?",
        type: "boolean",
        required: true,
      },
      {
        id: "health_specialty",
        question: "Qual a especialidade principal da clínica?",
        type: "select",
        options: ["Odontologia", "Clínica Médica Geral", "Pediatria", "Fisioterapia", "Psicologia", "Nutrição", "Outros"],
        required: true,
        placeholder: "Selecione a especialidade",
      }
    ],
    sampleProducts: [
      {
        name: "Consulta Odontológica Inicial",
        description: "Avaliação completa da saúde bucal com raio-x de diagnóstico incluso.",
        price: 150.00,
        itemType: "service"
      },
      {
        name: "Limpeza Profilática Completa",
        description: "Remoção de tártaro, aplicação de flúor e polimento coronário.",
        price: 120.00,
        itemType: "service"
      }
    ]
  },
  beauty_wellness: {
    id: "beauty_wellness",
    name: "Salão de Beleza / Estética",
    description: "Salões de beleza, barbearias, spas, clínicas de estética e estúdios",
    defaultModules: ["services", "appointments", "whatsapp_actions", "reviews", "analytics"],
    hiddenModules: ["products", "orders", "menu", "courses", "guest_portal", "room_service", "concierge", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "appointments", "services", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "appointment_form", "whatsapp_cta", "reviews", "business_hours"],
    defaultTemplate: "beauty_salon",
    onboardingQuestions: [
      {
        id: "accepts_walkins",
        question: "Aceita clientes sem agendamento (por ordem de chegada)?",
        type: "boolean",
        required: true,
      },
      {
        id: "beauty_niche",
        question: "Qual o foco principal do estabelecimento?",
        type: "select",
        options: ["Cabelo & Barba", "Estética Corporal & Facial", "Unhas (Manicure/Pedicure)", "Spa & Massagem", "Geral"],
        required: true,
        placeholder: "Selecione o foco",
      }
    ],
    sampleProducts: [
      {
        name: "Corte de Cabelo Masculino / Degradê",
        description: "Corte moderno com lavagem inclusa e finalização com pomada modeladora.",
        price: 60.00,
        itemType: "service"
      },
      {
        name: "Pé e Mão (Manicure & Pedicure)",
        description: "Cuidado completo para as unhas com esmaltação tradicional inclusa.",
        price: 55.00,
        itemType: "service"
      },
      {
        name: "Design de Sobrancelha com Henna",
        description: "Marcação geométrica de acordo com o rosto e aplicação de henna natural.",
        price: 45.00,
        itemType: "service"
      }
    ]
  },
  professional_services: {
    id: "professional_services",
    name: "Prestador de Serviços",
    description: "Advogados, contadores, consultores, eletricistas, encanadores e TI",
    defaultModules: ["services", "appointments", "quote_requests", "whatsapp_actions", "analytics"],
    hiddenModules: ["menu", "orders", "courses", "guest_portal", "room_service", "concierge", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "appointments", "services", "quote_requests", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "quote_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "professional_services",
    onboardingQuestions: [
      {
        id: "work_on_site",
        question: "Atende no local do cliente (à domicílio)?",
        type: "boolean",
        required: true,
      },
      {
        id: "service_type",
        question: "Qual o seu ramo de atuação?",
        type: "select",
        options: ["Eletricista / Encanador", "Contabilidade / Finanças", "Advocacia / Jurídico", "Limpeza / Doméstico", "TI & Suporte Técnico", "Consultoria / Coach", "Outro"],
        required: true,
        placeholder: "Selecione o ramo",
      }
    ],
    sampleProducts: [
      {
        name: "Visita Técnica para Orçamento",
        description: "Deslocamento e avaliação no local para elaboração de orçamento detalhado.",
        price: 80.00,
        itemType: "service"
      },
      {
        name: "Consultoria Inicial de Negócios (50min)",
        description: "Análise diagnóstica inicial para identificação de gargalos operacionais.",
        price: 250.00,
        itemType: "service"
      }
    ]
  },
  real_estate: {
    id: "real_estate",
    name: "Imobiliária",
    description: "Imobiliárias, corretores autônomos, construtoras e aluguel de temporada",
    defaultModules: ["properties", "leads", "whatsapp_actions", "analytics"],
    hiddenModules: ["menu", "orders", "appointments", "courses", "guest_portal", "room_service", "concierge", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "properties", "leads", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "product_grid", "quote_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "real_estate_showcase",
    onboardingQuestions: [
      {
        id: "rental_only",
        question: "Trabalha apenas com locação de imóveis?",
        type: "boolean",
        required: true,
      },
      {
        id: "brokerage_creci",
        question: "Possui registro CRECI ativo?",
        type: "boolean",
        required: true,
      },
      {
        id: "primary_region",
        question: "Qual é a sua região de atuação principal?",
        type: "text",
        required: true,
        placeholder: "Ex: Grande São Paulo, Zona Sul...",
      }
    ],
    sampleProducts: [
      {
        name: "Apartamento 2 Quartos - Centro",
        description: "Lindo apartamento mobiliado, com suíte, varanda gourmet e 1 vaga de garagem no coração da cidade.",
        price: 380000.00,
        itemType: "product"
      },
      {
        name: "Casa Residencial - Jardim América",
        description: "Excelente casa com 3 suítes, piscina privativa, churrasqueira e quintal amplo em bairro nobre.",
        price: 750000.00,
        itemType: "product"
      }
    ]
  },
  hotels_tourism: {
    id: "hotels_tourism",
    name: "Hotel / Pousada",
    description: "Hotéis, pousadas, hostels e aluguéis de temporada",
    defaultModules: ["services", "quote_requests", "whatsapp_actions", "reviews", "analytics"],
    hiddenModules: ["menu", "orders", "appointments", "courses", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "services", "quote_requests", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "quote_form", "whatsapp_cta", "reviews", "business_hours"],
    defaultTemplate: "hotel_booking",
    onboardingQuestions: [
      {
        id: "has_breakfast",
        question: "Café da manhã incluso nas diárias padrão?",
        type: "boolean",
        required: true,
      },
      {
        id: "hotel_type",
        question: "Qual é a categoria da hospedagem?",
        type: "select",
        options: ["Pousada", "Hotel", "Hostel", "Aluguel de Temporada (Airbnb)", "Outro"],
        required: true,
        placeholder: "Selecione a categoria",
      }
    ],
    sampleProducts: [
      {
        name: "Diária Suíte Casal Standard",
        description: "Diária para 2 pessoas em suíte com cama queen, ar-condicionado, frigobar e smart TV. Café da manhã incluso.",
        price: 220.00,
        itemType: "service"
      },
      {
        name: "Diária Suíte Família com Varanda",
        description: "Hospedagem ampla para até 4 pessoas com cama de casal e duas camas de solteiro. Varanda com vista.",
        price: 380.00,
        itemType: "service"
      }
    ]
  },
  retail: {
    id: "retail",
    name: "Loja de Varejo",
    description: "Roupas, sapatos, acessórios, eletrônicos, pet shops e mercadinhos",
    defaultModules: ["products", "orders", "whatsapp_actions", "customers", "analytics"],
    hiddenModules: ["menu", "appointments", "courses", "guest_portal", "room_service", "concierge", "properties", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "products", "orders", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "product_grid", "order_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "retail_shop",
    onboardingQuestions: [
      {
        id: "has_physical_store",
        question: "Possui loja física com atendimento ao público?",
        type: "boolean",
        required: true,
      },
      {
        id: "shipping_via_post",
        question: "Realiza envios por Correios ou transportadora para fora da cidade?",
        type: "boolean",
        required: true,
      },
      {
        id: "retail_niche",
        question: "Qual a categoria principal de produtos vendida?",
        type: "select",
        options: ["Roupas & Acessórios", "Calçados", "Eletrônicos & Celulares", "Pet Shop", "Presentes & Variedades", "Alimentos & Bebidas (Empório/Mercado)", "Outro"],
        required: true,
        placeholder: "Selecione a categoria",
      }
    ],
    sampleProducts: [
      {
        name: "Camiseta Básica 100% Algodão",
        description: "Camiseta premium em algodão penteado fio 30.1, toque extremamente macio e confortável. Diversas cores.",
        price: 49.90,
        itemType: "product"
      },
      {
        name: "Calça Jeans Slim Fit Masculina",
        description: "Calça com modelagem ajustada, lavagem média clássica e elastano para maior conforto no dia a dia.",
        price: 119.90,
        itemType: "product"
      },
      {
        name: "Tênis Esportivo Casual Unissex",
        description: "Tênis leve com amortecimento responsivo e tecido respirável. Perfeito para caminhadas e uso casual.",
        price: 189.90,
        itemType: "product"
      }
    ]
  },
  automotive: {
    id: "automotive",
    name: "Automotivo / Veículos",
    description: "Oficinas mecânicas, lava-rápidos, auto peças e centros automotivos",
    defaultModules: ["services", "appointments", "quote_requests", "whatsapp_actions", "analytics"],
    hiddenModules: ["menu", "orders", "courses", "properties", "guest_portal", "room_service", "concierge", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "appointments", "services", "quote_requests", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "quote_form", "appointment_form", "whatsapp_cta", "business_hours"],
    defaultTemplate: "auto_center",
    onboardingQuestions: [
      {
        id: "has_tow_truck",
        question: "Oferece serviço de reboque / guincho 24h?",
        type: "boolean",
        required: true,
      },
      {
        id: "auto_niche",
        question: "Qual o foco principal do estabelecimento?",
        type: "select",
        options: ["Oficina Mecânica Geral", "Lava Rápido / Detalhamento", "Auto Elétrica & Injeção", "Borracharia & Pneus", "Geral"],
        required: true,
        placeholder: "Selecione o foco",
      }
    ],
    sampleProducts: [
      {
        name: "Lavagem Completa com Cera",
        description: "Lavagem de lataria, caixas de roda, limpeza interna profunda, aspiração e enceramento protetivo.",
        price: 80.00,
        itemType: "service"
      },
      {
        name: "Serviço de Alinhamento e Balanceamento",
        description: "Alinhamento 3D das rodas e balanceamento de precisão nos quatro eixos.",
        price: 120.00,
        itemType: "service"
      },
      {
        name: "Troca de Óleo Lubrificante e Filtro",
        description: "Substituição do óleo sintético 5W30 (até 4 litros) e do filtro de óleo do motor.",
        price: 240.00,
        itemType: "service"
      }
    ]
  },
  education: {
    id: "education",
    name: "Educação / Cursos",
    description: "Aulas particulares, escolas de idiomas, música, dança e cursos livres",
    defaultModules: ["services", "whatsapp_actions", "analytics"],
    hiddenModules: ["menu", "orders", "appointments", "properties", "guest_portal", "room_service", "concierge", "vehicle_records", "service_orders", "proposals"],
    dashboardMenuItems: ["overview", "pages", "services", "qr_codes", "inbox", "customers", "analytics", "settings"],
    publicPageSections: ["hero", "service_list", "whatsapp_cta", "business_hours"],
    defaultTemplate: "education_hub",
    onboardingQuestions: [
      {
        id: "is_online",
        question: "As aulas são ministradas 100% online?",
        type: "boolean",
        required: true,
      },
      {
        id: "education_niche",
        question: "Qual o segmento educacional?",
        type: "select",
        options: ["Aulas Particulares (Reforço)", "Escola de Idiomas", "Cursos de Música / Dança", "Cursos Profissionalizantes", "Outro"],
        required: true,
        placeholder: "Selecione o segmento",
      }
    ],
    sampleProducts: [
      {
        name: "Hora-Aula Particular de Reforço Escolar",
        description: "Acompanhamento individualizado e focado nas principais matérias escolares (Matemática, Física, etc.).",
        price: 80.00,
        itemType: "service"
      },
      {
        name: "Pacote Mensal Curso de Inglês Geral",
        description: "Matrícula recorrente mensal para 2 aulas semanais de conversação em grupo de nível básico ao avançado.",
        price: 290.00,
        itemType: "service"
      }
    ]
  }
};

/**
 * Validates if a module is enabled for a given vertical.
 */
export function isModuleEnabledForVertical(verticalId: string, moduleSlug: string): boolean {
  const config = VERTICALS_CONFIG[verticalId];
  if (!config) return false;
  return config.defaultModules.includes(moduleSlug);
}

/**
 * Returns all enabled modules for a vertical.
 */
export function getModulesForVertical(verticalId: string): string[] {
  const config = VERTICALS_CONFIG[verticalId];
  return config ? config.defaultModules : [];
}

/**
 * Returns public page sections for a vertical.
 */
export function getPublicSectionsForVertical(verticalId: string): string[] {
  const config = VERTICALS_CONFIG[verticalId];
  return config ? config.publicPageSections : ["hero", "whatsapp_cta", "business_hours"];
}
