import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";
import { ERR } from "@meuqr/shared";

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

    const body = await request.json();
    const { businessId, pageId, customerName, customerPhone, customerEmail, items, total, paymentMethod } = body;

    if (!businessId || !customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: ERR.MISSING_ORDER_DATA },
        { status: 400 }
      );
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

    // 2. Insert order into Supabase
    const { data: order, error } = await supabase
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
      title: "Novo pedido recebido",
      message: `${customerName} enviou um pedido de R$ ${total.toFixed(2)} pelo catálogo MeuQR.`,
      priority: "high"
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Order API internal error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
