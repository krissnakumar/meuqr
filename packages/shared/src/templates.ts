import type { BusinessCategory } from "./types";

export interface TemplateDefinition {
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string;
  sections: {
    name: string;
    slug: string;
    sectionType?: string;
    items: {
      name: string;
      description?: string;
      price?: number;
    }[];
  }[];
}

export const TEMPLATES: TemplateDefinition[] = [
  // ===== 1. Restaurant =====
  {
    name: "Restaurante",
    slug: "restaurante",
    category: "restaurant",
    description: "Cardápio digital completo com WhatsApp e pedidos",
    sections: [
      {
        name: "Cardápio",
        slug: "cardapio",
        items: [
          { name: "Prato Feito", description: "Arroz, feijão, carne, salada e batata frita", price: 29.9 },
          { name: "Hambúrguer Artesanal", description: "200g de carne, queijo, alface, tomate e molho especial", price: 34.9 },
          { name: "Pizza Margherita", description: "Molho de tomate, mussarela e manjericão", price: 49.9 },
          { name: "Pizza Calabresa", description: "Calabresa, cebola e azeitona", price: 52.9 },
        ],
      },
      {
        name: "Bebidas",
        slug: "bebidas",
        items: [
          { name: "Refrigerante Lata", description: "Coca-Cola, Guaraná, Fanta", price: 6.0 },
          { name: "Suco Natural", description: "Laranja, limão, maracujá", price: 8.0 },
          { name: "Água Mineral", description: "Com ou sem gás 500ml", price: 4.0 },
        ],
      },
      {
        name: "Promoções",
        slug: "promocoes",
        sectionType: "promotions",
        items: [
          { name: "Combo Executivo", description: "Prato feito + Bebida", price: 34.9 },
          { name: "Combo Família", description: "2 Pratos + 2 Bebidas + Sobremesa", price: 69.9 },
        ],
      },
      {
        name: "Pedido WhatsApp",
        slug: "pedido-whatsapp",
        sectionType: "whatsapp_order",
        items: [],
      },
    ],
  },

  // ===== 2. Construction Materials =====
  {
    name: "Material de Construção",
    slug: "material-construcao",
    category: "construction_materials",
    description: "Catálogo completo de materiais com cotação via WhatsApp",
    sections: [
      {
        name: "Cimento",
        slug: "cimento",
        items: [
          { name: "Cimento CP II 50kg", description: "Cimento Portland CP II-E 32", price: 29.9 },
          { name: "Cimento CP IV 50kg", description: "Cimento Pozolânico", price: 27.9 },
        ],
      },
      {
        name: "Areia e Pedra",
        slug: "areia-pedra",
        items: [
          { name: "Areia Média m³", description: "Areia lavada média", price: 85.0 },
          { name: "Brita 1 m³", description: "Pedra britada nº 1", price: 95.0 },
        ],
      },
      {
        name: "Tijolos e Blocos",
        slug: "tijolos-blocos",
        items: [
          { name: "Tijolo Baiano", description: "Tijolo cerâmico 8 furos", price: 1.2 },
          { name: "Bloco de Concreto", description: "Bloco estrutural 14x19x39", price: 3.5 },
        ],
      },
      {
        name: "Tintas",
        slug: "tintas",
        items: [
          { name: "Tinta Acrílica 18L", description: "Branco neve", price: 189.9 },
          { name: "Esmalte Sintético", description: "Brilhante 3.6L", price: 89.9 },
        ],
      },
      {
        name: "Elétrica",
        slug: "eletrica",
        items: [
          { name: "Fio 2.5mm 100m", description: "Cabo elétrico 2.5mm²", price: 149.9 },
          { name: "Disjuntor 16A", description: "Disjuntor monopolizar 16A", price: 12.9 },
        ],
      },
      {
        name: "Hidráulica",
        slug: "hidraulica",
        items: [
          { name: "Cano PVC 100mm", description: "Tubo soldável 3m", price: 39.9 },
          { name: "Registro de Esfera", description: "Registro 25mm", price: 25.9 },
        ],
      },
      {
        name: "Cotação WhatsApp",
        slug: "cotacao-whatsapp",
        sectionType: "quote_request",
        items: [],
      },
    ],
  },

  // ===== 3. Salon/Barber =====
  {
    name: "Salão / Barbearia",
    slug: "salao-barbearia",
    category: "salon",
    description: "Portfólio de serviços e agendamento",
    sections: [
      {
        name: "Serviços",
        slug: "servicos",
        sectionType: "services",
        items: [
          { name: "Corte Masculino", description: "Corte com tesoura e máquina", price: 35.0 },
          { name: "Barba", description: "Aparação e modelagem", price: 25.0 },
          { name: "Escova", description: "Escova modeladora", price: 45.0 },
          { name: "Hidratação", description: "Hidratação capilar completa", price: 55.0 },
          { name: "Manicure", description: "Mãos completas", price: 30.0 },
          { name: "Pedicure", description: "Pés completos", price: 35.0 },
        ],
      },
      {
        name: "Portfólio",
        slug: "portfolio",
        sectionType: "gallery",
        items: [],
      },
      {
        name: "Agendamento",
        slug: "agendamento",
        sectionType: "booking",
        items: [],
      },
    ],
  },

  // ===== 4. Pet Shop =====
  {
    name: "Pet Shop",
    slug: "pet-shop",
    category: "pet_shop",
    description: "Serviços e produtos para seu pet",
    sections: [
      {
        name: "Serviços",
        slug: "servicos",
        items: [
          { name: "Banho", description: "Banho completo para cães até 15kg", price: 45.0 },
          { name: "Tosa", description: "Tosa higiênica ou completa", price: 55.0 },
          { name: "Banho e Tosa", description: "Combo completo", price: 85.0 },
          { name: "Consulta Veterinária", description: "Consulta clínica geral", price: 120.0 },
        ],
      },
      {
        name: "Produtos",
        slug: "produtos",
        items: [
          { name: "Ração Premium 15kg", description: "Ração para cães adultos", price: 189.9 },
          { name: "Antipulgas", description: "Comprimido oral", price: 59.9 },
          { name: "Coleira", description: "Coleira ajustável", price: 29.9 },
        ],
      },
      {
        name: "Agendamento",
        slug: "agendamento",
        sectionType: "booking",
        items: [],
      },
    ],
  },

  // ===== 5. Hotel =====
  {
    name: "Hotel",
    slug: "hotel",
    category: "hotel",
    description: "Guia do hóspede digital interativo",
    sections: [
      {
        name: "Guia do Quarto",
        slug: "guia-quarto",
        items: [
          { name: "Café da Manhã", description: "Servido das 6h às 10h no restaurante", price: 0 },
          { name: "Limpeza do Quarto", description: "Serviço diário de arrumação", price: 0 },
          { name: "Toalhas Extras", description: "Solicite toalhas adicionais", price: 0 },
          { name: "Check-out", description: "Horário: até 12h", price: 0 },
          { name: "Late Check-out", description: "Disponível mediante disponibilidade", price: 50.0 },
        ],
      },
      {
        name: "Wi-Fi",
        slug: "wifi",
        sectionType: "info",
        items: [
          { name: "Rede: Hotel Guest", description: "Senha disponível na recepção", price: 0 },
        ],
      },
      {
        name: "Serviço de Quarto",
        slug: "room-service",
        items: [
          { name: "Água Mineral", price: 5.0 },
          { name: "Refrigerante", price: 8.0 },
          { name: "Sanduíche Natural", price: 25.0 },
        ],
      },
      {
        name: "Regras",
        slug: "regras",
        sectionType: "info",
        items: [
          { name: "Não fumar nos quartos", description: "Multa aplicável", price: 0 },
          { name: "Silêncio após 22h", description: "Respeite o sossego dos hóspedes", price: 0 },
        ],
      },
      {
        name: "Recepção WhatsApp",
        slug: "recepcao-whatsapp",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },

  // ===== 6. Real Estate =====
  {
    name: "Imobiliária",
    slug: "imobiliaria",
    category: "real_estate",
    description: "Vitrine de imóveis com tour virtual",
    sections: [
      {
        name: "Imóveis",
        slug: "imoveis",
        items: [
          { name: "Casa à Venda", description: "3 quartos, 2 suítes, 150m²", price: 450000 },
          { name: "Apartamento para Aluguel", description: "2 quartos, 1 vaga, 80m²", price: 2500 },
          { name: "Terreno", description: "300m², plano, infraestrutura", price: 180000 },
        ],
      },
      {
        name: "Galeria",
        slug: "galeria",
        sectionType: "gallery",
        items: [],
      },
      {
        name: "Agendar Visita",
        slug: "agendar-visita",
        sectionType: "booking",
        items: [],
      },
    ],
  },

  // ===== 7. Event =====
  {
    name: "Evento",
    slug: "evento",
    category: "event",
    description: "Página interativa para eventos e confraternizações",
    sections: [
      {
        name: "Convite",
        slug: "convite",
        items: [
          { name: "Cerimônia", description: "Local e horário da cerimônia", price: 0 },
          { name: "Recepção", description: "Local e horário da recepção", price: 0 },
        ],
      },
      {
        name: "Programação",
        slug: "programacao",
        sectionType: "schedule",
        items: [
          { name: "Abertura dos portões", description: "19:00", price: 0 },
          { name: "Cerimônia", description: "20:00", price: 0 },
          { name: "Jantar", description: "21:00", price: 0 },
          { name: "Festa", description: "22:00", price: 0 },
        ],
      },
      {
        name: "Localização",
        slug: "localizacao",
        items: [],
      },
      {
        name: "Confirmar Presença",
        slug: "rsvp",
        sectionType: "rsvp",
        items: [],
      },
    ],
  },

  // ===== 8. Clinic =====
  {
    name: "Clínica",
    slug: "clinica",
    category: "clinic",
    description: "Serviços médicos e agendamento online",
    sections: [
      {
        name: "Serviços",
        slug: "servicos",
        sectionType: "services",
        items: [
          { name: "Consulta Geral", description: "Clínico geral", price: 150.0 },
          { name: "Exames Laboratoriais", description: "Solicitação e coleta", price: 0 },
          { name: "Retorno", description: "Consulta de retorno", price: 80.0 },
          { name: "Teleconsulta", description: "Consulta online", price: 120.0 },
        ],
      },
      {
        name: "Médicos",
        slug: "medicos",
        items: [
          { name: "Dr. João Silva", description: "Clínico Geral - CRM 12345", price: 0 },
          { name: "Dra. Maria Souza", description: "Pediatra - CRM 12346", price: 0 },
        ],
      },
      {
        name: "Agendamento",
        slug: "agendamento",
        sectionType: "booking",
        items: [],
      },
    ],
  },

  // ===== 9. Gym =====
  {
    name: "Academia",
    slug: "academia",
    category: "gym",
    description: "Planos, horários e agenda de aulas",
    sections: [
      {
        name: "Planos",
        slug: "planos",
        items: [
          { name: "Plano Mensal", description: "Acesso ilimitado à academia", price: 89.9 },
          { name: "Plano Trimestral", description: "3 meses com 10% de desconto", price: 239.9 },
          { name: "Plano Anual", description: "12 meses com 20% de desconto", price: 859.0 },
          { name: "Aula Experimental", description: "Primeira aula gratuita", price: 0 },
        ],
      },
      {
        name: "Horários",
        slug: "horarios",
        sectionType: "schedule",
        items: [
          { name: "Segunda a Sexta", description: "06:00 - 22:00", price: 0 },
          { name: "Sábado", description: "08:00 - 18:00", price: 0 },
          { name: "Domingo", description: "09:00 - 13:00", price: 0 },
        ],
      },
      {
        name: "Aulas",
        slug: "aulas",
        items: [
          { name: "Musculação", description: "Acompanhamento profissional", price: 0 },
          { name: "CrossFit", description: "Treino funcional intenso", price: 0 },
          { name: "Pilates", description: "Alongamento e fortalecimento", price: 0 },
          { name: "Spinning", description: "Aula de bike indoor", price: 0 },
        ],
      },
      {
        name: "Matrícula WhatsApp",
        slug: "matricula-whatsapp",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },

  // ===== 10. Mechanic =====
  {
    name: "Mecânico",
    slug: "mecanico",
    category: "mechanic",
    description: "Serviços automotivos e orçamento online",
    sections: [
      {
        name: "Serviços",
        slug: "servicos",
        sectionType: "services",
        items: [
          { name: "Revisão Completa", description: "Troca de óleo, filtros, velas e correias", price: 199.9 },
          { name: "Troca de Óleo", description: "Óleo + filtro + mão de obra", price: 89.9 },
          { name: "Alinhamento e Balanceamento", description: "4 rodas", price: 79.9 },
          { name: "Troca de Pneus", description: "Mão de obra para 4 pneus", price: 60.0 },
          { name: "Freios", description: "Troca de pastilhas e discos", price: 149.9 },
          { name: "Ar Condicionado", description: "Recarga e limpeza", price: 129.9 },
        ],
      },
      {
        name: "Orçamento",
        slug: "orcamento",
        sectionType: "quote_request",
        items: [],
      },
      {
        name: "Contato WhatsApp",
        slug: "contato-whatsapp",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },

  // ===== 11. Freelancer =====
  {
    name: "Freelancer",
    slug: "freelancer",
    category: "freelancer",
    description: "Portfólio profissional e orçamento rápido",
    sections: [
      {
        name: "Serviços",
        slug: "servicos",
        sectionType: "services",
        items: [
          { name: "Projeto Básico", description: "Até 3 entregas", price: 150.0 },
          { name: "Projeto Padrão", description: "Até 10 entregas", price: 500.0 },
          { name: "Projeto Premium", description: "Entregas ilimitadas", price: 1200.0 },
          { name: "Consultoria", description: "Por hora", price: 100.0 },
        ],
      },
      {
        name: "Portfólio",
        slug: "portfolio",
        sectionType: "gallery",
        items: [],
      },
      {
        name: "Orçamento Rápido",
        slug: "orcamento-rapido",
        sectionType: "quote_request",
        items: [],
      },
    ],
  },

  // ===== 12. Church =====
  {
    name: "Igreja",
    slug: "igreja",
    category: "church",
    description: "Programação, eventos e doações",
    sections: [
      {
        name: "Programação",
        slug: "programacao",
        sectionType: "schedule",
        items: [
          { name: "Culto Dominical", description: "Domingo 09:00 e 19:00", price: 0 },
          { name: "Culto de Oração", description: "Quarta-feira 19:00", price: 0 },
          { name: "Grupo Jovem", description: "Sábado 18:00", price: 0 },
          { name: "Escola Bíblica", description: "Domingo 08:00", price: 0 },
        ],
      },
      {
        name: "Eventos",
        slug: "eventos",
        sectionType: "events",
        items: [
          { name: "Próximo Evento", description: "Confira nosso calendário", price: 0 },
        ],
      },
      {
        name: "Contribuições",
        slug: "contribuicoes",
        items: [
          { name: "Dízimo", description: "Contribua com seu dízimo", price: 0 },
          { name: "Ofertas", description: "Ofertas voluntárias", price: 0 },
        ],
      },
      {
        name: "Contato WhatsApp",
        slug: "contato-whatsapp",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },

  // ===== 13. Product Shelf QR =====
  {
    name: "Prateleira de Produto",
    slug: "prateleira-produto",
    category: "product_shelf",
    description: "Ficha técnica interativa para produtos físicos em lojas",
    sections: [
      {
        name: "Informações do Produto",
        slug: "info-produto",
        items: [
          { name: "Nome do Produto", description: "Insira o nome do produto", price: 0 },
          { name: "Descrição", description: "Descrição detalhada do produto", price: 0 },
          { name: "Especificações Técnicas", description: "Dimensões, peso, material", price: 0 },
        ],
      },
      {
        name: "Preço",
        slug: "preco",
        items: [
          { name: "Preço à Vista", description: "Consulte nosso preço especial", price: 0 },
          { name: "Preço Parcelado", description: "Consulte condições", price: 0 },
        ],
      },
      {
        name: "Como Usar",
        slug: "como-usar",
        sectionType: "info",
        items: [
          { name: "Manual do Produto", description: "Clique para baixar o manual", price: 0 },
          { name: "Vídeo Tutorial", description: "Assista ao vídeo explicativo", price: 0 },
        ],
      },
      {
        name: "Fale com o Vendedor",
        slug: "fale-vendedor",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },
];

// ===== Helper Functions =====

export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getTemplatesByCategory(category: BusinessCategory): TemplateDefinition[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getAllTemplates(): TemplateDefinition[] {
  return TEMPLATES;
}
