import type { BusinessCategory, BusinessTemplate, FormType } from "../types";
import { resolveText } from "../i18n";
import type { TranslatedText } from "../i18n/types";
import { TEMPLATE_TRANSLATIONS } from "./translations";

// =============================================================================
// Business Templates — 50+ production-ready templates for MeuQR
// =============================================================================

const RAW_BUSINESS_TEMPLATES: any[] = [
  // ===== 1. RESTAURANT / LANCHONETE =====
  {
    id: "tmpl-001-restaurante",
    businessType: "restaurant",
    name: "Restaurante & Lanchonete",
    description: "Cardápio digital completo com pedidos via WhatsApp e delivery",
    pageTitle: "Cardápio",
    formType: "order",
    whatsappCta: "Faça seu pedido pelo WhatsApp",
    qrUseCase: "QR na mesa para pedir direto do celular",
    sections: [
      {
        title: "Combos",
        description: "Promoções imperdíveis",
        items: [
          { name: "Combo Executivo", description: "Prato feito + bebida + sobremesa", price: 34.9, isFeatured: true },
          { name: "Combo Família", description: "2 pratos + 2 bebidas + porção de batata", price: 69.9, isFeatured: true },
          { name: "Combo Kids", description: "Mini hambúrguer + suco + brinquedo", price: 24.9 },
        ],
      },
      {
        title: "Pratos Feitos",
        description: "Refeições completas do dia",
        items: [
          { name: "Prato Feito de Frango", description: "Arroz, feijão, frango grelhado, salada e batata frita", price: 26.9 },
          { name: "Prato Feito de Carne", description: "Arroz, feijão, bife acebolado, salada e batata frita", price: 28.9 },
          { name: "Prato Feito de Peixe", description: "Arroz, purê, filé de peixe empanado e salada", price: 32.9 },
          { name: "Strogonoff de Frango", description: "Arroz branco, strogonoff e batata palha", price: 29.9 },
          { name: "Strogonoff de Carne", description: "Arroz branco, strogonoff e batata palha", price: 34.9 },
          { name: "Salada Fit", description: "Mix de folhas, frango desfiado, tomate cereja e molho especial", price: 22.9 },
        ],
      },
      {
        title: "Lanches",
        items: [
          { name: "X-Burger", description: "Pão, hambúrguer 100g, queijo, alface e tomate", price: 18.9 },
          { name: "X-Salada", description: "Pão, hambúrguer, queijo, alface, tomate e maionese", price: 21.9 },
          { name: "X-Bacon", description: "Pão, hambúrguer, queijo, bacon crocante e salada", price: 24.9 },
          { name: "X-Tudo", description: "Pão, 2 hambúrgueres, 2 queijos, bacon, ovo, calabresa e salada", price: 29.9 },
          { name: "Misto Quente", description: "Pão de forma, presunto e queijo derretido", price: 12.9 },
          { name: "Batata Frita", description: "Porção de batata frita crocante", price: 14.9, unit: "porção" },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", description: "Coca-Cola, Guaraná, Fanta ou Sprite", price: 6.0, unit: "lata" },
          { name: "Refrigerante 600ml", description: "Coca-Cola ou Guaraná", price: 8.0, unit: "garrafa" },
          { name: "Suco Natural", description: "Laranja, limão, maracujá ou acerola", price: 8.0, unit: "copo" },
          { name: "Suco Detox", description: "Couve, gengibre, limão e maçã", price: 10.0 },
          { name: "Água Mineral", description: "Com ou sem gás 500ml", price: 4.0 },
          { name: "Cerveja Lata", description: "Brahma, Skol, Antarctica", price: 5.0, unit: "lata" },
        ],
      },
      {
        title: "Sobremesas",
        items: [
          { name: "Pudim de Leite", description: "Pudim caseiro com calda de caramelo", price: 9.9 },
          { name: "Mousse de Chocolate", description: "Mousse cremoso de chocolate meio amargo", price: 8.9 },
          { name: "Sorvete 2 Bolas", description: "Chocolate, baunilha ou morango", price: 7.9 },
          { name: "Torta de Limão", description: "Massa crocante com creme de limão", price: 10.9 },
        ],
      },
    ],
  },

  // ===== 2. PIZZARIA =====
  {
    id: "tmpl-002-pizzaria",
    businessType: "pizzeria",
    name: "Pizzaria",
    description: "Cardápio de pizzas, bebidas e promoções com pedido online",
    pageTitle: "Cardápio de Pizzas",
    formType: "order",
    whatsappCta: "Peça sua pizza pelo WhatsApp",
    qrUseCase: "QR na mesa para pedir pizza sem chamar garçom",
    sections: [
      {
        title: "Pizzas Salgadas",
        description: "Pizzas tamanho família (8 pedaços)",
        items: [
          { name: "Mussarela", description: "Molho de tomate, mussarela e orégano", price: 39.9, isFeatured: true },
          { name: "Calabresa", description: "Molho, mussarela, calabresa fatiada e cebola", price: 44.9 },
          { name: "Margherita", description: "Molho, mussarela, tomate e manjericão", price: 44.9 },
          { name: "Frango com Catupiry", description: "Molho, mussarela, frango desfiado e catupiry", price: 49.9 },
          { name: "Portuguesa", description: "Molho, mussarela, presunto, ovo, cebola e azeitona", price: 49.9 },
          { name: "Quatro Queijos", description: "Mussarela, provolone, parmesão e catupiry", price: 52.9 },
          { name: "Pepperoni", description: "Molho, mussarela e pepperoni fatiado", price: 47.9 },
          { name: "Nutella com Morango", description: "Nutella, morango e granulado", price: 54.9 },
        ],
      },
      {
        title: "Pizzas Doces",
        items: [
          { name: "Chocolate Preto", description: "Chocolate ao leite derretido e granulado", price: 42.9 },
          { name: "Chocolate Branco", description: "Chocolate branco derretido com morango", price: 44.9 },
          { name: "Banana com Canela", description: "Banana fatiada, canela e leite condensado", price: 39.9 },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", price: 6.0, unit: "lata" },
          { name: "Refrigerante 2L", price: 12.0, unit: "garrafa" },
          { name: "Suco Natural", price: 8.0, unit: "copo" },
          { name: "Cerveja Lata", price: 5.0, unit: "lata" },
        ],
      },
      {
        title: "Promoções",
        sectionType: "promotions",
        items: [
          { name: "Combo Pizza + Refri 2L", description: "Qualquer pizza salgada + refrigerante", price: 49.9, isFeatured: true },
          { name: "2 Pizzas Salgadas", description: "Duas pizzas salgadas de qualquer sabor", price: 79.9 },
        ],
      },
    ],
  },

  // ===== 3. BURGER SHOP =====
  {
    id: "tmpl-003-burger",
    businessType: "burger_shop",
    name: "Hamburgueria Artesanal",
    description: "Cardápio de hambúrgueres artesanais, combos e petiscos",
    pageTitle: "Cardápio de Hambúrgueres",
    formType: "order",
    whatsappCta: "Peça seu burguer pelo WhatsApp",
    qrUseCase: "QR na mesa para pedir sem esperar garçom",
    sections: [
      {
        title: "Hambúrgueres Artesanais",
        items: [
          { name: "Classic Burguer", description: "Pão brioche, smash 120g, queijo cheddar, alface e tomate", price: 24.9, isFeatured: true },
          { name: "Bacon Burguer", description: "Pão brioche, smash 120g, queijo, bacon crocante e barbecue", price: 28.9 },
          { name: "Cheddar Supreme", description: "Pão australiano, smash 150g, cheddar cremoso e cebola caramelizada", price: 32.9 },
          { name: "Chicken Crispy", description: "Pão brioche, filé de frango empanado, maionese e alface", price: 26.9 },
          { name: "Veggie Burguer", description: "Pão integral, hambúrguer de grão-de-bico, rúcula e molho especial", price: 27.9 },
          { name: "Double Smash", description: "Pão brioche, 2 smashes 100g, 2 queijos e salada", price: 34.9 },
          { name: "Monster Burguer", description: "Pão australiano, 3 carnes, 3 queijos, bacon e onion rings", price: 44.9 },
        ],
      },
      {
        title: "Petiscos",
        items: [
          { name: "Batata Frita com Cheddar e Bacon", description: "Porção grande", price: 19.9, unit: "porção" },
          { name: "Onion Rings", description: "10 anéis de cebola empanados", price: 14.9 },
          { name: "Nuggets de Frango", description: "8 unidades com molho barbecue", price: 16.9 },
          { name: "Frango a Passarinho", description: "Porção de frango temperado e frito", price: 22.9 },
        ],
      },
      {
        title: "Combos",
        sectionType: "promotions",
        items: [
          { name: "Combo Individual", description: "Hambúrguer + batata média + refri lata", price: 34.9, isFeatured: true },
          { name: "Combo Casal", description: "2 hambúrgueres + batata grande + 2 refris", price: 69.9 },
          { name: "Combo Família", description: "4 hambúrgueres + batata gigante + 4 refris", price: 119.9 },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", price: 6.0 },
          { name: "Refrigerante 600ml", description: "Coca-Cola ou Guaraná", price: 10.0 },
          { name: "Milkshake", description: "Chocolate, baunilha ou morango", price: 16.9 },
          { name: "Suco Natural", price: 8.0 },
          { name: "Água Mineral", price: 4.0 },
        ],
      },
    ],
  },

  // ===== 4. BAKERY / PADARIA =====
  {
    id: "tmpl-004-padaria",
    businessType: "bakery",
    name: "Padaria & Confeitaria",
    description: "Catálogo de pães, doces, salgados e encomendas",
    pageTitle: "Produtos da Padaria",
    formType: "catalog",
    whatsappCta: "Encomende pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver cardápio completo",
    sections: [
      {
        title: "Pães Artesanais",
        items: [
          { name: "Pão Francês", description: "Pão francês crocante", price: 0.8, unit: "unidade", isFeatured: true },
          { name: "Pão de Forma Integral", description: "Pão integral com grãos 500g", price: 8.9 },
          { name: "Baguete", description: "Baguete artesanal crocante", price: 6.9 },
          { name: "Pão de Queijo", description: "Pão de queijo mineiro tradicional", price: 2.5, unit: "unidade" },
          { name: "Croissant", description: "Croissant folhado de manteiga", price: 5.9 },
          { name: "Brioche", description: "Pão brioche levemente adocicado", price: 4.9 },
          { name: "Ciabatta", description: "Pão italiano rústico", price: 7.9 },
        ],
      },
      {
        title: "Bolos e Tortas",
        items: [
          { name: "Bolo de Cenoura com Cobertura", description: "Massa fofinha com cobertura de chocolate", price: 32.9, unit: "inteiro" },
          { name: "Bolo de Laranja", description: "Bolo caseiro de laranja", price: 28.9 },
          { name: "Torta de Maçã", description: "Torta de maçã com canela", price: 10.9, unit: "fatia" },
          { name: "Torta Holandesa", description: "Torta holandesa com creme e chocolate", price: 14.9, unit: "fatia" },
        ],
      },
      {
        title: "Salgados",
        items: [
          { name: "Coxinha de Frango", price: 5.9, unit: "unidade" },
          { name: "Empada de Frango", price: 6.9, unit: "unidade" },
          { name: "Esfirra de Carne", price: 5.9, unit: "unidade" },
          { name: "Kibe", price: 4.9, unit: "unidade" },
          { name: "Pastel de Forno", description: "Pastel assado de frango ou carne", price: 6.9, unit: "unidade" },
          { name: "Folhado de Queijo", description: "Folhado de queijo", price: 5.9, unit: "unidade" },
        ],
      },
      {
        title: "Doces e Sobremesas",
        items: [
          { name: "Brigadeiro Gourmet", price: 3.5, unit: "unidade" },
          { name: "Beijinho", price: 3.5, unit: "unidade" },
          { name: "Cupcake Decorado", price: 8.9, unit: "unidade" },
          { name: "Pudim de Leite", description: "Fatia generosa", price: 9.9, unit: "fatia" },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Café Expresso", price: 4.0 },
          { name: "Café com Leite", price: 5.0 },
          { name: "Cappuccino", price: 7.0 },
          { name: "Suco Natural", price: 8.0 },
        ],
      },
      {
        title: "Encomendas WhatsApp",
        sectionType: "whatsapp",
        items: [],
      },
    ],
  },

  // ===== 5. COFFEE SHOP =====
  {
    id: "tmpl-005-coffee",
    businessType: "coffee_shop",
    name: "Cafeteria / Coffee Shop",
    description: "Cardápio de cafés especiais, bebidas geladas e alimentos",
    pageTitle: "Cardápio de Cafés",
    formType: "menu",
    whatsappCta: "Peça seu café pelo WhatsApp",
    qrUseCase: "QR na mesa para ver o cardápio de cafés",
    sections: [
      {
        title: "Cafés Especiais",
        items: [
          { name: "Expresso Simples", description: "Café expresso 30ml", price: 4.5, isFeatured: true },
          { name: "Expresso Duplo", description: "Café expresso 60ml", price: 6.5 },
          { name: "Café Americano", description: "Expresso diluído em água quente", price: 5.5 },
          { name: "Café com Leite", description: "Expresso + leite vaporizado", price: 7.0 },
          { name: "Cappuccino Clássico", description: "Expresso, leite vaporizado e espuma de leite", price: 9.0 },
          { name: "Latte Macchiato", description: "Leite vaporizado com toque de expresso", price: 9.5 },
          { name: "Mocha", description: "Café, chocolate e leite vaporizado", price: 11.0 },
          { name: "Flat White", description: "Expresso duplo com microespuma de leite", price: 10.0 },
        ],
      },
      {
        title: "Bebidas Geladas",
        items: [
          { name: "Iced Latte", description: "Café gelado com leite", price: 10.0 },
          { name: "Frappuccino", description: "Café batido com gelo e chantilly", price: 14.0 },
          { name: "Chocolate Gelado", description: "Chocolate batido com leite e gelo", price: 12.0 },
          { name: "Suco Natural", description: "Laranja, limão ou maracujá", price: 9.0 },
        ],
      },
      {
        title: "Acompanhamentos",
        items: [
          { name: "Pão de Queijo", description: "3 unidades", price: 6.0 },
          { name: "Cookie de Chocolate", description: "Cookie americano", price: 7.0 },
          { name: "Bolo do Dia", description: "Fatia do bolo do dia", price: 8.0 },
          { name: "Torrada Artesanal", description: "Pão artesanal com manteiga", price: 5.0 },
          { name: "Sanduíche Natural", description: "Pão integral, peito de peru, queijo branco e salada", price: 16.0 },
        ],
      },
      {
        title: "Chás e Outros",
        items: [
          { name: "Chá de Camomila", price: 6.0 },
          { name: "Chá Verde", price: 6.0 },
          { name: "Chá Mate Gelado", price: 7.0 },
          { name: "Água com Gás", price: 5.0 },
        ],
      },
    ],
  },

  // ===== 6. AÇAÍ / SORVETERIA =====
  {
    id: "tmpl-006-acai",
    businessType: "acai_sorveteria",
    name: "Açaí & Sorveteria",
    description: "Cardápio de açaís, sorvetes e acompanhamentos",
    pageTitle: "Cardápio de Açaí e Sorvetes",
    formType: "order",
    whatsappCta: "Peça seu açaí pelo WhatsApp",
    qrUseCase: "QR no balcão para pedir combo de açaí",
    sections: [
      {
        title: "Açaí na Tigela",
        items: [
          { name: "Açaí Pequeno", description: "300ml com banana e granola", price: 12.9, isFeatured: true },
          { name: "Açaí Médio", description: "500ml com banana, granola e leite em pó", price: 17.9 },
          { name: "Açaí Grande", description: "700ml com 3 acompanhamentos", price: 22.9 },
          { name: "Açaí Supremo", description: "1000ml com todos os acompanhamentos", price: 29.9 },
          { name: "Açaí Fit", description: "300ml com whey protein, banana e granola integral", price: 18.9 },
        ],
      },
      {
        title: "Adicionais",
        items: [
          { name: "Banana", price: 1.5, unit: "unidade" },
          { name: "Morango", price: 2.0, unit: "porção" },
          { name: "Granola", price: 1.5 },
          { name: "Leite em Pó", price: 1.0 },
          { name: "Leite Condensado", price: 1.5 },
          { name: "Nutella", price: 3.0 },
          { name: "Paçoca", price: 1.5 },
          { name: "Whey Protein", description: "Chocolate ou baunilha", price: 5.0 },
        ],
      },
      {
        title: "Sorvetes",
        items: [
          { name: "Sorvete 1 Bola", description: "Escolha entre 20 sabores", price: 5.0 },
          { name: "Sorvete 2 Bolas", price: 8.0 },
          { name: "Sorvete 3 Bolas", price: 11.0 },
          { name: "Milk Shake", description: "300ml de puro shake", price: 14.0 },
          { name: "Sunday", description: "Sorvete com calda e chantilly", price: 12.0 },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Suco Natural", price: 8.0 },
          { name: "Vitamina de Frutas", description: "Banana, mamão ou morango", price: 10.0 },
          { name: "Água Mineral", price: 4.0 },
        ],
      },
    ],
  },

  // ===== 7. BAR / PUB =====
  {
    id: "tmpl-007-bar",
    businessType: "bar_pub",
    name: "Bar & Pub",
    description: "Cardápio de bebidas, petiscos e promoções do bar",
    pageTitle: "Cardápio do Bar",
    formType: "menu",
    whatsappCta: "Chame no WhatsApp para reservar sua mesa",
    qrUseCase: "QR na mesa para ver o cardápio de bebidas",
    sections: [
      {
        title: "Cervejas",
        items: [
          { name: "Cerveja Lata", description: "Brahma, Skol, Antarctica, Heineken", price: 5.0, unit: "lata", isFeatured: true },
          { name: "Cerveja Long Neck", description: "Heineken, Corona, Stella, Budweiser", price: 8.0 },
          { name: "Cerveja 600ml", description: "Brahma, Antarctica, Skol", price: 12.0 },
          { name: "Chopp 300ml", description: "Chopp bem gelado", price: 7.0 },
          { name: "Chopp 500ml", description: "Chopp bem gelado", price: 10.0 },
          { name: "Cerveja Artesanal", description: "IPA, Stout, Pale Ale, Weiss", price: 14.0 },
        ],
      },
      {
        title: "Destilados e Drinks",
        items: [
          { name: "Caipirinha", description: "Limão, cachaça, açúcar e gelo", price: 12.0 },
          { name: "Caipiroska", description: "Vodka, fruta e açúcar", price: 15.0 },
          { name: "Gin Tônica", description: "Gin, água tônica e limão", price: 18.0 },
          { name: "Whisky Dose", description: "Red Label, Black Label, Jameson", price: 10.0, unit: "dose" },
          { name: "Vodka Dose", description: "Smirnoff, Absolut", price: 8.0, unit: "dose" },
          { name: "Catuaba", price: 8.0 },
        ],
      },
      {
        title: "Petiscos",
        items: [
          { name: "Porção de Batata Frita", description: "Batata frita crocante com sal", price: 18.0, unit: "porção" },
          { name: "Porção de Calabresa", description: "Calabresa acebolada", price: 22.0 },
          { name: "Isca de Frango", description: "Filé de frango empanado", price: 24.0 },
          { name: "Frango a Passarinho", description: "Frango temperado e frito", price: 28.0 },
          { name: "Amendoim", description: "Amendoim salgado ou doce", price: 8.0 },
          { name: "Torresmo", description: "Torresmo pururuca", price: 20.0 },
        ],
      },
      {
        title: "Porções Especiais",
        items: [
          { name: "Tábua de Frios", description: "Queijos, salames e azeitonas", price: 45.0 },
          { name: "Bolinho de Bacalhau", description: "8 unidades", price: 28.0 },
          { name: "Camarão Empanado", description: "Porção grande", price: 42.0 },
        ],
      },
    ],
  },

  // ===== 8. FOOD TRUCK =====
  {
    id: "tmpl-008-food-truck",
    businessType: "food_truck",
    name: "Food Truck",
    description: "Cardápio digital para food truck com localização e horários",
    pageTitle: "Cardápio do Food Truck",
    formType: "menu",
    whatsappCta: "Faça sua reserva pelo WhatsApp",
    qrUseCase: "QR no food truck para ver cardápio e localização",
    sections: [
      {
        title: "Destaques do Dia",
        sectionType: "promotions",
        items: [
          { name: "Combo do Dia", description: "Prato principal + bebida", price: 24.9, isFeatured: true },
          { name: "Prato Executivo", description: "Arroz, feijão, carne, salada e farofa", price: 19.9 },
        ],
      },
      {
        title: "Lanches",
        items: [
          { name: "X-Tudo", description: "Tudo que tem direito", price: 22.9 },
          { name: "X-Burger", description: "Hambúrguer simples", price: 15.9 },
          { name: "Cachorro Quente", description: "Salsicha com molho, purê e batata palha", price: 12.9 },
          { name: "Pastel", description: "Carne, queijo ou frango", price: 8.0, unit: "unidade" },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", price: 5.0 },
          { name: "Suco Natural", price: 7.0 },
          { name: "Água Mineral", price: 3.0 },
          { name: "Café", price: 4.0 },
        ],
      },
      {
        title: "Localização e Horários",
        sectionType: "info",
        items: [
          { name: "Localização de Hoje", description: "Veja nosso Instagram para localização diária", price: 0 },
          { name: "Horário de Funcionamento", description: "Seg-Sáb: 11h às 15h | 18h às 22h", price: 0 },
          { name: "Siga no Instagram", description: "@meufoodtruck", price: 0 },
        ],
      },
    ],
  },

  // ===== 9. CONSTRUCTION MATERIALS =====
  {
    id: "tmpl-009-construcao",
    businessType: "construction_materials",
    name: "Material de Construção",
    description: "Catálogo completo de materiais com cotação via WhatsApp",
    pageTitle: "Catálogo de Materiais",
    formType: "quote",
    whatsappCta: "Solicite cotação pelo WhatsApp",
    qrUseCase: "QR na loja para ver catálogo de preços",
    sections: [
      {
        title: "Cimento e Argamassa",
        items: [
          { name: "Cimento CP-II 50kg", description: "Cimento Portland CP-II-E 32", price: 29.9, unit: "saco", isFeatured: true, image: "https://images.unsplash.com/photo-1541888087401-44dc921e1d0f?auto=format&fit=crop&q=80&w=200" },
          { name: "Cimento CP-IV 50kg", description: "Cimento Pozolânico", price: 27.9, image: "https://images.unsplash.com/photo-1541888087401-44dc921e1d0f?auto=format&fit=crop&q=80&w=200" },
          { name: "Argamassa AC-I 20kg", description: "Argamassa para assentamento", price: 15.9, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=200" },
          { name: "Argamassa AC-II 20kg", description: "Argamassa para revestimento", price: 17.9, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=200" },
          { name: "Rejunte 1kg", description: "Rejunte cerâmico colorido", price: 6.9 },
        ],
      },
      {
        title: "Agregados",
        items: [
          { name: "Areia Média", description: "Areia lavada média", price: 85.0, unit: "m³", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200" },
          { name: "Areia Fina", description: "Areia lavada fina", price: 90.0, unit: "m³", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200" },
          { name: "Brita 1", description: "Pedra britada nº 1", price: 95.0, unit: "m³", image: "https://images.unsplash.com/photo-1584463623578-4ebae2278cb7?auto=format&fit=crop&q=80&w=200" },
          { name: "Pedra Rachão", description: "Pedra bruta", price: 80.0, unit: "m³", image: "https://images.unsplash.com/photo-1584463623578-4ebae2278cb7?auto=format&fit=crop&q=80&w=200" },
          { name: "Seixo Rolado", description: "Pedra decorativa", price: 120.0, unit: "m³" },
        ],
      },
      {
        title: "Blocos e Tijolos",
        items: [
          { name: "Tijolo Baiano 8F", description: "Tijolo cerâmico 8 furos", price: 1.2, unit: "unidade", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200" },
          { name: "Tijolo Baiano 6F", description: "Tijolo cerâmico 6 furos", price: 1.0, unit: "unidade", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200" },
          { name: "Bloco de Concreto 14x19x39", description: "Bloco estrutural", price: 3.5, unit: "unidade", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=200" },
          { name: "Tijolo Maciço", description: "Tijolo maciço cerâmico", price: 1.8, unit: "unidade", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200" },
          { name: "Laje Treliçada H8", description: "Laje com vigotas e lajotas", price: 45.0, unit: "m²" },
        ],
      },
      {
        title: "Acabamento",
        items: [
          { name: "Piso Cerâmico 45×45", description: "Piso esmaltado", price: 25.9, unit: "m²", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=200" },
          { name: "Porcelanato 60×60", description: "Porcelanato acetinado", price: 49.9, unit: "m²", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=200" },
          { name: "Revestimento 30×60", description: "Revestimento para parede", price: 32.9, unit: "m²" },
          { name: "Rodapé Cerâmico 7cm", description: "Rodapé de cerâmica", price: 4.5, unit: "m" },
        ],
      },
      {
        title: "Tintas",
        items: [
          { name: "Tinta Acrílica 18L", description: "Branco neve fosco", price: 189.9, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200" },
          { name: "Tinta Acrílica 3.6L", description: "Branco neve fosco", price: 59.9, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200" },
          { name: "Esmalte Sintético 3.6L", description: "Brilhante", price: 89.9, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200" },
          { name: "Massa Corrida 25kg", description: "Massa para parede", price: 39.9 },
          { name: "Selador 18L", description: "Selador acrílico", price: 149.9 },
        ],
      },
      {
        title: "Ferramentas",
        items: [
          { name: "Furadeira de Impacto", description: "Furadeira 500W", price: 149.9, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200" },
          { name: "Esmerilhadeira 4.5", description: "127V ou 220V", price: 129.9, image: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&q=80&w=200" },
          { name: "Fita Métrica 5m", description: "Fita de aço 5 metros", price: 12.9, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200" },
          { name: "Nível a Laser", description: "Nível autoeletrônico", price: 89.9 },
        ],
      },
    ],
  },

  // ===== 10. HARDWARE STORE =====
  {
    id: "tmpl-010-ferragens",
    businessType: "hardware_store",
    name: "Loja de Ferragens",
    description: "Catálogo de ferramentas, fechaduras e materiais de ferragem",
    pageTitle: "Produtos de Ferragens",
    formType: "catalog",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para consultar preços",
    sections: [
      {
        title: "Ferramentas Manuais",
        items: [
          { name: "Martelo de Unha", description: "Martelo 25mm com cabo de madeira", price: 19.9 },
          { name: "Alicate Universal", description: "Alicate 8 pol", price: 24.9 },
          { name: "Chave de Fenda", description: "Jogo 6 peças", price: 22.9 },
          { name: "Chave Philips", description: "Jogo 6 peças", price: 22.9 },
          { name: "Serrote", description: "Serrote 18 pol", price: 29.9 },
          { name: "Trena 5m", description: "Trena automática 5m", price: 15.9 },
        ],
      },
      {
        title: "Fechaduras e Dobradiças",
        items: [
          { name: "Fechadura de Porta", description: "Fechadura completa com maçaneta", price: 59.9 },
          { name: "Fechadura de Segredo", description: "Fechadura de embutir", price: 45.9 },
          { name: "Dobradiça 3 pol", description: "Dobradiça de aço cromado", price: 5.9, unit: "par" },
          { name: "Dobradiça 4 pol", description: "Dobradiça de aço cromado", price: 7.9, unit: "par" },
        ],
      },
      {
        title: "Parafusos e Porcas",
        items: [
          { name: "Kit Parafusos Sortidos", description: "100 peças variadas", price: 14.9 },
          { name: "Buchas SX 6mm", description: "Pacote 10 unidades", price: 3.5 },
          { name: "Arruelas Sortidas", description: "Pacote 50 unidades", price: 5.9 },
          { name: "Prego 17×27", description: "Pacote 1kg", price: 12.9 },
        ],
      },
      {
        title: "Colas e Adesivos",
        items: [
          { name: "Super Bonder 3g", description: "Adesivo instantâneo", price: 4.5 },
          { name: "Cola Branca 500g", description: "Cola branca multiuso", price: 8.9 },
          { name: "Cola de Contato 250ml", description: "Cola para borracha e couro", price: 12.9 },
          { name: "Fita Veda Rosca", description: "18mm x 50m", price: 5.9 },
        ],
      },
    ],
  },

  // ===== 11. PAINT STORE =====
  {
    id: "tmpl-011-tintas",
    businessType: "paint_store",
    name: "Loja de Tintas",
    description: "Catálogo de tintas, vernizes e acessórios para pintura",
    pageTitle: "Tintas e Acessórios",
    formType: "catalog",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para ver cores e preços",
    sections: [
      {
        title: "Tintas Acrílicas",
        items: [
          { name: "Tinta Acrílica Fosca 18L", description: "Branco neve / cores claras", price: 179.9, isFeatured: true },
          { name: "Tinta Acrílica Semifosco 18L", description: "Branco neve / cores claras", price: 199.9 },
          { name: "Tinta Acrílica 3.6L", description: "Diversas cores", price: 59.9 },
          { name: "Tinta Acrílica 900ml", description: "Diversas cores", price: 24.9 },
        ],
      },
      {
        title: "Tintas Especiais",
        items: [
          { name: "Tinta Epóxi 3.6L", description: "Para pisos e áreas industriais", price: 129.9 },
          { name: "Tinta para Madeira 900ml", description: "Verniz ou esmalte", price: 34.9 },
          { name: "Tinta Spray 400ml", description: "Diversas cores", price: 18.9 },
          { name: "Cal Acrílica 18L", description: "Para alvenaria externa", price: 89.9 },
        ],
      },
      {
        title: "Acessórios para Pintura",
        items: [
          { name: "Rolo de Pintura 23cm", description: "Rolo de lã", price: 8.9 },
          { name: "Bandeja para Tinta", description: "Bandeja plástica", price: 6.9 },
          { name: "Pincel 2 pol", description: "Pincel chato", price: 7.9 },
          { name: "Pincel 4 pol", description: "Pincel chato", price: 14.9 },
          { name: "Fita Crepe 50m", description: "Fita crepe 25mm", price: 8.9 },
          { name: "Lixa para Parede", description: "Lixa grão 120", price: 2.5, unit: "folha" },
        ],
      },
    ],
  },

  // ===== 12. ELECTRICAL SUPPLIES =====
  {
    id: "tmpl-012-eletrica",
    businessType: "electrical_supplies",
    name: "Materiais Elétricos",
    description: "Catálogo de fios, cabos, disjuntores e iluminação",
    pageTitle: "Produtos Elétricos",
    formType: "catalog",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para consultar especificações",
    sections: [
      {
        title: "Fios e Cabos",
        items: [
          { name: "Fio Flexível 1.5mm² 100m", description: "Cabo flexível vermelho ou preto", price: 89.9, isFeatured: true },
          { name: "Fio Flexível 2.5mm² 100m", description: "Cabo flexível vermelho ou preto", price: 149.9 },
          { name: "Cabo PP 2×1.5mm² 100m", description: "Cabo paralelo", price: 129.9 },
          { name: "Cabo PP 2×2.5mm² 100m", description: "Cabo paralelo", price: 199.9 },
          { name: "Cabo Flexível 4mm² 100m", description: "Cabo grosso industrial", price: 259.9 },
          { name: "Cabo Coaxial 50m", description: "Cabo antena TV", price: 59.9 },
        ],
      },
      {
        title: "Disjuntores",
        items: [
          { name: "Disjuntor Monopolar 10A", description: "Disjuntor padrão DIN", price: 12.9 },
          { name: "Disjuntor Monopolar 16A", description: "Disjuntor padrão DIN", price: 12.9 },
          { name: "Disjuntor Monopolar 20A", description: "Disjuntor padrão DIN", price: 14.9 },
          { name: "Disjuntor Bipolar 25A", description: "Disjuntor padrão DIN", price: 24.9 },
          { name: "Disjuntor DR 40A", description: "Disjuntor diferencial residual", price: 59.9 },
        ],
      },
      {
        title: "Tomadas e Interruptores",
        items: [
          { name: "Tomada 10A 2P+T", description: "Padrão novo", price: 8.9 },
          { name: "Tomada 20A 2P+T", description: "Tomada para ar condicionado", price: 12.9 },
          { name: "Interruptor Simples", description: "Interruptor 1 tecla", price: 6.9 },
          { name: "Interruptor Paralelo", description: "Interruptor 3 vias", price: 9.9 },
          { name: "Plug Tomada 10A", description: "Plug macho padrão novo", price: 5.9 },
        ],
      },
      {
        title: "Iluminação",
        items: [
          { name: "Lâmpada LED 9W", description: "Bocal E27 branco frio", price: 6.9 },
          { name: "Lâmpada LED 15W", description: "Bocal E27 luz do dia", price: 9.9 },
          { name: "Lâmpada LED 20W", description: "Bocal E27 6500K", price: 14.9 },
          { name: "Holoferta 1,5m", description: "Perfil de alumínio para LED", price: 22.9 },
        ],
      },
    ],
  },

  // ===== 13. PLUMBING SUPPLIES =====
  {
    id: "tmpl-013-hidraulica",
    businessType: "plumbing_supplies",
    name: "Materiais Hidráulicos",
    description: "Catálogo de tubos, conexões, registros e louças",
    pageTitle: "Produtos Hidráulicos",
    formType: "catalog",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para ver especificações técnicas",
    sections: [
      {
        title: "Tubos e Conexões",
        items: [
          { name: "Cano PVC Soldável 25mm 3m", description: "Tubo marrom para água fria", price: 14.9, isFeatured: true },
          { name: "Cano PVC Soldável 50mm 3m", description: "Tubo marrom para água fria", price: 29.9 },
          { name: "Cano PVC 100mm 3m", description: "Tubo branco para esgoto", price: 39.9 },
          { name: "Joelho 45° PVC 25mm", description: "Joelho soldável", price: 2.5 },
          { name: "Joelho 90° PVC 25mm", description: "Joelho soldável", price: 2.5 },
          { name: "Tê PVC 25mm", description: "Tê soldável", price: 3.5 },
          { name: "Capa PVC 25mm", description: "Capa soldável", price: 1.5 },
        ],
      },
      {
        title: "Registros e Torneiras",
        items: [
          { name: "Registro de Esfera 25mm", description: "Registro de pressão", price: 25.9 },
          { name: "Registro de Gaveta 25mm", description: "Registro de passagem", price: 19.9 },
          { name: "Torneira de Mesa", description: "Torneira cromada para cozinha", price: 49.9 },
          { name: "Torneira de Lavanderia", description: "Torneira para tanque", price: 29.9 },
          { name: "Torneira de Jardim", description: "Torneira para mangueira", price: 22.9 },
          { name: "Misturador de Banho", description: "Misturador para ducha", price: 89.9 },
        ],
      },
      {
        title: "Louças e Metais",
        items: [
          { name: "Vaso Sanitário", description: "Vaso com caixa acoplada", price: 299.9 },
          { name: "Pia de Cozinha", description: "Pia aço inox simples", price: 149.9 },
          { name: "Tanque de Lavar", description: "Tanque de mármore", price: 249.9 },
          { name: "Ducha Manual", description: "Chuveiro de mão", price: 35.9 },
          { name: "Sifão para Pia", description: "Sifão flexível", price: 15.9 },
        ],
      },
    ],
  },

  // ===== 14. FURNITURE STORE =====
  {
    id: "tmpl-014-moveis",
    businessType: "furniture_store",
    name: "Loja de Móveis",
    description: "Catálogo de móveis para casa e escritório com fotos",
    pageTitle: "Móveis e Decoração",
    formType: "catalog",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver catálogo completo",
    sections: [
      {
        title: "Sala de Estar",
        items: [
          { name: "Sofá 3 Lugares", description: "Sofá retrátil e reclinável em suede", price: 1499.9, isFeatured: true },
          { name: "Sofá 2 Lugares", description: "Sofá fixo em sarja", price: 999.9 },
          { name: "Poltrona Relax", description: "Poltrona giratória", price: 699.9 },
          { name: "Mesa de Centro", description: "Mesa em vidro e aço", price: 399.9 },
          { name: "Rack para TV", description: "Rack 2 portas com nichos", price: 599.9 },
          { name: "Estante", description: "Estante 6 prateleiras", price: 349.9 },
        ],
      },
      {
        title: "Quarto",
        items: [
          { name: "Cama Box Casal", description: "Box casal + colchão D33", price: 1199.9 },
          { name: "Cama Box Solteiro", description: "Box solteiro + colchão D33", price: 799.9 },
          { name: "Guarda-Roupa 2 Portas", description: "Guarda-roupa com 2 portas de correr", price: 1299.9 },
          { name: "Cabeceira Estofada", description: "Cabeceira para cama casal", price: 349.9 },
          { name: "Criado-Mudo", description: "Mesa de cabeceira 2 gavetas", price: 199.9 },
        ],
      },
      {
        title: "Cozinha",
        items: [
          { name: "Mesa para Cozinha", description: "Mesa retangular 4 lugares", price: 449.9 },
          { name: "Cadeira de Cozinha", description: "Cadeira empilhável", price: 149.9, unit: "unidade" },
          { name: "Armário de Cozinha", description: "Armário aéreo 2 portas", price: 299.9 },
          { name: "Carrinho de Apoio", description: "Carrinho multiuso", price: 189.9 },
        ],
      },
      {
        title: "Escritório",
        items: [
          { name: "Mesa de Escritório", description: "Mesa 1.20m com gaveteiro", price: 599.9 },
          { name: "Cadeira Giratória", description: "Cadeira ergonômica com braço", price: 449.9 },
          { name: "Estante Escritório", description: "Estante 4 prateleiras", price: 299.9 },
        ],
      },
    ],
  },

  // ===== 15. CLOTHING STORE =====
  {
    id: "tmpl-015-roupas",
    businessType: "clothing_store",
    name: "Loja de Roupas",
    description: "Catálogo de moda feminina, masculina e infantil",
    pageTitle: "Coleção de Roupas",
    formType: "catalog",
    whatsappCta: "Compre pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver a coleção completa",
    sections: [
      {
        title: "Feminino",
        items: [
          { name: "Vestido Midi", description: "Vestido midi em viscose", price: 89.9, isFeatured: true },
          { name: "Blusa de Algodão", description: "Blusa básica algodão", price: 39.9 },
          { name: "Calça Jeans Skinny", description: "Jeans azul escuro", price: 89.9 },
          { name: "Saia Plissada", description: "Saia plissada midi", price: 69.9 },
          { name: "Jaqueta Jeans", description: "Jaqueta jeans tradicional", price: 129.9 },
          { name: "Cropped", description: "Cropped em malha", price: 34.9 },
          { name: "Macacão Longo", description: "Macacão alfaiataria", price: 119.9 },
        ],
      },
      {
        title: "Masculino",
        items: [
          { name: "Camisa Social", description: "Camisa social manga longa", price: 79.9 },
          { name: "Camiseta Básica", description: "Camiseta 100% algodão", price: 29.9 },
          { name: "Calça Jeans Reta", description: "Jeans azul escuro", price: 99.9 },
          { name: "Bermuda Esportiva", description: "Bermuda tactel", price: 49.9 },
          { name: "Polo", description: "Camisa polo em algodão", price: 59.9 },
          { name: "Blusão Moletom", description: "Moletom com capuz", price: 79.9 },
        ],
      },
      {
        title: "Infantil",
        items: [
          { name: "Conjunto Baby", description: "Body + calça para bebê", price: 49.9 },
          { name: "Vestido Infantil", description: "Vestido infantil estampado", price: 55.9 },
          { name: "Camiseta Infantil", description: "Camiseta personagens", price: 34.9 },
          { name: "Calça Infantil", description: "Calça jeans infantil", price: 59.9 },
        ],
      },
      {
        title: "Acessórios",
        items: [
          { name: "Cinto de Couro", description: "Cinto 3cm fivela cromada", price: 49.9 },
          { name: "Bolsa Feminina", description: "Bolsa transversal couro sintético", price: 79.9 },
          { name: "Mochila", description: "Mochila executiva", price: 89.9 },
          { name: "Lenço", description: "Lenço de seda 70×70", price: 29.9 },
          { name: "Boné", description: "Boné aba reta", price: 39.9 },
        ],
      },
    ],
  },

  // ===== 16. SHOE STORE =====
  {
    id: "tmpl-016-calcados",
    businessType: "shoe_store",
    name: "Loja de Calçados",
    description: "Catálogo de sapatos, tênis e sandálias",
    pageTitle: "Coleção de Calçados",
    formType: "catalog",
    whatsappCta: "Compre pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver toda coleção",
    sections: [
      {
        title: "Tênis",
        items: [
          { name: "Tênis Esportivo", description: "Tênis para corrida e academia", price: 149.9, isFeatured: true },
          { name: "Tênis Casual", description: "Tênis casual em lona", price: 119.9 },
          { name: "Tênis De couro", description: "Tênis couro legítimo", price: 199.9 },
          { name: "Tênis Infantil", description: "Tênis com velcro", price: 79.9 },
        ],
      },
      {
        title: "Sapatos Femininos",
        items: [
          { name: "Scarpin Salto Alto", description: "Scarpin bico fino 10cm", price: 129.9 },
          { name: "Sapatilha", description: "Sapatilha em couro", price: 79.9 },
          { name: "Sandália Rasteira", description: "Rasteira com tiras", price: 59.9 },
          { name: "Anabela", description: "Sandália anabela 8cm", price: 89.9 },
          { name: "Bota Cano Médio", description: "Bota em couro", price: 199.9 },
        ],
      },
      {
        title: "Sapatos Masculinos",
        items: [
          { name: "Sapato Social", description: "Sapato em couro legítimo", price: 159.9 },
          { name: "Mocassim", description: "Mocassim casual", price: 129.9 },
          { name: "Chinelo Slide", description: "Chinelo em borracha", price: 34.9 },
          { name: "Sandália Masculina", description: "Sandália em couro", price: 69.9 },
        ],
      },
      {
        title: "Cuidados com Calçados",
        items: [
          { name: "Palmilha Ortopédica", description: "Palmilha de gel", price: 19.9 },
          { name: "Creme para Couro", description: "Creme hidratante 100ml", price: 14.9 },
          { name: "Cadarço Colorido", description: "Par de cadarço 1m", price: 5.9 },
          { name: "Spray Impermeabilizante", description: "200ml", price: 24.9 },
        ],
      },
    ],
  },

  // ===== 17. COSMETICS STORE =====
  {
    id: "tmpl-017-cosmeticos",
    businessType: "cosmetics_store",
    name: "Loja de Cosméticos",
    description: "Catálogo de perfumes, maquiagem, cuidados com a pele e cabelo",
    pageTitle: "Produtos de Beleza",
    formType: "catalog",
    whatsappCta: "Compre pelo WhatsApp",
    qrUseCase: "QR na loja para ver catálogo de produtos",
    sections: [
      {
        title: "Perfumes e Fragrâncias",
        items: [
          { name: "Perfume Feminino 50ml", description: "Eau de parfum importado", price: 149.9, isFeatured: true },
          { name: "Perfume Masculino 50ml", description: "Eau de toilette", price: 129.9 },
          { name: "Body Splash 200ml", description: "Colônia suave", price: 39.9 },
          { name: "Desodorante Spray 150ml", description: "Antitranspirante", price: 19.9 },
        ],
      },
      {
        title: "Maquiagem",
        items: [
          { name: "Base Líquida 30ml", description: "Cobertura média", price: 49.9 },
          { name: "Batom Matte", description: "Batom de longa duração", price: 24.9 },
          { name: "Máscara de Cílios", description: "Volume extremo", price: 34.9 },
          { name: "Paleta de Sombras", description: "12 cores neutras", price: 59.9 },
          { name: "Delineador Líquido", description: "Preto intenso", price: 19.9 },
          { name: "Pó Compacto", description: "Acabamento matte", price: 39.9 },
        ],
      },
      {
        title: "Cuidados com a Pele",
        items: [
          { name: "Hidratante Facial 50g", description: "Para todos os tipos de pele", price: 39.9 },
          { name: "Protetor Solar FPS 50", description: "Toque seco 40ml", price: 49.9 },
          { name: "Sabonete Líquido Facial", description: "Limpeza profunda 150ml", price: 24.9 },
          { name: "Sérum Vitamina C", description: "Clareador 30ml", price: 69.9 },
          { name: "Esfoliante Facial", description: "Grânulos suaves 100g", price: 29.9 },
        ],
      },
      {
        title: "Cabelos",
        items: [
          { name: "Shampoo Profissional 300ml", description: "Para todos os tipos", price: 34.9 },
          { name: "Condicionador 300ml", description: "Hidratação profunda", price: 34.9 },
          { name: "Máscara Capilar 250g", description: "Reconstrução intensa", price: 44.9 },
          { name: "Leave-in 150ml", description: "Protetor térmico", price: 29.9 },
          { name: "Óleo Capilar 50ml", description: "Óleo de argan", price: 39.9 },
        ],
      },
    ],
  },

  // ===== 18. SUPERMARKET / MINI MARKET =====
  {
    id: "tmpl-018-supermercado",
    businessType: "supermarket",
    name: "Supermercado / Mercearia",
    description: "Catálogo de produtos com preços e promoções",
    pageTitle: "Produtos do Mercado",
    formType: "catalog",
    whatsappCta: "Faça sua lista pelo WhatsApp",
    qrUseCase: "QR nas gôndolas para ver preço e ofertas",
    sections: [
      {
        title: "Ofertas da Semana",
        sectionType: "promotions",
        items: [
          { name: "Arroz Tipo 1 5kg", description: "Arroz branco longo fino", price: 22.9, isFeatured: true },
          { name: "Feijão Carioca 1kg", description: "Feijão carioca tipo 1", price: 7.9 },
          { name: "Óleo de Soja 900ml", description: "Óleo vegetal", price: 6.9 },
          { name: "Açúcar Refinado 5kg", description: "Açúcar cristal", price: 14.9 },
        ],
      },
      {
        title: "Hortifrúti",
        items: [
          { name: "Banana Prata", description: "1kg", price: 4.99, unit: "kg" },
          { name: "Maçã Nacional", description: "1kg", price: 6.99, unit: "kg" },
          { name: "Batata Inglesa", description: "1kg", price: 3.99, unit: "kg" },
          { name: "Tomate", description: "1kg", price: 5.99, unit: "kg" },
          { name: "Alface Americana", price: 3.99, unit: "unidade" },
          { name: "Cebola", description: "1kg", price: 4.49, unit: "kg" },
        ],
      },
      {
        title: "Mercearia",
        items: [
          { name: "Café Torrado Moído 500g", description: "Café tradicional", price: 14.9 },
          { name: "Leite UHT Integral 1L", price: 4.99 },
          { name: "Macarrão Espaguete 500g", price: 3.99 },
          { name: "Farinha de Trigo 1kg", price: 4.49 },
          { name: "Biscoito Recheado 130g", price: 2.99 },
          { name: "Molho de Tomate 340g", price: 3.49 },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", price: 5.99 },
          { name: "Refrigerante 2L", price: 8.99 },
          { name: "Suco em Pó 25g", price: 1.29 },
          { name: "Água Mineral 1.5L", price: 3.49 },
        ],
      },
      {
        title: "Limpeza",
        items: [
          { name: "Detergente Líquido 500ml", price: 2.99 },
          { name: "Sabão em Pó 1kg", price: 8.99 },
          { name: "Água Sanitária 1L", price: 4.49 },
          { name: "Esponja Dupla Face", price: 2.49 },
        ],
      },
    ],
  },

  // ===== 19. PET SHOP =====
  {
    id: "tmpl-019-pet-shop",
    businessType: "pet_shop",
    name: "Pet Shop",
    description: "Serviços e produtos para seu pet com agendamento online",
    pageTitle: "Pet Shop",
    formType: "booking",
    whatsappCta: "Agende pelo WhatsApp",
    qrUseCase: "QR na loja para agendar banho e tosa",
    sections: [
      {
        title: "Banho e Tosa",
        items: [
          { name: "Banho Pequeno Porte", description: "Cães até 10kg", price: 45.0, isFeatured: true },
          { name: "Banho Médio Porte", description: "Cães 10-25kg", price: 55.0 },
          { name: "Banho Grande Porte", description: "Cães acima de 25kg", price: 70.0 },
          { name: "Tosa Higiênica", description: "Tosa das áreas íntimas", price: 35.0 },
          { name: "Tosa Completa", description: "Tosa padronizada completa", price: 65.0 },
          { name: "Banho + Tosa Pequeno", description: "Combo completo", price: 75.0 },
          { name: "Banho + Tosa Médio", description: "Combo completo", price: 95.0 },
          { name: "Banho + Tosa Grande", description: "Combo completo", price: 120.0 },
        ],
      },
      {
        title: "Rações",
        items: [
          { name: "Ração Cães Adultos 15kg", description: "Premium sabor frango", price: 159.9 },
          { name: "Ração Cães Filhotes 15kg", description: "Premium sabor frango", price: 169.9 },
          { name: "Ração Gatos Adultos 7.5kg", description: "Premium sabor salmão", price: 129.9 },
          { name: "Ração Gatos Filhotes 7.5kg", description: "Premium sabor frango", price: 139.9 },
          { name: "Ração Premium Cães 15kg", description: "Super premium sabor cordeiro", price: 249.9 },
        ],
      },
      {
        title: "Acessórios",
        items: [
          { name: "Coleira Ajustável", description: "Couro sintético P/M/G", price: 34.9 },
          { name: "Guia Retrátil", description: "Guia 5 metros", price: 49.9 },
          { name: "Cama Pet", description: "Cama redonda peluciada", price: 89.9 },
          { name: "Brinquedo Pet", description: "Bola ou osso de borracha", price: 19.9 },
          { name: "Comedouro Automático", description: "2 compartimentos", price: 59.9 },
          { name: "Focinheira", description: "Focinheira de silicone", price: 29.9 },
        ],
      },
      {
        title: "Medicamentos e Cuidados",
        items: [
          { name: "Antipulgas Comprimido", description: "Para cães até 15kg", price: 59.9 },
          { name: "Vermífugo Oral", description: "Comprimido para cães", price: 39.9 },
          { name: "Coleira Antipulgas", description: "Proteção por 8 meses", price: 89.9 },
          { name: "Shampoo Pet", description: "Shampoo neutro 500ml", price: 29.9 },
        ],
      },
    ],
  },

  // ===== 20. VETERINARY CLINIC =====
  {
    id: "tmpl-020-veterinaria",
    businessType: "veterinary",
    name: "Clínica Veterinária",
    description: "Serviços veterinários, consultas e exames com agendamento",
    pageTitle: "Clínica Veterinária",
    formType: "booking",
    whatsappCta: "Agende consulta pelo WhatsApp",
    qrUseCase: "QR na clínica para agendar consultas",
    sections: [
      {
        title: "Consultas",
        items: [
          { name: "Consulta Clínica Geral", description: "Atendimento veterinário completo", price: 120.0, isFeatured: true },
          { name: "Consulta Especializada", description: "Cardiologia, dermatologia, etc.", price: 180.0 },
          { name: "Retorno", description: "Consulta de retorno", price: 80.0 },
          { name: "Consulta de Emergência", description: "Atendimento de urgência", price: 200.0 },
        ],
      },
      {
        title: "Exames",
        items: [
          { name: "Exame de Sangue", description: "Hemograma completo", price: 80.0 },
          { name: "Ultrassom", description: "Ultrassonografia abdominal", price: 200.0 },
          { name: "Raio-X", description: "Raio-X digital 2 posições", price: 150.0 },
          { name: "Teste Rápido Cinomose", description: "Teste de diagnóstico", price: 60.0 },
          { name: "Teste Rápido Leishmaniose", description: "Teste de diagnóstico", price: 70.0 },
        ],
      },
      {
        title: "Vacinas",
        items: [
          { name: "V8 Cães", description: "Vacina polivalente", price: 80.0 },
          { name: "V10 Cães", description: "Vacina polivalente completa", price: 95.0 },
          { name: "Antirrábica", description: "Vacina antirrábica", price: 60.0 },
          { name: "V4 Gatos", description: "Vacina polivalente felina", price: 80.0 },
        ],
      },
      {
        title: "Cirurgias",
        items: [
          { name: "Castração Macho", description: "Orquiectomia canina/felina", price: 350.0 },
          { name: "Castração Fêmea", description: "Ovariohisterectomia", price: 450.0 },
          { name: "Limpeza de Tártaro", description: "Profilaxia dentária", price: 200.0 },
        ],
      },
    ],
  },

  // ===== 21. BEAUTY SALON =====
  {
    id: "tmpl-021-salao",
    businessType: "salon",
    name: "Salão de Beleza",
    description: "Serviços de cabelo, unhas, sobrancelhas e pacotes",
    pageTitle: "Salão de Beleza",
    formType: "booking",
    whatsappCta: "Agende seu horário pelo WhatsApp",
    qrUseCase: "QR na recepção para ver serviços e agendar",
    sections: [
      {
        title: "Cabelo",
        items: [
          { name: "Corte Feminino", description: "Corte com lavagem e finalização", price: 55.0, isFeatured: true },
          { name: "Corte Masculino", description: "Corte com máquina e tesoura", price: 35.0 },
          { name: "Escova", description: "Escova modeladora com chapinha", price: 45.0 },
          { name: "Hidratação", description: "Hidratação capilar profunda", price: 55.0 },
          { name: "Coloração", description: "Coloração completa com tintura profissional", price: 80.0 },
          { name: "Progressiva", description: "Alisamento progressivo", price: 120.0 },
          { name: "Mechas/Luzes", description: "Mechas com técnica californiana", price: 150.0 },
          { name: "Botox Capilar", description: "Reconstrução com queratina", price: 90.0 },
        ],
      },
      {
        title: "Unhas",
        items: [
          { name: "Manicure", description: "Mãos completas com esmaltação", price: 30.0 },
          { name: "Pedicure", description: "Pés completos com esmaltação", price: 35.0 },
          { name: "Manicure + Pedicure", description: "Mãos e pés completos", price: 55.0 },
          { name: "Unhas de Gel", description: "Alongamento em gel", price: 120.0 },
          { name: "Fibra de Vidro", description: "Alongamento com fibra", price: 150.0 },
          { name: "Esmaltação em Gel", description: "Esmaltação duradoura", price: 60.0 },
        ],
      },
      {
        title: "Sobrancelhas",
        items: [
          { name: "Design de Sobrancelha", description: "Pinça e correção", price: 25.0 },
          { name: "Henna", description: "Design com henna", price: 35.0 },
          { name: "Micropigmentação", description: "Sessão de micropigmentação", price: 250.0 },
          { name: "Brow Lamination", description: "Lifting de sobrancelhas", price: 80.0 },
        ],
      },
      {
        title: "Pacotes",
        items: [
          { name: "Pacote Noiva", description: "Corte, escova, maquiagem, manicure e pedicure", price: 350.0, isFeatured: true },
          { name: "Pacote Debutante", description: "Corte, escova, maquiagem e unhas", price: 280.0 },
          { name: "Pacote Dia das Mães", description: "Hidratação, escova e manicure", price: 120.0 },
        ],
      },
    ],
  },

  // ===== 22. BARBER SHOP =====
  {
    id: "tmpl-022-barbearia",
    businessType: "barber_shop",
    name: "Barbearia",
    description: "Cortes masculinos, barba e serviços especiais",
    pageTitle: "Barbearia",
    formType: "booking",
    whatsappCta: "Agende seu horário pelo WhatsApp",
    qrUseCase: "QR na barbearia para agendar corte",
    sections: [
      {
        title: "Cortes",
        items: [
          { name: "Corte Degradê", description: "Corte degradê com máquina e tesoura", price: 40.0, isFeatured: true },
          { name: "Corte Social", description: "Corte social executivo", price: 35.0 },
          { name: "Corte Infantil", description: "Corte para crianças até 12 anos", price: 30.0 },
          { name: "Corte + Barba", description: "Combo completo", price: 60.0 },
          { name: "Corte + Hidratação", description: "Corte e hidratação capilar", price: 65.0 },
        ],
      },
      {
        title: "Barba",
        items: [
          { name: "Barba Completa", description: "Aparação e modelagem com navalha", price: 30.0 },
          { name: "Barba Tradicional", description: "Barba feita com pincel e navalha", price: 35.0 },
          { name: "Design de Barba", description: "Modelagem e desenho", price: 25.0 },
          { name: "Barboterapia", description: "Barba com toalha quente e pós-barba", price: 45.0 },
        ],
      },
      {
        title: "Serviços Especiais",
        items: [
          { name: "Sobrancelha", description: "Design de sobrancelha", price: 20.0 },
          { name: "Hidratação Capilar", description: "Hidratação com queratina", price: 35.0 },
          { name: "Pigmentação Capilar", description: "Técnica de microagulhamento", price: 200.0 },
          { name: "Depilação Nariz/Orelha", description: "Depilação com cera", price: 20.0 },
        ],
      },
      {
        title: "Pacotes",
        items: [
          { name: "Pacote Executivo", description: "Corte + barba + hidratação", price: 85.0, isFeatured: true },
          { name: "Pacote Noivo", description: "Corte, barba e sobrancelha", price: 80.0 },
        ],
      },
    ],
  },

  // ===== 23. NAIL STUDIO =====
  {
    id: "tmpl-023-unhas",
    businessType: "nail_studio",
    name: "Estúdio de Unhas",
    description: "Serviços especializados em unhas, nail art e alongamento",
    pageTitle: "Studio de Unhas",
    formType: "booking",
    whatsappCta: "Agende seu horário pelo WhatsApp",
    qrUseCase: "QR no estúdio para ver serviços e preços",
    sections: [
      {
        title: "Esmaltação",
        items: [
          { name: "Manicure Simples", description: "Unhas naturais com esmalte comum", price: 25.0, isFeatured: true },
          { name: "Pedicure Simples", description: "Pés com esmalte comum", price: 30.0 },
          { name: "Manicure + Pedicure", description: "Mãos e pés", price: 50.0 },
          { name: "Esmaltação em Gel", description: "Esmalte em gel duradouro", price: 55.0 },
        ],
      },
      {
        title: "Alongamento",
        items: [
          { name: "Alongamento Gel Molde", description: "Moldes em gel", price: 110.0 },
          { name: "Alongamento Fibra de Vidro", description: "Fibra de vidro", price: 140.0 },
          { name: "Manutenção Gel", description: "Manutenção mensal", price: 70.0 },
          { name: "Manutenção Fibra", description: "Manutenção mensal", price: 80.0 },
        ],
      },
      {
        title: "Nail Art",
        items: [
          { name: "Nail Art Simples", description: "Desenhos básicos por unha", price: 8.0, unit: "unha" },
          { name: "Nail Art Decorada", description: "Desenhos detalhados por unha", price: 12.0, unit: "unha" },
          { name: "Francesinha", description: "Esmaltação francesinha", price: 10.0 },
          { name: "Aplicação de Strass", description: "Por unidade", price: 3.0, unit: "unidade" },
        ],
      },
      {
        title: "Cuidados",
        items: [
          { name: "Spa dos Pés", description: "Hidratação e massagem", price: 45.0 },
          { name: "Spa das Mãos", description: "Esfoliação e hidratação", price: 40.0 },
          { name: "Cutilagem", description: "Limpeza de cutículas", price: 15.0 },
          { name: "Pé e Mão + Spa", description: "Combo completo", price: 80.0 },
        ],
      },
    ],
  },

  // ===== 24. SPA / MASSAGE =====
  {
    id: "tmpl-024-spa",
    businessType: "spa",
    name: "Spa & Massagem",
    description: "Massagens relaxantes, tratamentos corporais e pacotes",
    pageTitle: "Spa",
    formType: "booking",
    whatsappCta: "Agende sua sessão pelo WhatsApp",
    qrUseCase: "QR no spa para ver tratamentos e agendar",
    sections: [
      {
        title: "Massagens",
        items: [
          { name: "Massagem Relaxante", description: "Massagem corporal completa 60min", price: 120.0, isFeatured: true },
          { name: "Massagem Modeladora", description: "Massagem com técnicas modeladoras 50min", price: 140.0 },
          { name: "Massagem Desportiva", description: "Massagem para atletas 60min", price: 130.0 },
          { name: "Quick Massagem", description: "Massagem rápida 20min", price: 50.0 },
          { name: "Massagem com Pedras Quentes", description: "Massagem relaxante com pedras 60min", price: 160.0 },
          { name: "Massagem Shiatsu", description: "Técnica japonesa 50min", price: 130.0 },
        ],
      },
      {
        title: "Tratamentos Corporais",
        items: [
          { name: "Banho de Ofurô", description: "Banho relaxante 30min", price: 80.0 },
          { name: "Esfoliação Corporal", description: "Esfoliação com sais aromáticos", price: 90.0 },
          { name: "Hidratação Corporal", description: "Hidratação com creme nutritivo", price: 100.0 },
          { name: "Drenagem Linfática", description: "Drenagem linfática manual 60min", price: 130.0 },
        ],
      },
      {
        title: "Pacotes",
        items: [
          { name: "Pacote Relaxante", description: "Massagem + ofurô + chá", price: 180.0, isFeatured: true },
          { name: "Pacote Detox", description: "Drenagem + esfoliação + massagem", price: 250.0 },
          { name: "Pacote Romântico", description: "Para casal: massagem + espumante", price: 350.0 },
          { name: "Day Spa", description: "Dia completo de tratamentos", price: 450.0 },
        ],
      },
    ],
  },

  // ===== 25. DENTAL CLINIC =====
  {
    id: "tmpl-025-dentista",
    businessType: "dental_clinic",
    name: "Clínica Odontológica",
    description: "Tratamentos dentários, limpeza, clareamento e implantes",
    pageTitle: "Clínica Odontológica",
    formType: "booking",
    whatsappCta: "Agende sua consulta pelo WhatsApp",
    qrUseCase: "QR na clínica para agendar consultas",
    sections: [
      {
        title: "Consultas",
        items: [
          { name: "Consulta Inicial", description: "Avaliação clínica completa", price: 120.0, isFeatured: true },
          { name: "Urgência Odontológica", description: "Atendimento de urgência", price: 150.0 },
          { name: "Retorno", description: "Consulta de retorno", price: 80.0 },
        ],
      },
      {
        title: "Procedimentos",
        items: [
          { name: "Limpeza / Profilaxia", description: "Limpeza profunda com ultrassom", price: 150.0 },
          { name: "Clareamento Dental", description: "Clareamento a laser com moldeira", price: 800.0 },
          { name: "Restauração", description: "Restauração em resina composta", price: 180.0 },
          { name: "Extração Simples", description: "Extração dentária", price: 200.0 },
          { name: "Canal (Endodontia)", description: "Tratamento de canal", price: 600.0 },
          { name: "Implante Dentário", description: "Implante com coroa", price: 2500.0 },
        ],
      },
      {
        title: "Ortodontia",
        items: [
          { name: "Aparelho Fixo Metálico", description: "Aparelho ortodôntico mensalidade", price: 250.0 },
          { name: "Aparelho Estético", description: "Aparelho estético cerâmico", price: 350.0 },
          { name: "Alinhadores Invisíveis", description: "Mensalidade do tratamento", price: 400.0 },
          { name: "Manutenção", description: "Manutenção mensal", price: 100.0 },
        ],
      },
      {
        title: "Estética",
        items: [
          { name: "Facetas de Resina", description: "Por dente", price: 350.0, unit: "dente" },
          { name: "Facetas de Porcelana", description: "Por dente", price: 800.0, unit: "dente" },
          { name: "Lentes de Contato Dental", description: "Por dente", price: 1200.0, unit: "dente" },
          { name: "Gengivoplastia", description: "Correção de sorriso gengival", price: 500.0 },
        ],
      },
    ],
  },

  // ===== 26. MEDICAL CLINIC =====
  {
    id: "tmpl-026-medica",
    businessType: "medical_clinic",
    name: "Clínica Médica",
    description: "Consultas médicas, exames e especialidades",
    pageTitle: "Clínica Médica",
    formType: "booking",
    whatsappCta: "Agende sua consulta pelo WhatsApp",
    qrUseCase: "QR na clínica para agendamento online",
    sections: [
      {
        title: "Especialidades",
        items: [
          { name: "Clínico Geral", description: "Consulta médica geral", price: 150.0, isFeatured: true },
          { name: "Pediatria", description: "Consulta pediátrica", price: 160.0 },
          { name: "Ginecologia", description: "Consulta ginecológica", price: 180.0 },
          { name: "Cardiologia", description: "Consulta cardiológica", price: 200.0 },
          { name: "Dermatologia", description: "Consulta dermatológica", price: 200.0 },
          { name: "Ortopedia", description: "Consulta ortopédica", price: 180.0 },
          { name: "Psicologia", description: "Sessão de psicoterapia", price: 120.0 },
          { name: "Nutrição", description: "Consulta nutricional", price: 130.0 },
        ],
      },
      {
        title: "Exames",
        items: [
          { name: "Eletrocardiograma", description: "ECG de repouso", price: 80.0 },
          { name: "Ultrassom Abdominal", description: "Ultrassonografia total", price: 200.0 },
          { name: "Raio-X", description: "Raio-X digital", price: 80.0 },
          { name: "Exames Laboratoriais", description: "Solicitação de exames de sangue", price: 30.0 },
          { name: "Teste Ergométrico", description: "Teste de esforço", price: 150.0 },
        ],
      },
      {
        title: "Telemedicina",
        items: [
          { name: "Teleconsulta Clínico Geral", description: "Consulta online por vídeo", price: 100.0 },
          { name: "Teleconsulta Especialista", description: "Consulta online com especialista", price: 130.0 },
          { name: "Segunda Opinião", description: "Análise de caso", price: 150.0 },
        ],
      },
    ],
  },

  // ===== 27. PHYSIOTHERAPY =====
  {
    id: "tmpl-027-fisioterapia",
    businessType: "physiotherapy",
    name: "Fisioterapia",
    description: "Tratamentos de fisioterapia, reabilitação e pilates",
    pageTitle: "Fisioterapia",
    formType: "booking",
    whatsappCta: "Agende sua sessão pelo WhatsApp",
    qrUseCase: "QR na clínica para agendar sessões",
    sections: [
      {
        title: "Fisioterapia",
        items: [
          { name: "Sessão de Fisioterapia", description: "Fisioterapia individual 50min", price: 80.0, isFeatured: true },
          { name: "Fisioterapia Domiciliar", description: "Atendimento em casa", price: 120.0 },
          { name: "RPG (Reeducação Postural)", description: "Sessão de RPG", price: 90.0 },
          { name: "Fisioterapia Traumato-ortopédica", description: "Reabilitação de lesões", price: 85.0 },
          { name: "Fisioterapia Respiratória", description: "Reabilitação pulmonar", price: 80.0 },
        ],
      },
      {
        title: "Pilates",
        items: [
          { name: "Pilates Individual", description: "Sessão de pilates individual", price: 70.0 },
          { name: "Pilates Dupla", description: "Sessão em dupla", price: 50.0, unit: "por pessoa" },
          { name: "Pilates Grupo (3+ pessoas)", description: "Sessão em grupo", price: 40.0, unit: "por pessoa" },
          { name: "Avaliação Pilates", description: "Avaliação inicial", price: 50.0 },
        ],
      },
      {
        title: "Pacotes",
        items: [
          { name: "Pacote 10 Sessões", description: "Fisioterapia (economia de 15%)", price: 680.0, isFeatured: true },
          { name: "Pacote 10 Sessões Pilates", description: "Pilates individual (economia de 15%)", price: 595.0 },
          { name: "Pacote Mensal Pilates", description: "2x por semana ilimitado", price: 250.0 },
        ],
      },
    ],
  },

  // ===== 28. GYM / PERSONAL TRAINER =====
  {
    id: "tmpl-028-academia",
    businessType: "gym",
    name: "Academia / Personal Trainer",
    description: "Planos, horários, aulas e matrícula online",
    pageTitle: "Academia",
    formType: "lead",
    whatsappCta: "Matricule-se pelo WhatsApp",
    qrUseCase: "QR na academia para ver planos e se matricular",
    sections: [
      {
        title: "Planos",
        items: [
          { name: "Plano Mensal", description: "Acesso ilimitado à academia", price: 89.9, isFeatured: true },
          { name: "Plano Trimestral", description: "3 meses com 10% de desconto", price: 239.9 },
          { name: "Plano Semestral", description: "6 meses com 15% de desconto", price: 449.9 },
          { name: "Plano Anual", description: "12 meses com 20% de desconto", price: 859.0 },
          { name: "Plano Premium", description: "Acesso ilimitado + personal trainer 2x/sem", price: 179.9 },
          { name: "Aula Experimental", description: "Primeira aula gratuita", price: 0, isFeatured: true },
        ],
      },
      {
        title: "Modalidades",
        items: [
          { name: "Musculação", description: "Sala de musculação com instrutores", price: 0, unit: "incluso" },
          { name: "CrossFit", description: "Treino funcional intenso", price: 0, unit: "incluso" },
          { name: "Pilates de Solo", description: "Aula de pilates em grupo", price: 0, unit: "incluso" },
          { name: "Spinning", description: "Aula de bike indoor", price: 0, unit: "incluso" },
          { name: "Yoga", description: "Aula de yoga e alongamento", price: 0, unit: "incluso" },
          { name: "Funcional", description: "Treino funcional em grupo", price: 0, unit: "incluso" },
          { name: "Dança", description: "Zumba, fit dance e mais", price: 0, unit: "incluso" },
          { name: "Lutas", description: "Muay Thai, jiu-jitsu, boxe", price: 0, unit: "incluso" },
        ],
      },
      {
        title: "Personal Trainer",
        items: [
          { name: "Personal 1x/sem", description: "Sessão individual 50min", price: 149.9 },
          { name: "Personal 2x/sem", description: "Sessão individual 50min", price: 249.9 },
          { name: "Personal 3x/sem", description: "Sessão individual 50min", price: 329.9 },
          { name: "Consultoria Online", description: "Treino montado com acompanhamento remoto", price: 79.9 },
        ],
      },
    ],
  },

  // ===== 29. HOTEL / POUSADA =====
  {
    id: "tmpl-029-hotel",
    businessType: "hotel",
    name: "Hotel & Pousada",
    description: "Guia digital do hóspede com serviços, cardápio e informações",
    pageTitle: "Guia do Hóspede",
    formType: "catalog",
    whatsappCta: "Fale com a recepção pelo WhatsApp",
    qrUseCase: "QR no quarto para acessar guia do hóspede",
    sections: [
      {
        title: "Informações do Quarto",
        sectionType: "info",
        items: [
          { name: "Wi-Fi", description: "Rede: Hotel Guest | Senha: disponível na recepção", price: 0 },
          { name: "Check-out", description: "Horário: até 12h. Late check-out disponível", price: 0 },
          { name: "Café da Manhã", description: "Servido das 6h30 às 10h no restaurante", price: 0, isFeatured: true },
          { name: "Estacionamento", description: "Gratuito para hóspedes", price: 0 },
          { name: "Toalhas Extras", description: "Solicite na recepção", price: 0 },
        ],
      },
      {
        title: "Serviços do Hotel",
        items: [
          { name: "Room Service", description: "Cardápio disponível 24h", price: 0 },
          { name: "Lavanderia", description: "Serviço de lavagem e passadoria", price: 25.0 },
          { name: "Transfer", description: "Translado aeroporto", price: 60.0 },
          { name: "Passeios Turísticos", description: "Consulte nossa agência", price: 0 },
          { name: "Babá", description: "Serviço de babá por hora", price: 30.0, unit: "hora" },
        ],
      },
      {
        title: "Cardápio do Quarto",
        items: [
          { name: "Água Mineral", description: "500ml", price: 5.0 },
          { name: "Refrigerante", description: "Lata", price: 8.0 },
          { name: "Cerveja", description: "Long neck", price: 10.0 },
          { name: "Sanduíche Natural", description: "Pão integral, frango e salada", price: 25.0 },
          { name: "Porção de Batata", description: "Batata frita crocante", price: 22.0 },
          { name: "Hambúrguer do Chef", description: "Artesanal 180g com fritas", price: 35.0 },
        ],
      },
      {
        title: "Regras",
        sectionType: "info",
        items: [
          { name: "Não fumar nos quartos", description: "Multa de R$ 200,00", price: 0 },
          { name: "Silêncio após 22h", description: "Respeite o sossego dos demais hóspedes", price: 0 },
          { name: "Animais de Estimação", description: "Consultar disponibilidade", price: 0 },
          { name: "Cancelamentos", description: "Cancelamento grátis até 48h antes", price: 0 },
        ],
      },
    ],
  },

  // ===== 30. REAL ESTATE AGENCY =====
  {
    id: "tmpl-030-imobiliaria",
    businessType: "real_estate",
    name: "Imobiliária",
    description: "Catálogo de imóveis com fotos, preços e agendamento",
    pageTitle: "Imóveis Disponíveis",
    formType: "lead",
    whatsappCta: "Agende uma visita pelo WhatsApp",
    qrUseCase: "QR na placa de 'Vende-se' para ver detalhes do imóvel",
    sections: [
      {
        title: "Imóveis à Venda",
        items: [
          { name: "Apartamento 2 Quartos", description: "50m², sala, cozinha, banheiro, vaga", price: 250000, isFeatured: true },
          { name: "Casa 3 Quartos", description: "120m², 2 suítes, piscina, churrasqueira", price: 450000 },
          { name: "Kitnet/Studio", description: "30m², mobiliado, centro", price: 150000 },
          { name: "Cobertura Duplex", description: "200m², 3 suítes, terraço com piscina", price: 850000 },
          { name: "Terreno Residencial", description: "300m², plano, infraestrutura", price: 180000 },
          { name: "Sala Comercial", description: "60m², 2 salas + banheiro", price: 200000 },
          { name: "Chácara/Sítio", description: "5000m², casa 3 dorm, piscina, pomar", price: 680000 },
          { name: "Galpão Industrial", description: "300m², pé direito alto, doca", price: 500000 },
        ],
      },
      {
        title: "Imóveis para Alugar",
        items: [
          { name: "Apartamento 2 Quartos", description: "Condomínio incluso, centro", price: 2000, unit: "mês" },
          { name: "Casa 3 Quartos", description: "Bairro nobre, 2 vagas", price: 3500, unit: "mês" },
          { name: "Sala Comercial", description: "Centro, 40m²", price: 1500, unit: "mês" },
          { name: "Kitnet", description: "Mobiliada, contas inclusas", price: 1200, unit: "mês" },
        ],
      },
      {
        title: "Lançamentos",
        items: [
          { name: "Residencial Park Avenue", description: "2 e 3 quartos, lazer completo, previsão 2026", price: 320000 },
          { name: "Edifício Comercial Prime", description: "Salas de 35m² a 100m²", price: 250000 },
        ],
      },
    ],
  },

  // ===== 31. CAR DEALERSHIP =====
  {
    id: "tmpl-031-concessionaria",
    businessType: "car_dealership",
    name: "Concessionária",
    description: "Catálogo de veículos zero km e seminovos",
    pageTitle: "Veículos Disponíveis",
    formType: "lead",
    whatsappCta: "Solicite oferta pelo WhatsApp",
    qrUseCase: "QR no carro em exposição para ver ficha técnica",
    sections: [
      {
        title: "Zero KM",
        items: [
          { name: "Hatch Compacto", description: "1.0 flex, 5 portas, ar, direção", price: 69990, isFeatured: true },
          { name: "Sedan Médio", description: "1.6 flex, automático, completo", price: 89990 },
          { name: "SUV Compacto", description: "1.0 turbo, automático, 5 lugares", price: 119990 },
          { name: "Picape Média", description: "2.4 diesel, cabine dupla, 4x4", price: 199990 },
          { name: "SUV Grande", description: "2.0 turbo, 7 lugares, automático", price: 249990 },
        ],
      },
      {
        title: "Seminovos",
        items: [
          { name: "Hatch 2022/2023", description: "30.000km, completo, único dono", price: 49990 },
          { name: "Sedan 2021/2022", description: "40.000km, automático, revisado", price: 59990 },
          { name: "SUV 2020/2021", description: "50.000km, diesel, 4x4", price: 99990 },
          { name: "Picape 2021/2022", description: "60.000km, cabine dupla, única dono", price: 129990 },
          { name: "Hatch 2020/2021", description: "35.000km econômico", price: 39990 },
        ],
      },
      {
        title: "Serviços",
        items: [
          { name: "Avaliação de Veículo", description: "Avaliação gratuita para troca", price: 0 },
          { name: "Financiamento", description: "Simulação de financiamento em até 60x", price: 0 },
          { name: "Seguro Auto", description: "Cotação de seguro", price: 0 },
          { name: "Test Drive", description: "Agende seu test drive", price: 0 },
        ],
      },
    ],
  },

  // ===== 32. AUTO REPAIR SHOP =====
  {
    id: "tmpl-032-mecanica",
    businessType: "auto_repair",
    name: "Oficina Mecânica",
    description: "Serviços automotivos completos com orçamento online",
    pageTitle: "Oficina Mecânica",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na oficina para agendar revisão",
    sections: [
      {
        title: "Revisões e Manutenção",
        items: [
          { name: "Revisão Básica", description: "Troca de óleo, filtros e calibragem", price: 149.9, isFeatured: true },
          { name: "Revisão Completa", description: "Óleo, filtros, velas, cabos, correias e fluidos", price: 399.9 },
          { name: "Troca de Óleo Simples", description: "Óleo mineral + filtro", price: 89.9 },
          { name: "Troca de Óleo Sintético", description: "Óleo sintético + filtro de qualidade", price: 149.9 },
        ],
      },
      {
        title: "Suspensão e Freios",
        items: [
          { name: "Alinhamento", description: "Alinhamento de direção 2 eixos", price: 59.9 },
          { name: "Balanceamento", description: "Balanceamento 4 rodas", price: 69.9 },
          { name: "Alinhamento + Balanceamento", description: "Combo completo", price: 109.9 },
          { name: "Troca de Pastilhas de Freio", description: "Par dianteiro ou traseiro", price: 149.9 },
          { name: "Troca de Discos de Freio", description: "Par dianteiro ou traseiro", price: 249.9 },
          { name: "Troca de Amortecedores", description: "Par dianteiro ou traseiro", price: 399.9 },
        ],
      },
      {
        title: "Motor e Elétrica",
        items: [
          { name: "Diagnóstico Eletrônico", description: "Scanner completo do veículo", price: 89.9 },
          { name: "Troca de Bateria", description: "Bateria 60Ah inclusa + mão de obra", price: 199.9 },
          { name: "Troca Correia Dentada", description: "Correia dentada + tensor", price: 349.9 },
          { name: "Limpeza de Bicos", description: "Limpeza ultrassônica 4 bicos", price: 149.9 },
          { name: "Troca Velas de Ignição", description: "4 velas + mão de obra", price: 99.9 },
        ],
      },
      {
        title: "Ar Condicionado",
        items: [
          { name: "Recarga de Gás", description: "Recarga completa do sistema", price: 129.9 },
          { name: "Limpeza do Sistema", description: "Limpeza e higienização", price: 89.9 },
          { name: "Revisão Completa Ar", description: "Limpeza, recarga e desinfecção", price: 199.9 },
        ],
      },
    ],
  },

  // ===== 33. MOTORCYCLE REPAIR SHOP =====
  {
    id: "tmpl-033-motocicleta",
    businessType: "motorcycle_repair",
    name: "Oficina de Motos",
    description: "Manutenção e reparos para motocicletas",
    pageTitle: "Oficina de Motos",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na oficina para agendar serviço",
    sections: [
      {
        title: "Revisões",
        items: [
          { name: "Revisão Simples", description: "Troca de óleo, filtro e lubrificação corrente", price: 99.9, isFeatured: true },
          { name: "Revisão Completa", description: "Óleo, filtros, velas, cabos e ajustes", price: 249.9 },
          { name: "Troca de Óleo e Filtro", description: "Óleo semi-sintético + filtro", price: 79.9 },
          { name: "Troca de Óleo (moto grande)", description: "3 litros óleo sintético + filtro", price: 159.9 },
        ],
      },
      {
        title: "Freios e Suspensão",
        items: [
          { name: "Troca Pastilhas Freio Dianteiro", description: "Par completo", price: 89.9 },
          { name: "Troca Pastilhas Freio Traseiro", description: "Par completo", price: 79.9 },
          { name: "Troca de Lona de Freio", description: "Freio traseiro tambor", price: 59.9 },
          { name: "Troca Fluido de Freio", description: "Sangria e troca do fluido", price: 49.9 },
          { name: "Regulagem Suspensão", description: "Ajuste de suspensão dianteira/traseira", price: 69.9 },
        ],
      },
      {
        title: "Motor e Transmissão",
        items: [
          { name: "Regulagem de Carburador", description: "Limpeza e regulagem", price: 89.9 },
          { name: "Troca de Corrente e Relação", description: "Corrente + coroa + pinhão", price: 249.9 },
          { name: "Troca de Pneus", description: "Mão de obra para troca de pneus", price: 49.9, unit: "unidade" },
          { name: "Troca Vela de Ignição", description: "1 vela + mão de obra", price: 39.9 },
          { name: "Troca Bateria Moto", description: "Bateria 12Ah inclusa", price: 149.9 },
        ],
      },
    ],
  },

  // ===== 34. CAR WASH =====
  {
    id: "tmpl-034-lava-rapido",
    businessType: "car_wash",
    name: "Lava Rápido",
    description: "Serviços de lavagem, higienização e detalhamento automotivo",
    pageTitle: "Lava Rápido",
    formType: "booking",
    whatsappCta: "Agende seu horário pelo WhatsApp",
    qrUseCase: "QR no lava rápido para ver serviços e preços",
    sections: [
      {
        title: "Lavagem",
        items: [
          { name: "Lavagem Simples", description: "Lavagem externa com cera líquida", price: 25.0, isFeatured: true },
          { name: "Lavagem Completa", description: "Externa + interna + aspirador + pano", price: 45.0 },
          { name: "Lavagem de Motor", description: "Lavagem do compartimento do motor", price: 40.0 },
          { name: "Lavagem Técnica", description: "Lavagem completa + motor + pneu com silicone", price: 65.0 },
          { name: "Lavagem Caminhonete", description: "Lavagem completa para picapes", price: 60.0 },
        ],
      },
      {
        title: "Higienização",
        items: [
          { name: "Higienização Interna", description: "Aspiração profunda + pano + perfume", price: 80.0 },
          { name: "Higienização Completa", description: "Bancos, carpetes, teto e laterais", price: 150.0 },
          { name: "Ozônio", description: "Esterilização por ozônio", price: 40.0 },
          { name: "Limpeza de Bancos de Couro", description: "Hidratação e limpeza de couro", price: 60.0 },
        ],
      },
      {
        title: "Detalhamento",
        items: [
          { name: "Vitrificação de Pintura", description: "Proteção cerâmica básica", price: 200.0 },
          { name: "Polimento Cristal", description: "Polimento da pintura", price: 150.0 },
          { name: "Remoção de Chuva Ácida", description: "Remoção de manchas da pintura", price: 180.0 },
          { name: "Espelhamento", description: "Polimento profundo + vitrificação", price: 350.0 },
        ],
      },
    ],
  },

  // ===== 35. EVENT ORGANIZER =====
  {
    id: "tmpl-035-eventos",
    businessType: "event",
    name: "Organizador de Eventos",
    description: "Serviços para casamentos, festas e eventos corporativos",
    pageTitle: "Eventos",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR no material de divulgação para ver portfólio",
    sections: [
      {
        title: "Pacotes de Eventos",
        items: [
          { name: "Pacote Casamento Básico", description: "50 convidados, decoração, buffet e DJ", price: 15000, isFeatured: true },
          { name: "Pacote Casamento Premium", description: "150 convidados, decoração, buffet, DJ, fotografia e cerimonial", price: 35000 },
          { name: "Pacote 15 Anos", description: "100 convidados, decoração, buffet e animação", price: 12000 },
          { name: "Pacote Corporativo", description: "Coffee break, sala de reunião e equipamentos", price: 2500 },
        ],
      },
      {
        title: "Serviços Avulsos",
        items: [
          { name: "Decoração de Festa", description: "Orçamento por tipo de evento", price: 0 },
          { name: "Buffet por Pessoa", description: "Buffet completo + bebidas", price: 80.0, unit: "pessoa" },
          { name: "DJ / Som", description: "Equipamento de som e DJ", price: 1500.0 },
          { name: "Fotografia e Filmagem", description: "Cobertura completa do evento", price: 2500.0 },
          { name: "Cerimonial", description: "Acompanhamento completo", price: 2000.0 },
          { name: "Espaço para Eventos", description: "Salão com capacidade para 200 pessoas", price: 5000.0 },
        ],
      },
      {
        title: "Portfólio",
        sectionType: "gallery",
        items: [
          { name: "Galeria de Eventos Realizados", description: "Veja nossos trabalhos anteriores", price: 0 },
          { name: "Depoimentos de Clientes", description: "O que nossos clientes dizem", price: 0 },
        ],
      },
    ],
  },

  // ===== 36. PARTY RENTAL STORE =====
  {
    id: "tmpl-036-festas",
    businessType: "party_rental",
    name: "Aluguel para Festas",
    description: "Aluguel de brinquedos, mesas, cadeiras e decoração",
    pageTitle: "Aluguel para Festas",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR no material promocional para ver catálogo",
    sections: [
      {
        title: "Brinquedos Infláveis",
        items: [
          { name: "Pula-Pula", description: "3mx3m para crianças até 8 anos", price: 199.9, unit: "diária", isFeatured: true },
          { name: "Escorregador Inflável", description: "3m de altura", price: 249.9, unit: "diária" },
          { name: "Castelo Inflável", description: "4mx4m com piscina de bolinhas", price: 299.9, unit: "diária" },
          { name: "Futebol de Sabão", description: "Quadra inflável", price: 350.0, unit: "diária" },
        ],
      },
      {
        title: "Mesas e Cadeiras",
        items: [
          { name: "Mesa Redonda 6 lugares", description: "Mesa redonda infantil", price: 15.0, unit: "unidade" },
          { name: "Mesa Retangular 8 lugares", description: "Mesa adulto", price: 20.0, unit: "unidade" },
          { name: "Cadeira Infantil", description: "Cadeira colorida", price: 5.0, unit: "unidade" },
          { name: "Cadeira Dobrável", description: "Cadeira adulto", price: 6.0, unit: "unidade" },
          { name: "Tenda 4x4", description: "Tenda branca 16m²", price: 99.9, unit: "diária" },
        ],
      },
      {
        title: "Decoração",
        items: [
          { name: "Kit Mesa Infantil", description: "Toalha, prato, copo e guardanapo (10 peças)", price: 39.9 },
          { name: "Balões Decorados", description: "Arco de balões", price: 79.9 },
          { name: "Painel de Festa", description: "Painel 2x1.5m personalizado", price: 89.9 },
          { name: "Fontes de Chocolate", description: "Fonte 3 andares", price: 89.9, unit: "diária" },
        ],
      },
      {
        title: "Utensílios",
        items: [
          { name: "Jogo de Pratos", description: "Kit 24 peças", price: 12.0 },
          { name: "Jogo de Talheres", description: "Kit 24 peças", price: 10.0 },
          { name: "Copos de Vidro", description: "Kit 24 peças americano", price: 15.0 },
          { name: "Panelão 20L", description: "Panelão de alumínio", price: 25.0, unit: "diária" },
        ],
      },
    ],
  },

  // ===== 37. SCHOOL / COURSE =====
  {
    id: "tmpl-037-escola",
    businessType: "school",
    name: "Escola / Curso",
    description: "Cursos, horários, matrícula e informações acadêmicas",
    pageTitle: "Escola de Cursos",
    formType: "lead",
    whatsappCta: "Matricule-se pelo WhatsApp",
    qrUseCase: "QR na escola para ver grade de cursos",
    sections: [
      {
        title: "Cursos Regulares",
        items: [
          { name: "Ensino Fundamental", description: "1º ao 9º ano, período integral", price: 499.0, unit: "mês", isFeatured: true },
          { name: "Ensino Médio", description: "1º ao 3º ano, preparatório ENEM", price: 599.0, unit: "mês" },
          { name: "Educação Infantil", description: "Berçário e maternal", price: 699.0, unit: "mês" },
          { name: "EJA (Educação Jovens/Adultos)", description: "Ensino fundamental e médio", price: 199.0, unit: "mês" },
        ],
      },
      {
        title: "Cursos Livres",
        items: [
          { name: "Curso de Inglês", description: "Todos os níveis, materiais inclusos", price: 149.9, unit: "mês" },
          { name: "Curso de Espanhol", description: "Básico ao avançado", price: 129.9, unit: "mês" },
          { name: "Informática Básica", description: "Windows, Office e internet", price: 99.9, unit: "mês" },
          { name: "Robótica", description: "Aulas práticas com kits", price: 179.9, unit: "mês" },
          { name: "Curso Preparatório ENEM", description: "Intensivo", price: 299.9, unit: "mês" },
          { name: "Reforço Escolar", description: "Acompanhamento personalizado", price: 24.9, unit: "hora/aula" },
        ],
      },
      {
        title: "Matrícula e Documentos",
        items: [
          { name: "Matrícula", description: "Taxa única de matrícula", price: 150.0 },
          { name: "Rematrícula", description: "Renovação anual", price: 100.0 },
          { name: "Material Didático", description: "Kit anual completo", price: 350.0 },
          { name: "Uniforme Escolar", description: "Kit completo", price: 199.9 },
        ],
      },
    ],
  },

  // ===== 38. DAYCARE =====
  {
    id: "tmpl-038-creche",
    businessType: "daycare",
    name: "Creche",
    description: "Berçário e educação infantil com acompanhamento",
    pageTitle: "Creche e Berçário",
    formType: "lead",
    whatsappCta: "Agende uma visita pelo WhatsApp",
    qrUseCase: "QR na creche para ver informações e matrícula",
    sections: [
      {
        title: "Períodos",
        items: [
          { name: "Período Integral", description: "07h às 18h com alimentação inclusa", price: 799.0, unit: "mês", isFeatured: true },
          { name: "Meio Período Manhã", description: "07h às 12h com alimentação", price: 499.0, unit: "mês" },
          { name: "Meio Período Tarde", description: "13h às 18h com alimentação", price: 499.0, unit: "mês" },
          { name: "Período Estendido", description: "06h30 às 19h com alimentação", price: 999.0, unit: "mês" },
        ],
      },
      {
        title: "Faixas Etárias",
        items: [
          { name: "Berçário I", description: "4 a 11 meses", price: 0, unit: "consulte" },
          { name: "Berçário II", description: "12 a 23 meses", price: 0, unit: "consulte" },
          { name: "Maternal I", description: "2 anos", price: 0, unit: "consulte" },
          { name: "Maternal II", description: "3 anos", price: 0, unit: "consulte" },
          { name: "Pré-escola", description: "4 e 5 anos", price: 0, unit: "consulte" },
        ],
      },
      {
        title: "Atividades",
        items: [
          { name: "Psicomotricidade", description: "Atividades de desenvolvimento motor", price: 0 },
          { name: "Música", description: "Aula de musicalização infantil", price: 0 },
          { name: "Inglês", description: "Iniciação ao inglês lúdico", price: 0 },
          { name: "Natação", description: "Aula de natação (3+ anos)", price: 0 },
        ],
      },
    ],
  },

  // ===== 39. CHURCH / COMMUNITY GROUP =====
  {
    id: "tmpl-039-igreja",
    businessType: "church",
    name: "Igreja / Grupo Comunitário",
    description: "Programação de cultos, eventos e doações",
    pageTitle: "Igreja",
    formType: "lead",
    whatsappCta: "Entre em contato pelo WhatsApp",
    qrUseCase: "QR na igreja para ver programação semanal",
    sections: [
      {
        title: "Programação Semanal",
        sectionType: "schedule",
        items: [
          { name: "Culto Dominical", description: "Domingo às 09h00 e 19h00", price: 0, isFeatured: true },
          { name: "Culto de Oração", description: "Quarta-feira às 19h00", price: 0 },
          { name: "Culto de Jovens", description: "Sábado às 18h00", price: 0 },
          { name: "Escola Bíblica", description: "Domingo às 08h00", price: 0 },
          { name: "Grupo Pequeno", description: "Terça-feira às 19h00", price: 0 },
          { name: "Culto Infantil", description: "Domingo às 09h00 (simultâneo)", price: 0 },
        ],
      },
      {
        title: "Eventos Especiais",
        sectionType: "events",
        items: [
          { name: "Próximo Evento", description: "Confira nosso calendário de eventos", price: 0 },
          { name: "Campanha Solidária", description: "Arrecadação de alimentos e agasalhos", price: 0 },
          { name: "Retiro Espiritual", description: "Inscrições abertas", price: 0 },
        ],
      },
      {
        title: "Contribuições",
        items: [
          { name: "Dízimo", description: "Contribua com seu dízimo via PIX", price: 0 },
          { name: "Ofertas", description: "Ofertas voluntárias", price: 0 },
          { name: "Doações", description: "Contribua com nossos projetos sociais", price: 0 },
        ],
      },
    ],
  },

  // ===== 40. FREELANCER / SERVICE PROVIDER =====
  {
    id: "tmpl-040-freelancer",
    businessType: "freelancer",
    name: "Freelancer / Prestador de Serviços",
    description: "Portfólio profissional e solicitação de orçamento",
    pageTitle: "Serviços Profissionais",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR no cartão de visitas para ver portfólio",
    sections: [
      {
        title: "Serviços",
        items: [
          { name: "Projeto Completo", description: "Consultoria e execução completa", price: 500.0, isFeatured: true },
          { name: "Projeto Padrão", description: "Execução sob demanda", price: 250.0 },
          { name: "Consultoria Hora", description: "Consultoria especializada por hora", price: 100.0, unit: "hora" },
          { name: "Criação de Logo", description: "Identidade visual completa", price: 350.0 },
          { name: "Social Media", description: "Pacote mensal 15 posts + stories", price: 600.0, unit: "mês" },
          { name: "Site Institucional", description: "Até 5 páginas", price: 2500.0 },
          { name: "Design Gráfico", description: "Arte para impressos e digitais", price: 150.0 },
          { name: "Tradução (por lauda)", description: "Tradução EN/ES > PT-BR", price: 35.0, unit: "lauda" },
        ],
      },
      {
        title: "Portfólio",
        sectionType: "gallery",
        items: [
          { name: "Trabalhos Recentes", description: "Veja meus últimos projetos", price: 0 },
        ],
      },
    ],
  },

  // ===== 41. PHOTOGRAPHER =====
  {
    id: "tmpl-041-fotografo",
    businessType: "photographer",
    name: "Fotógrafo",
    description: "Portfólio fotográfico, ensaios e orçamento online",
    pageTitle: "Fotografia Profissional",
    formType: "quote",
    whatsappCta: "Agende seu ensaio pelo WhatsApp",
    qrUseCase: "QR no cartão de visitas para ver portfólio",
    sections: [
      {
        title: "Ensaio Fotográfico",
        items: [
          { name: "Ensaio Individual", description: "1h de sessão, 15 fotos editadas", price: 200.0, isFeatured: true },
          { name: "Ensaio Casal", description: "1h30 de sessão, 25 fotos editadas", price: 300.0 },
          { name: "Ensaio Família", description: "2h de sessão, 30 fotos editadas", price: 350.0 },
          { name: "Ensaio Newborn", description: "Bebê até 30 dias, 20 fotos", price: 350.0 },
          { name: "Ensaio Gestante", description: "2h de sessão, 25 fotos editadas", price: 320.0 },
          { name: "Book Profissional", description: "Fotos corporativas e de currículo", price: 180.0 },
        ],
      },
      {
        title: "Eventos",
        items: [
          { name: "Casamento (meio período)", description: "6h de cobertura", price: 1500.0 },
          { name: "Casamento (período completo)", description: "12h de cobertura + álbum", price: 2800.0, isFeatured: true },
          { name: "Aniversário / Festa", description: "4h de cobertura", price: 600.0 },
          { name: "Evento Corporativo", description: "8h de cobertura", price: 1200.0 },
        ],
      },
      {
        title: "Portfólio",
        sectionType: "gallery",
        items: [
          { name: "Galeria de Fotos", description: "Veja meu portfólio completo", price: 0 },
        ],
      },
    ],
  },

  // ===== 42. CLEANING SERVICES =====
  {
    id: "tmpl-042-limpeza",
    businessType: "cleaning_services",
    name: "Serviços de Limpeza",
    description: "Serviços de limpeza residencial, comercial e pós-obra",
    pageTitle: "Limpeza Profissional",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR no material promocional para ver serviços",
    sections: [
      {
        title: "Limpeza Residencial",
        items: [
          { name: "Limpeza Padrão (1 cômodo)", description: "Limpeza completa de 1 cômodo", price: 49.9, isFeatured: true },
          { name: "Limpeza Apartamento 2 quartos", description: "Limpeza completa do imóvel", price: 149.9 },
          { name: "Limpeza Apartamento 3 quartos", description: "Limpeza completa do imóvel", price: 199.9 },
          { name: "Limpeza Casa até 100m²", description: "Limpeza completa", price: 149.9 },
          { name: "Limpeza Casa 100-200m²", description: "Limpeza completa", price: 249.9 },
          { name: "Limpeza Pesada", description: "Limpeza profunda com desincrustação", price: 299.9 },
        ],
      },
      {
        title: "Limpeza Comercial",
        items: [
          { name: "Limpeza Escritório (até 50m²)", description: "Limpeza diária/alternada", price: 120.0 },
          { name: "Limpeza Loja (até 100m²)", description: "Limpeza completa", price: 199.9 },
          { name: "Limpeza Pós-Obra (até 50m²)", description: "Remoção de resíduos e polimento", price: 399.9 },
          { name: "Limpeza Pós-Obra (50-100m²)", description: "Remoção de resíduos e polimento", price: 699.9 },
          { name: "Limpeza Vidraças", description: "Limpeza de vidros e fachadas", price: 8.0, unit: "m²" },
        ],
      },
      {
        title: "Serviços Especiais",
        items: [
          { name: "Higienização de Estofados", description: "Limpeza profunda de sofás e poltronas", price: 79.9, unit: "lugar" },
          { name: "Higienização de Colchão", description: "Limpeza com vácuo e ozônio", price: 69.9, unit: "unidade" },
          { name: "Limpeza de Tapetes", description: "Lavagem profissional", price: 15.0, unit: "m²" },
        ],
      },
    ],
  },

  // ===== 43. LAUNDRY =====
  {
    id: "tmpl-043-lavanderia",
    businessType: "laundry",
    name: "Lavanderia",
    description: "Lavagem, passadoria e higienização de roupas",
    pageTitle: "Lavanderia",
    formType: "order",
    whatsappCta: "Peça pelo WhatsApp",
    qrUseCase: "QR na lavanderia para ver preços e solicitar serviço",
    sections: [
      {
        title: "Lavagem",
        items: [
          { name: "Lavagem de Camisetas", description: "Lavagem + secagem + dobra", price: 5.0, unit: "peça", isFeatured: true },
          { name: "Lavagem de Calças", description: "Lavagem + secagem + dobra", price: 7.0, unit: "peça" },
          { name: "Lavagem de Camisas Sociais", description: "Lavagem + passar", price: 8.0, unit: "peça" },
          { name: "Lavagem de Roupas de Cama", description: "Lençol + fronha (jogo)", price: 15.0, unit: "jogo" },
          { name: "Lavagem de Toalhas", description: "Banho ou rosto", price: 6.0, unit: "peça" },
          { name: "Lavagem de Edredom", description: "Lavagem especial", price: 35.0, unit: "unidade" },
        ],
      },
      {
        title: "Passadoria",
        items: [
          { name: "Passar Calça", price: 6.0, unit: "peça" },
          { name: "Passar Camisa Social", price: 7.0, unit: "peça" },
          { name: "Passar Vestido", price: 9.0, unit: "peça" },
          { name: "Passar Blusa", price: 5.0, unit: "peça" },
          { name: "Passar Bermuda/Short", price: 4.0, unit: "peça" },
        ],
      },
      {
        title: "Lavagem a Seco",
        items: [
          { name: "Terno Completo", description: "Lavagem a seco", price: 35.0 },
          { name: "Vestido de Festa", description: "Lavagem a seco", price: 45.0 },
          { name: "Casaco/Trench Coat", description: "Lavagem a seco", price: 30.0 },
          { name: "Gravata", description: "Lavagem a seco", price: 12.0 },
        ],
      },
    ],
  },

  // ===== 44. ELECTRONICS REPAIR =====
  {
    id: "tmpl-044-assistencia",
    businessType: "electronics_repair",
    name: "Assistência Técnica",
    description: "Reparo de celulares, notebooks, tablets e eletrônicos",
    pageTitle: "Assistência Técnica",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para ver serviços e preços",
    sections: [
      {
        title: "Celulares e Smartphones",
        items: [
          { name: "Troca de Tela", description: "Troca de display original ou compatível", price: 149.9, isFeatured: true },
          { name: "Troca de Bateria", description: "Bateria original", price: 89.9 },
          { name: "Troca de Conector de Carga", description: "Reparo da porta USB", price: 59.9 },
          { name: "Desbloqueio de Conta", description: "Remoção de padrão/senha (com documentos)", price: 79.9 },
          { name: "Limpeza de Placa", description: "Limpeza ultrassônica", price: 69.9 },
          { name: "Troca de Vidro Traseiro", description: "Substituição do vidro traseiro", price: 79.9 },
          { name: "Reparo de Áudio e Microfone", description: "Conserto de problemas de áudio", price: 49.9 },
        ],
      },
      {
        title: "Notebooks e Computadores",
        items: [
          { name: "Formatação + Backup", description: "Formatação com backup de dados", price: 79.9 },
          { name: "Troca de SSD/HD", description: "Substituição de disco", price: 49.9, unit: "mão de obra" },
          { name: "Upgrade de Memória RAM", description: "Instalação de módulo de memória", price: 39.9, unit: "mão de obra" },
          { name: "Troca de Tela Notebook", description: "Substituição de display", price: 99.9, unit: "mão de obra" },
          { name: "Limpeza Interna", description: "Limpeza e troca de pasta térmica", price: 69.9 },
          { name: "Troca de Teclado", description: "Teclado notebook", price: 69.9, unit: "mão de obra" },
        ],
      },
      {
        title: "Tablets e Outros",
        items: [
          { name: "Troca de Tela Tablet", description: "Display compatível", price: 129.9, unit: "mão de obra" },
          { name: "Troca de Bateria Tablet", description: "Bateria compatível", price: 79.9, unit: "mão de obra" },
          { name: "Reparo de Video Game", description: "Conserto de consoles", price: 99.9 },
          { name: "Reparo de Monitor", description: "Conserto de monitores LED/LCD", price: 89.9 },
        ],
      },
    ],
  },

  // ===== 45. CELLPHONE STORE =====
  {
    id: "tmpl-045-celulares",
    businessType: "cellphone_store",
    name: "Loja de Celulares",
    description: "Celulares, acessórios e consertos",
    pageTitle: "Celulares e Acessórios",
    formType: "catalog",
    whatsappCta: "Compre pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver estoque de celulares",
    sections: [
      {
        title: "Smartphones",
        items: [
          { name: "iPhone 14 Pro Max", description: "256GB, lacrado, com nota", price: 5499.9, isFeatured: true },
          { name: "iPhone 15", description: "128GB, lacrado", price: 4799.9 },
          { name: "Samsung Galaxy S24", description: "256GB, 5G", price: 3499.9 },
          { name: "Samsung Galaxy A55", description: "256GB, 5G", price: 1599.9 },
          { name: "Xiaomi Redmi Note 13", description: "256GB", price: 1299.9 },
          { name: "Motorola Moto G84", description: "256GB, 5G", price: 1399.9 },
        ],
      },
      {
        title: "Capinhas e Películas",
        items: [
          { name: "Capa Silicone Transparente", description: "Fina e flexível", price: 19.9 },
          { name: "Capa Anti-choque", description: "Proteção militar", price: 34.9 },
          { name: "Película de Vidro", description: "Vidro temperado 9H", price: 14.9 },
          { name: "Película Privacidade", description: "Vidro com filtro de privacidade", price: 29.9 },
          { name: "Capa com Suporte", description: "Capa com suporte para mesa", price: 24.9 },
        ],
      },
      {
        title: "Acessórios",
        items: [
          { name: "Carregador Turbo 20W", description: "Carregador rápido USB-C", price: 39.9 },
          { name: "Cabo USB-C 1m", description: "Cabo de dados e carga", price: 14.9 },
          { name: "Fone Bluetooth", description: "Fone sem fio", price: 69.9 },
          { name: "Popsocket", description: "Suporte para dedos", price: 19.9 },
          { name: "Suporte Veicular", description: "Suporte para carro", price: 29.9 },
          { name: "Power Bank 10000mAh", description: "Bateria portátil", price: 79.9 },
        ],
      },
    ],
  },

  // ===== 46. PRINT SHOP / GRÁFICA =====
  {
    id: "tmpl-046-grafica",
    businessType: "print_shop",
    name: "Gráfica / Impressão",
    description: "Impressão digital, offset, banners e materiais gráficos",
    pageTitle: "Gráfica",
    formType: "quote",
    whatsappCta: "Solicite orçamento pelo WhatsApp",
    qrUseCase: "QR na loja para ver catálogo gráfico",
    sections: [
      {
        title: "Impressão Digital",
        items: [
          { name: "Impressão Colorida (A4)", description: "Papel sulfite 75g", price: 0.8, unit: "unidade", isFeatured: true },
          { name: "Impressão Preto (A4)", description: "Papel sulfite 75g", price: 0.3, unit: "unidade" },
          { name: "Impressão Colorida (A3)", description: "Papel sulfite 120g", price: 1.5, unit: "unidade" },
          { name: "Fotografia Revelada (10x15)", description: "Papel fotográfico", price: 1.2, unit: "unidade" },
          { name: "Encadernação Simples", description: "Espiral + capa", price: 7.9 },
          { name: "Encadenação Capa Dura", description: "Capa dura + lombada", price: 19.9 },
        ],
      },
      {
        title: "Materiais Promocionais",
        items: [
          { name: "Cartão de Visita (500 un)", description: "Cartão 300g 4x0 cores", price: 69.9 },
          { name: "Flyer A5 (1000 un)", description: "Papel couchê 150g", price: 149.9 },
          { name: "Panfleto A4 (1000 un)", description: "Papel couchê 150g 4x0", price: 249.9 },
          { name: "Folder A4 3 dobras (500 un)", description: "Papel couchê 150g", price: 299.9 },
          { name: "Banner Lona 1x1m", description: "Lona 440g com cordilho", price: 39.9 },
          { name: "Adesivo Recortado (50 un)", description: "Adesivo vinil fosco/brilho", price: 59.9 },
          { name: "Carimbo Automático", description: "Carimbo 5x3cm", price: 49.9 },
        ],
      },
      {
        title: "Personalizados",
        items: [
          { name: "Caneta Personalizada", description: "Caneta esferográfica com logo", price: 2.5, unit: "unidade" },
          { name: "Squeeze Personalizado", description: "Garrafa squeeze com logo", price: 8.9, unit: "unidade" },
          { name: "Camiseta Personalizada", description: "Silk screen 1 cor", price: 29.9, unit: "unidade" },
        ],
      },
    ],
  },

  // ===== 47. FLORIST =====
  {
    id: "tmpl-047-floricultura",
    businessType: "florist",
    name: "Floricultura",
    description: "Buquês, arranjos e flores para presentes",
    pageTitle: "Floricultura",
    formType: "order",
    whatsappCta: "Faça seu pedido pelo WhatsApp",
    qrUseCase: "QR na vitrine para ver catálogo de flores",
    sections: [
      {
        title: "Buquês",
        items: [
          { name: "Buquê de Rosas 12 unidades", description: "Rosas vermelhas embaladas", price: 69.9, isFeatured: true },
          { name: "Buquê de Rosas 24 unidades", description: "Rosas vermelhas premium", price: 119.9 },
          { name: "Buquê de Rosas 50 unidades", description: "Rosas especiais com laço", price: 199.9 },
          { name: "Buquê de Gérberas", description: "12 gérberas coloridas", price: 79.9 },
          { name: "Buquê de Lírios", description: "6 lírios brancos", price: 89.9 },
          { name: "Buquê de Flores do Campo", description: "Flores silvestres variadas", price: 59.9 },
        ],
      },
      {
        title: "Arranjos",
        items: [
          { name: "Arranjo de Mesa", description: "Vaso com flores variadas", price: 89.9 },
          { name: "Arranjo para Presente", description: "Cesta com flores e chocolates", price: 109.9 },
          { name: "Arranjo Empresarial", description: "Arranjo para recepção", price: 129.9 },
          { name: "Orquídea em Vaso", description: "Orquídea phalaenopsis", price: 69.9 },
        ],
      },
      {
        title: "Eventos",
        items: [
          { name: "Decoração para Casamento", description: "Orçamento personalizado", price: 0 },
          { name: "Buquê de Noiva", description: "Buquê personalizado", price: 199.9 },
          { name: "Arranjo para Igreja", description: "Orçamento personalizado", price: 0 },
          { name: "Coroas de Flores", description: "Coroas para cerimônias", price: 149.9 },
        ],
      },
    ],
  },

  // ===== 48. PHARMACY =====
  {
    id: "tmpl-048-farmacia",
    businessType: "pharmacy",
    name: "Farmácia / Drogaria",
    description: "Medicamentos, perfumaria e produtos de cuidado pessoal",
    pageTitle: "Farmácia",
    formType: "catalog",
    whatsappCta: "Consulte preços pelo WhatsApp",
    qrUseCase: "QR na loja para consultar preços em tempo real",
    sections: [
      {
        title: "Medicamentos",
        items: [
          { name: "Dipirona 500mg", description: "Caixa 10 comprimidos", price: 4.99, isFeatured: true },
          { name: "Paracetamol 750mg", description: "Caixa 20 comprimidos", price: 8.99 },
          { name: "Ibuprofeno 600mg", description: "Caixa 12 comprimidos", price: 12.99 },
          { name: "Omeprazol 20mg", description: "Caixa 14 cápsulas", price: 14.99 },
          { name: "Losartana 50mg", description: "Caixa 30 comprimidos", price: 19.99 },
          { name: "Amoxicilina 500mg", description: "Caixa 21 cápsulas (sob prescrição)", price: 24.99 },
          { name: "Rivotril 2mg", description: "Caixa 20 comprimidos (sob prescrição)", price: 29.99 },
        ],
      },
      {
        title: "Genéricos",
        items: [
          { name: "Sinvastatina 20mg", description: "Genérico, caixa 30 comprimidos", price: 9.99 },
          { name: "Metformina 850mg", description: "Genérico, caixa 30 comprimidos", price: 8.99 },
          { name: "Enalapril 10mg", description: "Genérico, caixa 30 comprimidos", price: 7.99 },
          { name: "Atenolol 50mg", description: "Genérico, caixa 30 comprimidos", price: 9.99 },
        ],
      },
      {
        title: "Perfumaria",
        items: [
          { name: "Protetor Solar FPS 50", description: "200ml", price: 49.9 },
          { name: "Shampoo 350ml", description: "Marca líder", price: 19.9 },
          { name: "Condicionador 350ml", description: "Marca líder", price: 19.9 },
          { name: "Sabonete Líquido 250ml", description: "Hidratante", price: 14.9 },
          { name: "Desodorante Spray 150ml", description: "Antitranspirante", price: 16.9 },
          { name: "Fralda Descartável P (pacote)", description: "Pacote 20 unidades", price: 29.9 },
        ],
      },
    ],
  },

  // ===== 49. TRAVEL AGENCY =====
  {
    id: "tmpl-049-viagens",
    businessType: "travel_agency",
    name: "Agência de Viagens",
    description: "Pacotes de viagem, passagens aéreas e roteiros turísticos",
    pageTitle: "Agência de Viagens",
    formType: "lead",
    whatsappCta: "Solicite cotação pelo WhatsApp",
    qrUseCase: "QR no material promocional para ver destinos",
    sections: [
      {
        title: "Pacotes Nacionais",
        items: [
          { name: "Rio de Janeiro", description: "3 diárias, passagem aérea + hotel 4★", price: 1299.0, isFeatured: true },
          { name: "Salvador", description: "4 diárias, passagem + resort all inclusive", price: 1799.0 },
          { name: "Fernando de Noronha", description: "5 diárias, passagem + pousada + taxas", price: 3299.0 },
          { name: "Foz do Iguaçu", description: "3 diárias, passagem + hotel + ingressos", price: 1499.0 },
          { name: "Gramado", description: "4 diárias, passagem + hotel 5★", price: 1999.0 },
          { name: "Porto Seguro", description: "5 diárias, resort all inclusive", price: 2199.0 },
        ],
      },
      {
        title: "Pacotes Internacionais",
        items: [
          { name: "Buenos Aires", description: "4 diárias, passagem + hotel 4★", price: 2499.0 },
          { name: "Orlando", description: "7 diárias, passagem + hotel + parques", price: 5999.0 },
          { name: "Lisboa", description: "7 diárias, passagem + hotel 4★", price: 4599.0 },
          { name: "Cancún", description: "5 diárias, all inclusive", price: 3999.0 },
          { name: "Paris", description: "7 diárias, passagem + hotel 3★", price: 5499.0 },
          { name: "Punta Cana", description: "5 diárias, resort all inclusive", price: 3599.0 },
        ],
      },
      {
        title: "Serviços",
        items: [
          { name: "Passagem Aérea", description: "Consulte nossos preços", price: 0 },
          { name: "Reserva de Hotel", description: "Melhores tarifas", price: 0 },
          { name: "Seguro Viagem", description: "Cobertura completa por período", price: 49.9, unit: "dia" },
          { name: "Aluguel de Carro", description: "Consulte disponibilidade", price: 0 },
          { name: "Transfer Aeroporto", description: "Para diversos destinos", price: 0 },
          { name: "Visto de Viagem", description: "Assessoria para obtenção de visto", price: 199.0 },
        ],
      },
    ],
  },

  // ===== 50. DELIVERY BUSINESS =====
  {
    id: "tmpl-050-delivery",
    businessType: "delivery_business",
    name: "Delivery",
    description: "Entregas rápidas com cardápio e pedidos online",
    pageTitle: "Delivery",
    formType: "order",
    whatsappCta: "Faça seu pedido pelo WhatsApp",
    qrUseCase: "QR no panfleto para pedir delivery online",
    sections: [
      {
        title: "Categorias",
        items: [
          { name: "Lanches", description: "Hambúrgueres, cachorro-quente e sanduíches", price: 0, isFeatured: true },
          { name: "Pizzas", description: "Pizzas salgadas e doces", price: 0 },
          { name: "Pratos Executivos", description: "Refeições completas", price: 0 },
          { name: "Comida Japonesa", description: "Sushis, sashimis e temakis", price: 0 },
          { name: "Comida Árabe", description: "Esfirras, kibe e charuto", price: 0 },
          { name: "Marmitex", description: "Marmita executiva do dia", price: 0 },
        ],
      },
      {
        title: "Combos Especiais",
        sectionType: "promotions",
        items: [
          { name: "Combo Executivo", description: "Prato feito + refrigerante + sobremesa", price: 32.9, isFeatured: true },
          { name: "Combo Família 4 pessoas", description: "4 pratos + 4 bebidas + 2 sobremesas", price: 99.9 },
          { name: "Combo Festa 10 pessoas", description: "10 marmitex + 10 bebidas", price: 219.9 },
        ],
      },
      {
        title: "Bebidas",
        items: [
          { name: "Refrigerante Lata", price: 5.0 },
          { name: "Refrigerante 2L", price: 10.0 },
          { name: "Suco Natural 500ml", price: 8.0 },
          { name: "Água Mineral 500ml", price: 3.5 },
          { name: "Cerveja Lata", price: 5.0 },
        ],
      },
      {
        title: "Entregas",
        sectionType: "info",
        items: [
          { name: "Taxa de Entrega", description: "Consulte sua região", price: 0 },
          { name: "Horário de Funcionamento", description: "Seg-Dom: 11h às 23h", price: 0 },
          { name: "Área de Cobertura", description: "Raio de 8km do estabelecimento", price: 0 },
          { name: "Formas de Pagamento", description: "Dinheiro, cartão, PIX e vale-refeição", price: 0 },
        ],
      },
    ],
  },

  // ===== 51. PIZZARIA - Second template (already have tmpl-002) =====
  // No duplicate needed, tmpl-002 covers pizzaria

  // ===== ===== ===== ===== ===== ===== ===== ===== =====
  // Fallback: Other / Generic
  // ===== ===== ===== ===== ===== ===== ===== ===== =====
  {
    id: "tmpl-051-other",
    businessType: "other",
    name: "Página Genérica",
    description: "Página versátil para qualquer tipo de negócio ou ideia",
    pageTitle: "Início",
    formType: "catalog",
    whatsappCta: "Entre em contato pelo WhatsApp",
    qrUseCase: "QR code para página de apresentação do negócio",
    sections: [
      {
        title: "Serviços",
        items: [
          { name: "Serviço 1", description: "Descrição do seu serviço principal", price: 0 },
          { name: "Serviço 2", description: "Descrição do segundo serviço", price: 0 },
          { name: "Serviço 3", description: "Descrição do terceiro serviço", price: 0 },
        ],
      },
      {
        title: "Sobre Nós",
        sectionType: "info",
        items: [
          { name: "Nossa História", description: "Conheça nossa trajetória e nossos valores", price: 0 },
          { name: "Missão e Visão", description: "Nossos objetivos e propósito", price: 0 },
        ],
      },
      {
        title: "Galeria",
        sectionType: "gallery",
        items: [],
      },
    ],
  },

  // ===== 52. Product Shelf QR (Legacy) =====
  {
    id: "tmpl-052-product-shelf",
    businessType: "product_shelf",
    name: "Prateleira de Produto",
    description: "Ficha técnica interativa para produtos físicos em lojas",
    pageTitle: "Ficha do Produto",
    formType: "catalog",
    whatsappCta: "Fale com o vendedor pelo WhatsApp",
    qrUseCase: "QR na prateleira do produto para ver ficha técnica",
    sections: [
      {
        title: "Informações do Produto",
        sectionType: "info",
        items: [
          { name: "Nome do Produto", description: "Insira o nome do produto", price: 0 },
          { name: "Descrição", description: "Descrição detalhada do produto", price: 0 },
          { name: "Especificações Técnicas", description: "Dimensões, peso, material e demais specs", price: 0 },
        ],
      },
      {
        title: "Preço e Disponibilidade",
        items: [
          { name: "Preço à Vista", description: "Consulte nosso preço especial", price: 0 },
          { name: "Preço Parcelado", description: "Consulte condições de parcelamento", price: 0 },
          { name: "Disponibilidade em Estoque", description: "Consulte quantidade disponível", price: 0 },
        ],
      },
    ],
  },
  // ===== CLINICS & HEALTHCARE =====
  {
    id: "tmpl-055-clinica-medica",
    businessType: "medical_clinic",
    name: "Clínica Médica Geral",
    description: "Página para agendamento de consultas médicas via WhatsApp e cadastro de pacientes",
    pageTitle: "Agende sua Consulta",
    formType: "booking",
    whatsappCta: "Agendar pelo WhatsApp",
    qrUseCase: "QR na recepção para agendamento rápido",
    sections: [
      {
        title: "Especialidades Médicas",
        items: [
          { name: "Clínica Geral", description: "Atendimento clínico preventivo e check-up", price: 200, isFeatured: true, is_available: true },
          { name: "Cardiologia", description: "Prevenção e tratamento de doenças do coração", price: 250, is_available: true },
          { name: "Pediatria", description: "Saúde infantil e acompanhamento de crescimento", price: 250, is_available: true },
          { name: "Dermatologia", description: "Tratamentos para pele, cabelo e unhas", price: 220, is_available: true }
        ]
      },
      {
        title: "Agendamento Rápido",
        sectionType: "booking",
        items: []
      }
    ]
  },
  {
    id: "tmpl-053-dental-ortodontia",
    businessType: "dental_clinic",
    name: "Clínica de Ortodontia",
    description: "Página para agendamento de avaliação, tratamentos e contato via WhatsApp",
    pageTitle: "Agende sua Avaliação",
    formType: "booking",
    whatsappCta: "Agendar pelo WhatsApp",
    qrUseCase: "QR na recepção para agendamento rápido",
    sections: [
      {
        title: "Tratamentos Ortodônticos",
        items: [
          { name: "Aparelho Fixo Metálico", description: "Tratamento ortodôntico tradicional", price: 150, isFeatured: true, is_available: true },
          { name: "Aparelho Invisível", description: "Alinhadores transparentes e estéticos", price: 400, is_available: true },
          { name: "Clareamento Dental", description: "Clareamento a laser e caseiro", price: 600, is_available: true },
          { name: "Limpeza (Profilaxia)", description: "Remoção de tártaro e placa bacteriana", price: 120, is_available: true }
        ]
      },
      {
        title: "Agende sua Avaliação",
        sectionType: "booking",
        items: []
      }
    ]
  },
  {
    id: "tmpl-054-construcao-materiais",
    businessType: "construction_materials",
    name: "Loja de Materiais de Construção (Novo)",
    description: "Página catálogo para orçamento rápido de materiais de construção",
    pageTitle: "Orçamento de Materiais",
    formType: "quote",
    whatsappCta: "Solicitar Orçamento",
    qrUseCase: "QR em panfletos e loja física",
    sections: [
      {
        title: "Construção Base",
        items: [
          { name: "Cimento CP-II 50kg", description: "Cimento Portland", price: 30.50, isFeatured: true, is_available: true },
          { name: "Tijolo 8 Furos", description: "Tijolo baiano", price: 1.20, is_available: true },
          { name: "Areia Fina", description: "Areia lavada por m3", price: 85.00, is_available: true }
        ]
      },
      {
        title: "Solicite um Orçamento",
        sectionType: "quote",
        items: []
      }
    ]
  }
];

function toTranslatedText(val: string): TranslatedText {
  const translations = TEMPLATE_TRANSLATIONS[val];
  if (translations) {
    return {
      "pt-BR": val,
      en: translations.en,
      es: translations.es,
    };
  }
  return {
    "pt-BR": val,
    en: val,
    es: val,
  };
}

function localizeTemplate(t: any): BusinessTemplate {
  return {
    ...t,
    name: toTranslatedText(t.name),
    description: toTranslatedText(t.description),
    pageTitle: toTranslatedText(t.pageTitle),
    whatsappCta: toTranslatedText(t.whatsappCta),
    qrUseCase: toTranslatedText(t.qrUseCase),
    sections: t.sections.map((sec: any) => ({
      ...sec,
      title: toTranslatedText(sec.title),
      description: sec.description ? toTranslatedText(sec.description) : undefined,
      items: sec.items.map((item: any) => ({
        ...item,
        name: toTranslatedText(item.name),
        description: item.description ? toTranslatedText(item.description) : undefined,
        whatsappMessage: item.whatsappMessage ? toTranslatedText(item.whatsappMessage) : undefined,
      })),
    })),
  };
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = RAW_BUSINESS_TEMPLATES.map(localizeTemplate);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all business templates.
 */
export function getAllBusinessTemplates(): BusinessTemplate[] {
  return BUSINESS_TEMPLATES;
}

/**
 * Get a business template by its ID.
 */
export function getBusinessTemplateById(id: string): BusinessTemplate | undefined {
  return BUSINESS_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all templates for a specific business type/category.
 */
export function getTemplatesByBusinessType(businessType: string): BusinessTemplate[] {
  return BUSINESS_TEMPLATES.filter((t) => t.businessType === businessType);
}

/**
 * Search business templates by query (searches name and description).
 */
export function searchBusinessTemplates(query: string): BusinessTemplate[] {
  const q = query.toLowerCase().trim();
  if (!q) return BUSINESS_TEMPLATES;
  return BUSINESS_TEMPLATES.filter(
    (t) =>
      resolveText(t.name, "pt-BR").toLowerCase().includes(q) ||
      resolveText(t.description, "pt-BR").toLowerCase().includes(q) ||
      t.businessType.toLowerCase().includes(q)
  );
}

/**
 * Get the total item count for a template.
 */
export function getTemplateItemCount(template: BusinessTemplate): number {
  return template.sections.reduce((sum, section) => sum + section.items.length, 0);
}

/**
 * Get the total section count for a template.
 */
export function getTemplateSectionCount(template: BusinessTemplate): number {
  return template.sections.length;
}

/**
 * Get the form type label in Portuguese.
 */
export function getFormTypeLabel(formType: FormType): string {
  const labels: Record<FormType, string> = {
    lead: "Captura de Leads",
    quote: "Solicitação de Orçamento",
    order: "Pedido",
    booking: "Agendamento",
    catalog: "Catálogo",
    menu: "Cardápio",
  };
  return labels[formType];
}
