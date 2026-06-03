// ============================================
// MeuQR Business OS — Shared Module Registry
// ============================================

export interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  isCore: boolean;
  category: "core" | "sell_online" | "bookings" | "leads" | "operations" | "marketing" | "education";
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  overview: {
    key: "overview",
    name: "Painel Geral",
    description: "Visão geral do negócio, estatísticas do dia e atalhos rápidos",
    icon: "LayoutDashboard",
    isCore: true,
    category: "core",
  },
  pages: {
    key: "pages",
    name: "Páginas QR",
    description: "Gerencie as páginas públicas exibidas ao escanear o QR Code",
    icon: "FileText",
    isCore: true,
    category: "core",
  },
  qr_codes: {
    key: "qr_codes",
    name: "QR Codes",
    description: "Crie e gerencie os códigos QR físicos para mesas, balcão ou panfletos",
    icon: "QrCode",
    isCore: true,
    category: "core",
  },
  whatsapp_actions: {
    key: "whatsapp_actions",
    name: "WhatsApp",
    description: "Configuração de mensagens rápidas e botão flutuante",
    icon: "MessageCircle",
    isCore: true,
    category: "core",
  },
  analytics: {
    key: "analytics",
    name: "Métricas / Relatórios",
    description: "Visualize acessos, cliques no WhatsApp e conversões",
    icon: "BarChart3",
    isCore: true,
    category: "core",
  },
  inbox: {
    key: "inbox",
    name: "Mensagens (Inbox)",
    description: "Centralize contatos de clientes, cliques e dúvidas",
    icon: "MessageSquare",
    isCore: true,
    category: "core",
  },
  customers: {
    key: "customers",
    name: "Clientes & Leads",
    description: "Histórico de clientes e contatos capturados",
    icon: "Users",
    isCore: true,
    category: "core",
  },
  settings: {
    key: "settings",
    name: "Configurações",
    description: "Dados básicos da empresa, horários e cores",
    icon: "Settings",
    isCore: true,
    category: "core",
  },
  // Industry-specific optional modules
  products: {
    key: "products",
    name: "Catálogo de Produtos",
    description: "Gerenciamento de produtos, preços e estoque",
    icon: "Package",
    isCore: false,
    category: "sell_online",
  },
  services: {
    key: "services",
    name: "Serviços",
    description: "Lista de serviços oferecidos com preço e duração",
    icon: "Briefcase",
    isCore: false,
    category: "bookings",
  },
  menu: {
    key: "menu",
    name: "Cardápio Digital",
    description: "Categorias de pratos, bebidas e opcionais de alimentação",
    icon: "UtensilsCrossed",
    isCore: false,
    category: "sell_online",
  },
  appointments: {
    key: "appointments",
    name: "Agendamentos",
    description: "Reservas de horários online integradas com WhatsApp",
    icon: "Calendar",
    isCore: false,
    category: "bookings",
  },
  orders: {
    key: "orders",
    name: "Pedidos",
    description: "Recebimento de pedidos direto na mesa ou para entrega",
    icon: "ShoppingCart",
    isCore: false,
    category: "sell_online",
  },
  quote_requests: {
    key: "quote_requests",
    name: "Orçamentos",
    description: "Pedidos de cotação de produtos ou serviços sob consulta",
    icon: "ClipboardList",
    isCore: false,
    category: "leads",
  },
  leads: {
    key: "leads",
    name: "Captura de Leads",
    description: "Formulários de contato específicos para capturar clientes em potencial",
    icon: "UserPlus",
    isCore: false,
    category: "leads",
  },
  patients: {
    key: "patients",
    name: "Pacientes",
    description: "Prontuários e fichas cadastrais de saúde",
    icon: "HeartPulse",
    isCore: false,
    category: "core",
  },
  courses: {
    key: "courses",
    name: "Cursos / Aulas",
    description: "Gerenciamento de turmas, aulas e conteúdos",
    icon: "BookOpen",
    isCore: false,
    category: "education",
  },
  hotel_concierge: {
    key: "hotel_concierge",
    name: "Concierge / Quartos",
    description: "Serviços de quarto e atendimento ao hóspede",
    icon: "Hotel",
    isCore: false,
    category: "operations",
  },
  loyalty: {
    key: "loyalty",
    name: "Fidelidade",
    description: "Cartão fidelidade virtual para recorrencia",
    icon: "Gift",
    isCore: false,
    category: "marketing",
  },
  coupons: {
    key: "coupons",
    name: "Cupons de Desconto",
    description: "Geração de cupons para atração de clientes",
    icon: "TicketPercent",
    isCore: false,
    category: "marketing",
  }
};
