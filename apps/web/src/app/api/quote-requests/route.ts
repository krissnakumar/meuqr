import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";
import { ERR, quoteSchema } from "@meuqr/shared";

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
          setAll() {},
        },
      }
    );

    const body = await request.json();

    // Validate request body using quoteSchema
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || ERR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const { customerName, customerPhone, customerEmail, items, message, honeypot } = parsed.data;
    const { businessId, pageId } = body;

    // Spam honeypot detection
    if (honeypot) {
      return NextResponse.json({ error: "Spam detectado." }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: ERR.MISSING_BUSINESS_ID }, { status: 400 });
    }

    // Check if business exists, is active, and has quote_requests module enabled
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("is_active")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
    }

    if (!business.is_active) {
      return NextResponse.json({ error: "Este estabelecimento está inativo." }, { status: 403 });
    }

    // Verify quote_requests module is enabled
    const { data: enabledModules } = await supabaseAdmin
      .from("business_enabled_modules")
      .select("modules(slug)")
      .eq("business_id", businessId)
      .eq("enabled", true);

    const hasModule = enabledModules?.some((m: any) => m.modules?.slug === "quote_requests");
    if (!hasModule) {
      return NextResponse.json({ error: "O módulo de orçamentos está desativado para esta empresa." }, { status: 403 });
    }

    // 1. Create/Retrieve client profile
    let clientId = null;
    try {
      const client = await getOrCreateClient({
        businessId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail || undefined,
        source: "menu"
      });
      clientId = client?.id || null;

      // Update client stats
      if (clientId && client) {
        await supabaseAdmin
          .from("clients")
          .update({
            total_quote_requests: (client.total_quote_requests || 0) + 1,
            last_seen_at: new Date().toISOString(),
            last_interaction_type: "quote_requested"
          })
          .eq("id", clientId);
      }
    } catch (clientErr) {
      console.error("Failed to link client to quote request:", clientErr);
    }

    // 2. Insert quote request
    const { data: quote, error } = await supabaseAdmin
      .from("quote_requests")
      .insert({
        business_id: businessId,
        page_id: pageId || null,
        client_id: clientId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        items: items || [], // JSONB
        message: message || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Quote Request creation error:", error);
      return NextResponse.json({ error: ERR.CREATE_QUOTE_ERROR }, { status: 500 });
    }

    // 3. Dispatch new quote request notification
    const firstItemName = items?.[0]?.name || "item";
    await createNotification({
      businessId,
      clientId: clientId || undefined,
      quoteRequestId: quote.id,
      type: "new_quote",
      data: { clientName: customerName, itemName: firstItemName },
      priority: "high"
    });

    return NextResponse.json({ success: true, quote });
  } catch (err) {
    console.error("Quote Request API internal error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
