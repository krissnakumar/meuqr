import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";
import { ERR, orderSchema } from "@meuqr/shared";

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

    // Validate request body using orderSchema (with honeypot & phone checks)
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || ERR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const { customerName, customerPhone, customerEmail, items, total, paymentMethod, honeypot } = parsed.data;
    const { businessId, pageId } = body;

    // Spam honeypot detection
    if (honeypot) {
      return NextResponse.json({ error: "Spam detectado." }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: ERR.MISSING_BUSINESS_ID }, { status: 400 });
    }

    // Check if business exists, is active, and has orders module enabled
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

    // Verify orders module is enabled
    const { data: enabledModules } = await supabaseAdmin
      .from("business_enabled_modules")
      .select("modules(slug)")
      .eq("business_id", businessId)
      .eq("enabled", true);

    const hasModule = enabledModules?.some((m: any) => m.modules?.slug === "orders");
    if (!hasModule) {
      return NextResponse.json({ error: "O módulo de pedidos está desativado para esta empresa." }, { status: 403 });
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
            total_orders: (client.total_orders || 0) + 1,
            last_seen_at: new Date().toISOString(),
            last_interaction_type: "order_created"
          })
          .eq("id", clientId);
      }
    } catch (clientErr) {
      console.error("Failed to link client to order:", clientErr);
    }

    // 2. Insert order
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        business_id: businessId,
        page_id: pageId || null,
        client_id: clientId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        items: items, // JSONB
        total: total,
        payment_method: paymentMethod || "pix",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: ERR.CREATE_ORDER_ERROR }, { status: 500 });
    }

    // 3. Dispatch new order notification
    await createNotification({
      businessId,
      clientId: clientId || undefined,
      orderId: order.id,
      type: "new_order",
      data: { clientName: customerName },
      priority: "high"
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Order API internal error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
