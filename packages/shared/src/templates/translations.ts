// =============================================================================
// Template Translations — Comprehensive Multi-language Dictionary
// Maps Portuguese template terms, titles, section headers, item names,
// and descriptions to English (en) and Spanish (es).
// =============================================================================

export interface Translations {
  en: string;
  es: string;
}

export const TEMPLATE_TRANSLATIONS: Record<string, Translations> = {
  // === Business Category Names ===
  "Restaurante & Lanchonete": {
    en: "Restaurant & Snack Bar",
    es: "Restaurante y Cafetería",
  },
  "Pizzaria": {
    en: "Pizzeria",
    es: "Pizzería",
  },
  "Hamburgueria Artesanal": {
    en: "Burger Shop",
    es: "Hamburguesería Artesanal",
  },
  "Padaria & Confeitaria": {
    en: "Bakery & Confectionery",
    es: "Panadería y Pastelería",
  },
  "Cafeteria / Coffee Shop": {
    en: "Coffee Shop",
    es: "Cafetería",
  },
  "Açaí & Sorveteria": {
    en: "Açaí & Ice Cream Shop",
    es: "Açaí y Heladería",
  },
  "Bar & Pub": {
    en: "Bar & Pub",
    es: "Bar y Pub",
  },
  "Food Truck": {
    en: "Food Truck",
    es: "Gastroneta / Food Truck",
  },
  "Material de Construção": {
    en: "Construction Materials",
    es: "Materiales de Construcción",
  },
  "Loja de Ferragens": {
    en: "Hardware Store",
    es: "Ferretería",
  },
  "Loja de Tintas": {
    en: "Paint Store",
    es: "Tienda de Pinturas",
  },
  "Materiais Elétricos": {
    en: "Electrical Supplies",
    es: "Materiales Eléctricos",
  },
  "Materiais Hidráulicos": {
    en: "Plumbing Supplies",
    es: "Materiales Hidráulicos",
  },
  "Loja de Móveis": {
    en: "Furniture Store",
    es: "Mueblería",
  },
  "Loja de Roupas": {
    en: "Clothing Store",
    es: "Tienda de Ropa",
  },
  "Loja de Calçados": {
    en: "Shoe Store",
    es: "Zapatería",
  },
  "Loja de Cosméticos": {
    en: "Cosmetics & Beauty Store",
    es: "Tienda de Cosméticos",
  },
  "Supermercado": {
    en: "Supermarket",
    es: "Supermercado",
  },
  "Pet Shop": {
    en: "Pet Shop",
    es: "Tienda de Mascotas / Pet Shop",
  },
  "Clínica Veterinária": {
    en: "Veterinary Clinic",
    es: "Clínica Veterinaria",
  },
  "Salão de Beleza": {
    en: "Beauty Salon",
    es: "Salón de Belleza",
  },
  "Barbearia": {
    en: "Barber Shop",
    es: "Barbería",
  },
  "Esmalteria / Unhas": {
    en: "Nail Studio",
    es: "Estudio de Uñas",
  },
  "Spa & Bem Estar": {
    en: "Spa & Wellness Center",
    es: "Spa y Bienestar",
  },
  "Consultório Odontológico": {
    en: "Dental Clinic",
    es: "Clínica Dental",
  },
  "Clínica Médica": {
    en: "Medical Clinic",
    es: "Clínica Médica",
  },
  "Clínica de Fisioterapia": {
    en: "Physiotherapy Clinic",
    es: "Clínica de Fisioterapia",
  },
  "Academia & Fitness": {
    en: "Gym & Fitness Center",
    es: "Gimnasio y Fitness",
  },
  "Hotel & Pousada": {
    en: "Hotel & Guest House",
    es: "Hotel y Posada",
  },
  "Imobiliária": {
    en: "Real Estate Agency",
    es: "Agencia Inmobiliaria",
  },
  "Concessionária de Veículos": {
    en: "Car Dealership",
    es: "Concesionario de Vehículos",
  },
  "Oficina Mecânica": {
    en: "Auto Repair Shop",
    es: "Taller Mecánico",
  },
  "Oficina de Motos": {
    en: "Motorcycle Repair Shop",
    es: "Taller de Motocicletas",
  },
  "Lava Rápido": {
    en: "Car Wash",
    es: "Lavado de Autos",
  },
  "Organizador de Eventos": {
    en: "Event Organizer",
    es: "Organizador de Eventos",
  },
  "Aluguel de Artigos para Festas": {
    en: "Party Rental Supplies",
    es: "Alquiler de Artículos para Fiestas",
  },
  "Escola / Cursos": {
    en: "School & Educational Courses",
    es: "Escuela y Cursos",
  },
  "Creche / Recreação Infantil": {
    en: "Daycare & Child Recreation",
    es: "Guardería y Recreación Infantil",
  },
  "Igreja / Templo": {
    en: "Church / Temple",
    es: "Iglesia / Templo",
  },
  "Prestador de Serviços / Freelancer": {
    en: "Service Provider / Freelancer",
    es: "Proveedor de Servicios / Freelancer",
  },
  "Estúdio Fotográfico": {
    en: "Photography Studio",
    es: "Estudio Fotográfico",
  },
  "Serviços de Limpeza": {
    en: "Cleaning Services",
    es: "Servicios de Limpieza",
  },
  "Lavanderia": {
    en: "Laundry Service",
    es: "Lavandería",
  },
  "Assistência Técnica de Eletrônicos": {
    en: "Electronics Repair Service",
    es: "Servicio Técnico de Electrónica",
  },
  "Loja de Celulares & Acessórios": {
    en: "Mobile Phone & Accessories Store",
    es: "Tienda de Celulares y Accesorios",
  },
  "Gráfica & Estamparia": {
    en: "Print & Custom Apparel Shop",
    es: "Imprenta y Estampado",
  },
  "Floricultura": {
    en: "Florist / Flower Shop",
    es: "Floristería",
  },
  "Farmácia / Drogaria": {
    en: "Pharmacy / Drugstore",
    es: "Farmacia / Droguería",
  },
  "Agência de Viagens": {
    en: "Travel Agency",
    es: "Agencia de Viajes",
  },
  "Delivery": {
    en: "Delivery Service",
    es: "Servicio de Delivery",
  },
  "Página Genérica": {
    en: "Generic Page",
    es: "Página Genérica",
  },
  "Prateleira de Produto": {
    en: "Product Shelf Details",
    es: "Ficha del Producto",
  },

  // === Common Template Descriptions ===
  "Cardápio digital completo com pedidos via WhatsApp e delivery": {
    en: "Complete digital menu with orders via WhatsApp and delivery",
    es: "Menú digital completo con pedidos por WhatsApp y entrega a domicilio",
  },
  "Cardápio de pizzas, bebidas e promoções com pedido online": {
    en: "Menu of pizzas, drinks, and promotions with online ordering",
    es: "Menú de pizzas, bebidas y promociones con pedidos en línea",
  },
  "Cardápio de hambúrgueres artesanais, combos e petiscos": {
    en: "Menu of artisanal burgers, combos, and snacks",
    es: "Menú de hamburguesas artesanales, combos y aperitivos",
  },
  "Catálogo de pães, doces, salgados e encomendas": {
    en: "Catalog of breads, sweets, snacks, and catering orders",
    es: "Catálogo de panes, dulces, aperitivos y pedidos",
  },
  "Cardápio de cafés especiais, bebidas geladas e alimentos": {
    en: "Menu of specialty coffees, cold drinks, and pastries",
    es: "Menú de cafés especiales, bebidas frías y repostería",
  },
  "Cardápio de açaís, sorvetes e acompanhamentos": {
    en: "Menu of açaí bowls, ice cream, and toppings",
    es: "Menú de boles de açaí, helados y complementos",
  },
  "Cardápio de bebidas, petiscos e promoções do bar": {
    en: "Menu of drinks, appetizers, and bar promotions",
    es: "Menú de bebidas, aperitivos y promociones de bar",
  },
  "Cardápio digital para food truck com localização e horários": {
    en: "Digital menu for food truck with location and hours",
    es: "Menú digital para gastroneta con ubicación y horarios",
  },
  "Catálogo completo de materiais com cotação via WhatsApp": {
    en: "Complete materials catalog with quote requests via WhatsApp",
    es: "Catálogo completo de materiales con cotización por WhatsApp",
  },
  "Catálogo de ferramentas, fechaduras e materiais de ferragem": {
    en: "Catalog of tools, locks, and hardware materials",
    es: "Catálogo de herramientas, cerraduras y ferretería",
  },
  "Catálogo de tintas, vernizes e acessórios para pintura": {
    en: "Catalog of paints, varnishes, and painting accessories",
    es: "Catálogo de pinturas, barnices y accesorios de pintura",
  },
  "Catálogo de fios, cabos, disjuntores e iluminação": {
    en: "Catalog of wires, cables, circuit breakers, and lighting",
    es: "Catálogo de cables, disyuntores e iluminación",
  },
  "Catálogo de tubos, conexões, registros e louças": {
    en: "Catalog of pipes, fittings, valves, and fixtures",
    es: "Catálogo de tuberías, conexiones, válvulas y sanitarios",
  },
  "Catálogo de móveis para casa e escritório com fotos": {
    en: "Catalog of furniture for home and office with photos",
    es: "Catálogo de muebles para hogar y oficina con fotos",
  },
  "Catálogo de moda feminina, masculina e infantil": {
    en: "Catalog of women's, men's, and children's fashion",
    es: "Catálogo de moda femenina, masculina e infantil",
  },
  "Catálogo de calçados esportivos, casuais, masculinos e femininos": {
    en: "Catalog of sports, casual, men's, and women's footwear",
    es: "Catálogo de calzado deportivo, casual, de hombre y de mujer",
  },
  "Vitrine digital de cosméticos, maquiagens e produtos de beleza": {
    en: "Digital showcase of cosmetics, makeup, and beauty products",
    es: "Escaparate digital de cosméticos, maquillaje y productos de belleza",
  },
  "Catálogo de ofertas de supermercado, mercearia e bebidas": {
    en: "Catalog of supermarket offers, groceries, and drinks",
    es: "Catálogo de ofertas de supermercado, abarrotes y bebidas",
  },
  "Catálogo de rações, brinquedos e acessórios para pets": {
    en: "Catalog of pet food, toys, and pet accessories",
    es: "Catálogo de alimentos, juguetes y accesorios para mascotas",
  },
  "Apresentação de serviços veterinários, consultas e vacinas": {
    en: "Presentation of veterinary services, consultations, and vaccines",
    es: "Presentación de servicios veterinarios, consultas y vacunas",
  },
  "Cardápio de serviços de cabelo, maquiagem e estética": {
    en: "Menu of hair, makeup, and aesthetic services",
    es: "Menú de servicios de cabello, maquillaje y estética",
  },
  "Serviços de corte de cabelo, barba e cuidados masculinos": {
    en: "Haircuts, beard trims, and men's grooming services",
    es: "Servicios de corte de cabello, barba y cuidado masculino",
  },
  "Preços de serviços de manicure, pedicure e alongamento de unhas": {
    en: "Prices for manicure, pedicure, and nail extension services",
    es: "Precios de servicios de manicura, pedicura y extensiones de uñas",
  },
  "Apresentação de massagens, terapias corporais e relaxamento": {
    en: "Presentation of massages, body therapies, and relaxation",
    es: "Presentación de masajes, terapias corporales y relajación",
  },
  "Apresentação de tratamentos odontológicos, clareamento e implantes": {
    en: "Presentation of dental treatments, whitening, and implants",
    es: "Presentación de tratamientos dentales, blanqueamiento e implantes",
  },
  "Serviços médicos, especialidades e agendamentos de consultas": {
    en: "Medical services, specialties, and appointment scheduling",
    es: "Servicios médicos, especialidades y programación de consultas",
  },
  "Apresentação de tratamentos fisioterapêuticos e reabilitação": {
    en: "Presentation of physiotherapy treatments and rehabilitation",
    es: "Presentación de tratamientos fisioterapéuticos y rehabilitación",
  },
  "Horários de aulas, planos de mensalidade e modalidades": {
    en: "Class schedules, monthly plans, and fitness modalities",
    es: "Horarios de clases, planes mensuales y modalidades de fitness",
  },
  "Apresentação do hotel, fotos dos quartos, tarifas e serviços": {
    en: "Hotel presentation, room photos, rates, and services",
    es: "Presentación del hotel, fotos de habitaciones, tarifas y servicios",
  },
  "Catálogo de imóveis para alugar ou comprar com detalhes": {
    en: "Catalog of properties for rent or purchase with details",
    es: "Catálogo de propiedades para alquilar o comprar con detalles",
  },
  "Catálogo de carros novos e seminovos com especificações": {
    en: "Catalog of new and used cars with specifications",
    es: "Catálogo de automóviles nuevos y usados con especificaciones",
  },
  "Serviços mecânicos, revisões, troca de óleo e freios": {
    en: "Mechanical services, tune-ups, oil changes, and brakes",
    es: "Servicios mecánicos, revisiones, cambio de aceite y frenos",
  },
  "Serviços de mecânica, elétrica e peças para motocicletas": {
    en: "Mechanic, electrical services, and parts for motorcycles",
    es: "Servicios de mecánica, electricidad y repuestos para motocicletas",
  },
  "Tabela de preços de lavagem simples, completa e estética automotiva": {
    en: "Price table for basic wash, detailing, and car aesthetics",
    es: "Tabla de precios de lavado simple, completo y estética automotriz",
  },
  "Apresentação de serviços de cerimonial, assessoria e festas": {
    en: "Presentation of ceremonial, planning, and party services",
    es: "Presentación de servicios de ceremonia, planificación y fiestas",
  },
  "Catálogo de locação de mesas, cadeiras, brinquedos e decoração": {
    en: "Catalog of rentals for tables, chairs, toys, and decorations",
    es: "Catálogo de alquiler de mesas, sillas, juguetes y decoración",
  },
  "Grade de cursos, palestras, treinamentos e mensalidades": {
    en: "Schedule of courses, lectures, training, and tuition fees",
    es: "Programa de cursos, conferencias, capacitación y mensualidades",
  },
  "Grade de horários, atividades infantis e mensalidades": {
    en: "Schedule, children's activities, and monthly tuition",
    es: "Programa de horarios, actividades infantiles y mensualidades",
  },
  "Horários de cultos, atividades, doações e avisos da igreja": {
    en: "Church services schedules, activities, donations, and notices",
    es: "Horarios de cultos, actividades, donaciones y anuncios de la iglesia",
  },
  "Portfólio de freelancer, serviços, preços e contato": {
    en: "Freelancer portfolio, services, prices, and contact",
    es: "Portafolio de freelancer, servicios, precios y contacto",
  },
  "Portfólio de fotógrafo com sessões, pacotes e orçamentos": {
    en: "Photographer portfolio with sessions, packages, and quotes",
    es: "Portafolio de fotógrafo con sesiones, paquetes y presupuestos",
  },
  "Tabela de preços de limpeza residencial, comercial e pós-obra": {
    en: "Price list for residential, commercial, and post-construction cleaning",
    es: "Lista de precios de limpieza residencial, comercial y post-obra",
  },
  "Tabela de preços de lavagem de roupas, ternos, edredons por quilo": {
    en: "Price list for laundry washing, suits, duvets per kilo",
    es: "Lista de precios de lavado de ropa, trajes, edredones por kilo",
  },
  "Tabela de preços de conserto de celular, notebook, TV e eletrônicos": {
    en: "Price list for cell phone, notebook, TV, and electronics repair",
    es: "Lista de precios para reparación de celular, laptop, TV y electrónica",
  },
  "Catálogo de celulares novos, usados, capinhas e películas": {
    en: "Catalog of new and used cell phones, cases, and screen protectors",
    es: "Catálogo de celulares nuevos, usados, fundas y protectores",
  },
  "Tabela de preços de panfletos, cartões de visita, banners e camisas": {
    en: "Price list for flyers, business cards, banners, and t-shirts",
    es: "Lista de precios de folletos, tarjetas de visita, carteles y camisetas",
  },
  "Catálogo de arranjos florais, presentes, cestas e decoração": {
    en: "Catalog of flower arrangements, gifts, baskets, and decoration",
    es: "Catálogo de arreglos florales, regalos, canastas y decoración",
  },
  "Catálogo de medicamentos, higiene, cosméticos e delivery": {
    en: "Catalog of medicines, hygiene, cosmetics, and delivery",
    es: "Catálogo de medicamentos, higiene, cosméticos y entrega a domicilio",
  },
  "Catálogo de pacotes de viagens nacionais, internacionais e passagens": {
    en: "Catalog of domestic, international travel packages, and tickets",
    es: "Catálogo de paquetes de viajes nacionales, internacionales y boletos",
  },
  "Entregas rápidas com cardápio e pedidos online": {
    en: "Fast delivery with digital menu and online ordering",
    es: "Entregas rápidas con menú digital y pedidos en línea",
  },
  "Página versátil para qualquer tipo de negócio ou ideia": {
    en: "Versatile page for any type of business or project",
    es: "Página versátil para cualquier tipo de negocio o proyecto",
  },
  "Ficha técnica interativa para produtos físicos em lojas": {
    en: "Interactive specifications sheet for physical store products",
    es: "Ficha técnica interactiva para productos físicos en tiendas",
  },

  // === CTAs ===
  "Faça seu pedido pelo WhatsApp": {
    en: "Place your order via WhatsApp",
    es: "Realice su pedido por WhatsApp",
  },
  "Peça sua pizza pelo WhatsApp": {
    en: "Order your pizza via WhatsApp",
    es: "Pida su pizza por WhatsApp",
  },
  "Peça seu burguer pelo WhatsApp": {
    en: "Order your burger via WhatsApp",
    es: "Pida su hamburguesa por WhatsApp",
  },
  "Encomende pelo WhatsApp": {
    en: "Order via WhatsApp",
    es: "Haga su pedido por WhatsApp",
  },
  "Peça seu café pelo WhatsApp": {
    en: "Order your coffee via WhatsApp",
    es: "Pida su café por WhatsApp",
  },
  "Peça seu açaí pelo WhatsApp": {
    en: "Order your açaí via WhatsApp",
    es: "Pida su açaí por WhatsApp",
  },
  "Chame no WhatsApp para reservar sua mesa": {
    en: "Contact on WhatsApp to reserve your table",
    es: "Llame por WhatsApp para reservar su mesa",
  },
  "Faça sua reserva pelo WhatsApp": {
    en: "Make your reservation via WhatsApp",
    es: "Haga su reserva por WhatsApp",
  },
  "Solicite cotação pelo WhatsApp": {
    en: "Request a quote via WhatsApp",
    es: "Solicite una cotización por WhatsApp",
  },
  "Solicite orçamento pelo WhatsApp": {
    en: "Request an estimate via WhatsApp",
    es: "Solicite un presupuesto por WhatsApp",
  },
  "Compre pelo WhatsApp": {
    en: "Buy via WhatsApp",
    es: "Compre por WhatsApp",
  },
  "Fale com o vendedor pelo WhatsApp": {
    en: "Talk to our representative on WhatsApp",
    es: "Hable con el vendedor por WhatsApp",
  },
  "Fale conosco pelo WhatsApp": {
    en: "Contact us on WhatsApp",
    es: "Hable con nosotros por WhatsApp",
  },
  "Entre em contato pelo WhatsApp": {
    en: "Contact us via WhatsApp",
    es: "Póngase en contacto por WhatsApp",
  },

  // === Common QR Use Cases ===
  "QR na mesa para pedir direto do celular": {
    en: "QR at the table to order directly from mobile",
    es: "QR en la mesa para pedir directo desde el celular",
  },
  "QR na mesa para pedir pizza sem chamar garçom": {
    en: "QR at the table to order pizza without calling a waiter",
    es: "QR en la mesa para pedir pizza sin llamar al camarero",
  },
  "QR na mesa para pedir sem esperar garçom": {
    en: "QR at the table to order without waiting for a waiter",
    es: "QR en la mesa para pedir sin esperar al camarero",
  },
  "QR na vitrine para ver cardápio completo": {
    en: "QR on the window to view complete menu",
    es: "QR en el escaparate para ver el menú completo",
  },
  "QR na mesa para ver o cardápio de cafés": {
    en: "QR at the table to view the coffee menu",
    es: "QR en la mesa para ver el menú de cafés",
  },
  "QR no balcão para pedir combo de açaí": {
    en: "QR at the counter to order açaí combos",
    es: "QR en el mostrador para pedir combo de açaí",
  },
  "QR na mesa para ver o cardápio de bebidas": {
    en: "QR at the table to view the drinks menu",
    es: "QR en la mesa para ver el menú de bebidas",
  },
  "QR no food truck para ver cardápio e localização": {
    en: "QR at the food truck to view menu and location",
    es: "QR en la gastroneta para ver menú y ubicación",
  },
  "QR na loja para ver catálogo de preços": {
    en: "QR in store to view price catalog",
    es: "QR en la tienda para ver el catálogo de precios",
  },
  "QR na loja para consultar preços": {
    en: "QR in store to check prices",
    es: "QR en la tienda para consultar precios",
  },
  "QR na loja para ver cores e preços": {
    en: "QR in store to view colors and pricing",
    es: "QR en la tienda para ver colores y precios",
  },
  "QR na loja para consultar especificações": {
    en: "QR in store to consult specifications",
    es: "QR en la tienda para consultar especificaciones",
  },
  "QR na loja para ver especificações técnicas": {
    en: "QR in store to view technical specifications",
    es: "QR en la tienda para ver especificaciones técnicas",
  },
  "QR na vitrine para ver catálogo completo": {
    en: "QR in store window to see full catalog",
    es: "QR en el escaparate para ver el catálogo completo",
  },
  "QR no folheto para ver ofertas do dia": {
    en: "QR on the flyer to see today's offers",
    es: "QR en el folleto para ver ofertas del día",
  },
  "QR no pet shop para ver catálogo de produtos": {
    en: "QR at the pet shop to see product catalog",
    es: "QR en la tienda de mascotas para ver catálogo de productos",
  },
  "QR no balcão para agendar banho e tosa": {
    en: "QR at the counter to schedule grooming services",
    es: "QR en el mostrador para programar baño y peluquería",
  },
  "QR no espelho para ver catálogo de cortes": {
    en: "QR on the mirror to see haircut catalog",
    es: "QR en el espejo para ver catálogo de cortes",
  },
  "QR no balcão para ver serviços e agendar": {
    en: "QR at the counter to view services and schedule",
    es: "QR en el mostrador para ver servicios y programar",
  },
  "QR no balcão para ver preços de unhas": {
    en: "QR at the counter to check nail service prices",
    es: "QR en el mostrador para ver precios de uñas",
  },
  "QR no spa para agendar massagem": {
    en: "QR at the spa to schedule a massage",
    es: "QR en el spa para programar un masaje",
  },
  "QR no balcão para ver tratamentos e agendar": {
    en: "QR at the counter to view treatments and book",
    es: "QR en el mostrador para ver tratamientos y programar",
  },
  "QR no consultório para agendar consulta": {
    en: "QR at the office to book a consultation",
    es: "QR en el consultorio para programar consulta",
  },
  "QR no banner para ver horários e planos": {
    en: "QR on the banner to view schedules and plans",
    es: "QR en el cartel para ver horarios y planes",
  },
  "QR no quarto para ver serviços do hotel": {
    en: "QR in the room to view hotel services",
    es: "QR en la habitación para ver servicios del hotel",
  },
  "QR na placa de venda para ver detalhes do imóvel": {
    en: "QR on the sale sign to view property details",
    es: "QR en el cartel de venta para ver detalles del inmueble",
  },
  "QR na loja para ver catálogo de veículos": {
    en: "QR in store to see vehicle catalog",
    es: "QR en la tienda para ver catálogo de vehículos",
  },
  "QR no balcão para solicitar orçamento de mecânica": {
    en: "QR at the counter to request a repair estimate",
    es: "QR en el mostrador para solicitar presupuesto de mecánica",
  },
  "QR no chaveiro para ver serviços de motos": {
    en: "QR on the keychain to see motorcycle services",
    es: "QR en el llavero para ver servicios de motos",
  },
  "QR no banner para ver preços de lavagens": {
    en: "QR on the banner to check wash prices",
    es: "QR en el cartel para ver precios de lavados",
  },
  "QR no cartão de visitas para ver portfólio": {
    en: "QR on business card to view portfolio",
    es: "QR en la tarjeta de presentación para ver portafolio",
  },
  "QR no folheto para solicitar orçamento de limpeza": {
    en: "QR on flyer to request cleaning quote",
    es: "QR en el folleto para solicitar presupuesto de limpieza",
  },
  "QR no banner da lavanderia para ver preços": {
    en: "QR on laundry banner to check prices",
    es: "QR en el cartel de la lavandería para ver precios",
  },
  "QR no balcão para ver preços de consertos": {
    en: "QR at counter to check repair prices",
    es: "QR en el mostrador para ver precios de reparaciones",
  },
  "QR no panfleto para pedir delivery online": {
    en: "QR on the flyer to order delivery online",
    es: "QR en el folleto para pedir entrega a domicilio en línea",
  },
  "QR code para página de apresentação do negócio": {
    en: "QR code for business presentation page",
    es: "Código QR para página de presentación del negocio",
  },
  "QR na prateleira do produto para ver ficha técnica": {
    en: "QR on product shelf to see tech specs",
    es: "QR en el estante del producto para ver ficha técnica",
  },

  // === Section Titles ===
  "Combos": { en: "Combos", es: "Combos" },
  "Pratos Feitos": { en: "Main Dishes", es: "Platos Fuertes" },
  "Lanches": { en: "Sandwiches & Burgers", es: "Sándwiches y Hamburguesas" },
  "Bebidas": { en: "Drinks", es: "Bebidas" },
  "Sobremesas": { en: "Desserts", es: "Postres" },
  "Pizzas Salgadas": { en: "Savory Pizzas", es: "Pizzas Saladas" },
  "Pizzas Doces": { en: "Sweet Pizzas", es: "Pizzas Dulces" },
  "Promoções": { en: "Promotions", es: "Promociones" },
  "Hambúrgueres Artesanais": { en: "Artisanal Burgers", es: "Hamburguesas Artesanales" },
  "Petiscos": { en: "Appetizers / Sides", es: "Aperitivos / Raciones" },
  "Pães Artesanais": { en: "Artisanal Breads", es: "Panes Artesanales" },
  "Bolos e Tortas": { en: "Cakes and Pies", es: "Pasteles y Tartas" },
  "Salgados": { en: "Savory Pastries", es: "Aperitivos Salados" },
  "Doces e Sobremesas": { en: "Sweets and Desserts", es: "Dulces y Postres" },
  "Cafés Especiais": { en: "Specialty Coffees", es: "Cafés Especiales" },
  "Bebidas Geladas": { en: "Cold Drinks", es: "Bebidas Frías" },
  "Acompanhamentos": { en: "Accompaniments / Sides", es: "Acompañamientos" },
  "Chás e Outros": { en: "Teas & Others", es: "Tés y Otros" },
  "Açaí na Tigela": { en: "Açaí Bowls", es: "Açaí en Tazón" },
  "Adicionais": { en: "Extra Toppings", es: "Adicionales / Extras" },
  "Sorvetes": { en: "Ice Creams", es: "Helados" },
  "Cervejas": { en: "Beers", es: "Cervezas" },
  "Destilados e Drinks": { en: "Spirits & Cocktails", es: "Destilados y Cócteles" },
  "Porções Especiais": { en: "Special Platters", es: "Raciones Especiales" },
  "Destaques do Dia": { en: "Today's Highlights", es: "Destacados del Día" },
  "Cimento e Argamassa": { en: "Cement & Mortar", es: "Cemento y Argamasa" },
  "Agregados": { en: "Aggregates (Sand & Gravel)", es: "Agregados (Arena y Piedra)" },
  "Blocos e Tijolos": { en: "Blocks & Bricks", es: "Bloques y Ladrillos" },
  "Acabamento": { en: "Finishing & Tiles", es: "Acabados y Cerámicas" },
  "Tintas": { en: "Paints", es: "Pinturas" },
  "Ferramentas": { en: "Tools", es: "Herramientas" },
  "Ferramentas Manuais": { en: "Hand Tools", es: "Herramientas Manuales" },
  "Fechaduras e Dobradiças": { en: "Locks & Hinges", es: "Cerraduras y Bisagras" },
  "Parafusos e Porcas": { en: "Screws & Bolts", es: "Tornillos y Tuercas" },
  "Colas e Adesivos": { en: "Glues & Adhesives", es: "Colas y Adhesivos" },
  "Tintas Acrílicas": { en: "Acrylic Paints", es: "Pinturas Acrílicas" },
  "Tintas Especiais": { en: "Specialty Paints", es: "Pinturas Especiales" },
  "Acessórios para Pintura": { en: "Painting Accessories", es: "Accesorios para Pintura" },
  "Fios e Cabos": { en: "Wires & Cables", es: "Cables y Alambres" },
  "Disjuntores": { en: "Circuit Breakers", es: "Disyuntores" },
  "Tomadas e Interruptores": { en: "Outlets & Switches", es: "Tomas e Interruptores" },
  "Iluminação": { en: "Lighting", es: "Iluminación" },
  "Tubos e Conexões": { en: "Pipes & Fittings", es: "Tuberías y Conexiones" },
  "Registros e Torneiras": { en: "Valves & Faucets", es: "Válvulas y Grifos" },
  "Louças e Metais": { en: "Sanitary Fixtures & Hardware", es: "Sanitarios y Metales" },
  "Sala de Estar": { en: "Living Room", es: "Sala de Estar" },
  "Quarto": { en: "Bedroom", es: "Dormitorio" },
  "Cozinha": { en: "Kitchen", es: "Cocina" },
  "Escritório": { en: "Office", es: "Oficina" },
  "Feminino": { en: "Women's Collection", es: "Colección Femenina" },
  "Masculino": { en: "Men's Collection", es: "Colección Masculina" },
  "Infantil": { en: "Kids' Collection", es: "Colección Infantil" },
  "Esportivo": { en: "Sports Footwear", es: "Calzado Deportivo" },
  "Casual": { en: "Casual Shoes", es: "Calzado Casual" },
  "Social": { en: "Formal / Dress Shoes", es: "Zapatos de Vestir" },
  "Maquiagem": { en: "Makeup", es: "Maquillaje" },
  "Cuidados com a Pele": { en: "Skincare", es: "Cuidado de la Piel" },
  "Cabelos": { en: "Hair Care", es: "Cuidado del Cabello" },
  "Perfumes": { en: "Fragrances / Perfumes", es: "Perfumería / Fragancias" },
  "Mercearia": { en: "Grocery Store Products", es: "Abarrotes / Despensa" },
  "Hortifrúti": { en: "Produce (Fruits & Veg)", es: "Frutas y Verduras" },
  "Açougue": { en: "Butcher Shop / Meats", es: "Carnicería" },
  "Rações": { en: "Pet Food", es: "Alimentos para Mascotas" },
  "Brinquedos e Acessórios": { en: "Toys & Accessories", es: "Juguetes y Accesorios" },
  "Higiene e Estética": { en: "Hygiene & Grooming", es: "Higiene y Estética" },
  "Serviços Médicos": { en: "Veterinary Services", es: "Servicios Veterinarios" },
  "Cabelo": { en: "Hair Styling & Cuts", es: "Corte y Peinado" },
  "Manicure e Pedicure": { en: "Manicure & Pedicure", es: "Manicura y Pedicura" },
  "Estética Corporal": { en: "Body Aesthetics", es: "Estética Corporal" },
  "Estética Facial": { en: "Facial Aesthetics", es: "Estética Facial" },
  "Cabelo e Barba": { en: "Hair & Beard Services", es: "Cabello y Barba" },
  "Alongamento de Unhas": { en: "Nail Extensions", es: "Extensiones de Uñas" },
  "Design de Sobrancelhas": { en: "Eyebrow Styling / Design", es: "Diseño de Cejas" },
  "Massagens": { en: "Massage Therapies", es: "Masajes" },
  "Tratamentos Corporais": { en: "Body Treatments", es: "Tratamientos Corporais" },
  "Clareamento e Estética": { en: "Whitening & Dental Aesthetics", es: "Blanqueamiento y Estética Dental" },
  "Tratamentos Clínicos": { en: "Clinical Treatments", es: "Tratamientos Clínicos" },
  "Consultas": { en: "Consultations", es: "Consultas" },
  "Exames e Procedimentos": { en: "Exams & Procedures", es: "Exámenes y Procedimientos" },
  "Fisioterapia Traumato-Ortopédica": { en: "Orthopedic Physiotherapy", es: "Fisioterapia Ortopédica" },
  "Fisioterapia Desportiva": { en: "Sports Physiotherapy", es: "Fisioterapia Deportiva" },
  "Modalidades": { en: "Gym Modalities / Classes", es: "Modalidades de Gimnasio" },
  "Planos de Mensalidade": { en: "Membership Plans", es: "Planes de Membresía" },
  "Nossas Suítes": { en: "Our Suites / Rooms", es: "Nuestras Habitaciones" },
  "Serviços Inclusos": { en: "Included Amenities", es: "Servicios Incluidos" },
  "Casas à Venda": { en: "Houses for Sale", es: "Casas en Venta" },
  "Apartamentos para Alugar": { en: "Apartments for Rent", es: "Apartamentos para Alquilar" },
  "Veículos em Destaque": { en: "Featured Vehicles", es: "Vehículos Destacados" },
  "Motos Novas": { en: "New Motorcycles", es: "Motocicletas Nuevas" },
  "Lavagem Automotiva": { en: "Car Wash Packages", es: "Paquetes de Lavado" },
  "Estética Automotiva": { en: "Car Detailing & Aesthetics", es: "Estética Automotriz" },
  "Cerimonial e Assessoria": { en: "Event Planning & Coordination", es: "Planificación de Eventos" },
  "Decoração de Festas": { en: "Party Decoration", es: "Decoración de Fiestas" },
  "Mobiliário e Artigos": { en: "Tables, Chairs & Supplies", es: "Mobiliario y Artículos" },
  "Cursos Profissionalizantes": { en: "Professional Courses", es: "Cursos Profesionales" },
  "Atividades Infantis": { en: "Children's Activities", es: "Actividades Infantiles" },
  "Horários de Culto": { en: "Service Times", es: "Horarios de Culto" },
  "Trabalho e Portfólio": { en: "Portfolio & Works", es: "Portafolio y Trabajos" },
  "Ensaios Fotográficos": { en: "Photo Shoots / Sessions", es: "Sesiones Fotográficas" },
  "Limpeza Residencial": { en: "Residential Cleaning", es: "Limpieza Residencial" },
  "Limpeza Comercial": { en: "Commercial Cleaning", es: "Limpieza Comercial" },
  "Conserto de Celulares": { en: "Mobile Phone Repair", es: "Reparación de Celulares" },
  "Conserto de Computadores": { en: "Computer & Laptop Repair", es: "Reparación de Computadoras" },
  "Produtos Eletrônicos": { en: "Electronic Accessories Store", es: "Productos Electrónicos" },
  "Acessórios": { en: "Accessories", es: "Accesorios" },
  "Serviços Gráficos": { en: "Printing Services", es: "Servicios Gráficos" },
  "Brindes Personalizados": { en: "Custom Gifts / Merchandise", es: "Regalos Personalizados" },
  "Arranjos de Flores": { en: "Flower Arrangements", es: "Arreglos Florales" },
  "Medicamentos": { en: "Medicines / Prescriptions", es: "Medicamentos" },
  "Pacotes Nacionais": { en: "Domestic Travel Packages", es: "Paquetes Nacionales" },
  "Pacotes Internacionais": { en: "International Travel Packages", es: "Paquetes Internacionales" },
  "Categorias": { en: "Categories", es: "Categorías" },
  "Combos Especiais": { en: "Special Combos", es: "Combos Especiales" },
  "Entregas": { en: "Delivery Info", es: "Entregas" },
  "Sobre Nós": { en: "About Us", es: "Sobre Nosotros" },
  "Galeria": { en: "Gallery", es: "Galería" },
  "Informações do Produto": { en: "Product Information", es: "Información del Producto" },
  "Preço e Disponibilidade": { en: "Pricing & Stock Status", es: "Precio y Disponibilidad" },
};
