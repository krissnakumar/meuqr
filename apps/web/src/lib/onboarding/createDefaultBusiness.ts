import { supabaseAdmin } from "@/lib/supabase-admin";
import { VERTICALS_CONFIG, SampleProduct } from "@meuqr/shared";

interface CreateBusinessInput {
  ownerId: string;
  name: string;
  slug: string;
  whatsapp: string;
  verticalSlug: string;
  answers: Record<string, any>;
  /** Custom items from the Seeding Preview step. Falls back to vertical defaults if omitted. */
  sampleItems?: SampleProduct[];
}

export async function createDefaultBusiness({
  ownerId,
  name,
  slug,
  whatsapp,
  verticalSlug,
  answers,
  sampleItems,
}: CreateBusinessInput) {
  const config = VERTICALS_CONFIG[verticalSlug];
  if (!config) {
    throw new Error(`Vertical inválida: ${verticalSlug}`);
  }

  // 1. Insert business
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  const defaultOpeningHours = {
    segunda: "08:00 - 18:00",
    terca: "08:00 - 18:00",
    quarta: "08:00 - 18:00",
    quinta: "08:00 - 18:00",
    sexta: "08:00 - 18:00",
    sabado: "08:00 - 12:00",
    domingo: "Fechado",
  };

  const { data: business, error: bizError } = await supabaseAdmin
    .from("businesses")
    .insert({
      owner_id: ownerId,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      category: verticalSlug,
      description: `Bem-vindo ao ${name.trim()}! Conheça nosso catálogo e entre em contato via WhatsApp.`,
      whatsapp: cleanWhatsapp || null,
      opening_hours: defaultOpeningHours,
      subscription_tier: "free",
      is_active: true,
      onboarding_completed: true,
      setup_step: 6,
      form_schema: answers, // Save answers to form schema metadata
    })
    .select()
    .single();

  if (bizError) {
    console.error("Error inserting business:", bizError);
    throw new Error(bizError.code === "23505" ? "Este link (slug) já está em uso." : bizError.message);
  }

  const businessId = business.id;

  // 2. Fetch system modules to link them by UUID
  const { data: dbModules } = await supabaseAdmin
    .from("modules")
    .select("id, slug");

  if (dbModules && dbModules.length > 0) {
    const modulesToEnable = [
      "overview", "pages", "qr_codes", "whatsapp_actions", "analytics", "inbox", "customers", "settings",
      ...config.defaultModules
    ];

    const enabledInserts = dbModules
      .filter((m) => modulesToEnable.includes(m.slug))
      .map((m) => ({
        business_id: businessId,
        module_id: m.id,
        enabled: true,
        source: "default_vertical" as const,
      }));

    if (enabledInserts.length > 0) {
      await supabaseAdmin.from("business_enabled_modules").insert(enabledInserts);
    }
  }

  // 3. Create default Page
  const { data: page, error: pageError } = await supabaseAdmin
    .from("pages")
    .insert({
      business_id: businessId,
      title: "Home",
      slug: "home",
      is_published: true,
      seo_title: name,
      seo_description: `Confira nossos produtos e serviços no MeuQR.`,
    })
    .select()
    .single();

  if (pageError) {
    console.error("Error creating default page:", pageError);
  } else if (page) {
    // 4. Create Public Sections
    let sortOrder = 0;
    for (const sectionType of config.publicPageSections) {
      const sectionName = 
        sectionType === "hero" ? "Apresentação" :
        sectionType === "menu_list" ? "Cardápio" :
        sectionType === "product_grid" ? "Produtos" :
        sectionType === "service_list" ? "Serviços" :
        sectionType === "quote_form" ? "Solicitar Orçamento" :
        sectionType === "order_form" ? "Fazer Pedido" :
        sectionType === "appointment_form" ? "Agendar Horário" :
        sectionType === "whatsapp_cta" ? "Contato WhatsApp" :
        sectionType === "reviews" ? "Avaliações" :
        sectionType === "business_hours" ? "Horário de Funcionamento" : "Seção";

      const { data: section, error: secError } = await supabaseAdmin
        .from("sections")
        .insert({
          page_id: page.id,
          name: sectionName,
          slug: sectionType,
          section_type: sectionType,
          sort_order: sortOrder++,
          is_visible: true,
        })
        .select()
        .single();

      if (secError) {
        console.error(`Error creating section ${sectionType}:`, secError);
        continue;
      }

      // 5. Seed Sample Products / Services
      const hasItems = ["menu_list", "product_grid", "service_list"].includes(sectionType);
      if (hasItems && section) {
        // Use custom items from Seeding Preview if provided, otherwise fall back to vertical defaults
        const productsToSeed = (sampleItems && sampleItems.length > 0)
          ? sampleItems
          : config.sampleProducts;

        let itemSort = 0;
        const itemInserts = productsToSeed.map((p) => ({
          section_id: section.id,
          name: p.name,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice || null,
          item_type: p.itemType,
          is_available: true,
          sort_order: itemSort++,
        }));

        if (itemInserts.length > 0) {
          const { error: itemError } = await supabaseAdmin.from("items").insert(itemInserts);
          if (itemError) {
            console.error("Error inserting items:", itemError);
          }
        }
      }
    }
  }

  // 6. Create main QR Code
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const qrShortCode = `${slug.slice(0, 10)}-${randomSuffix}`;
  await supabaseAdmin.from("qr_codes").insert({
    business_id: businessId,
    short_code: qrShortCode,
    title: `QR Principal - ${name}`,
    is_active: true,
  });

  return {
    businessId,
    slug,
  };
}
