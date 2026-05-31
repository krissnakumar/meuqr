import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { BUSINESS_TEMPLATES } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Not setting cookies
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, templateId } = body;

    if (!businessId || !templateId) {
      return NextResponse.json({ error: "Missing businessId or templateId" }, { status: 400 });
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found or not authorized" }, { status: 403 });
    }

    // Find template
    const template = BUSINESS_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 1. Create a default page
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .insert({
        business_id: businessId,
        template_id: templateId,
        title: typeof template.pageTitle === "string" ? template.pageTitle : template.pageTitle["pt-BR"],
        slug: "home",
        is_published: true,
      })
      .select()
      .single();

    if (pageError) {
      console.error("Error creating page:", pageError);
      return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
    }

    // 2. Create sections and items
    let sectionOrder = 0;
    for (const section of template.sections) {
      const sectionTitle = typeof section.title === "string" ? section.title : section.title["pt-BR"];
      const { data: newSection, error: sectionError } = await supabase
        .from("sections")
        .insert({
          page_id: page.id,
          name: sectionTitle,
          slug: sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          section_type: section.sectionType || "list",
          sort_order: sectionOrder++,
          is_visible: true,
        })
        .select()
        .single();

      if (sectionError || !newSection) {
        console.error("Error creating section:", sectionError);
        continue; // Skip items if section fails
      }

      // Create items
      let itemOrder = 0;
      const itemsToInsert = section.items.map(item => {
        const itemName = typeof item.name === "string" ? item.name : item.name["pt-BR"];
        const itemDesc = item.description 
          ? (typeof item.description === "string" ? item.description : item.description["pt-BR"])
          : null;

        return {
          section_id: newSection.id,
          name: itemName,
          description: itemDesc,
          price: item.price || 0,
          original_price: null,
          image_url: item.image || null,
          item_type: template.formType === "booking" ? "service" : "product",
          is_available: true,
          sort_order: itemOrder++,
        };
      });

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("items")
          .insert(itemsToInsert);

        if (itemsError) {
          console.error("Error creating items:", itemsError);
        }
      }
    }

    return NextResponse.json({ success: true, pageId: page.id });
  } catch (err) {
    console.error("Template application error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
