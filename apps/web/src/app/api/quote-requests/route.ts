import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";

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
    const { businessId, pageId, customerName, customerPhone, customerEmail, items, message } = body;

    if (!businessId || !customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando ou lista de itens vazia." },
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
            total_quote_requests: (client.total_quote_requests || 0) + 1,
            last_seen_at: new Date().toISOString(),
            last_interaction_type: "quote_requested"
          })
          .eq("id", clientId);
      }
    } catch (clientErr) {
      console.error("Failed to link client to quote request:", clientErr);
    }

    // 2. Insert quote request into Supabase
    const { data: quote, error } = await supabase
      .from("quote_requests")
      .insert({
        business_id: businessId,
        page_id: pageId || null,
        client_id: clientId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        items: items, // JSONB
        message: message || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Quote Request creation error:", error);
      return NextResponse.json({ error: "Erro ao criar solicitação de orçamento." }, { status: 500 });
    }

    // 3. Dispatch new quote request notification
    const firstItemName = items[0]?.name || "item";
    await createNotification({
      businessId,
      clientId: clientId || undefined,
      quoteRequestId: quote.id,
      type: "new_quote",
      title: "Novo orçamento solicitado",
      message: `${customerName} quer orçamento para ${firstItemName} (${items.length} itens).`,
      priority: "high"
    });

    return NextResponse.json({ success: true, quote });
  } catch (err) {
    console.error("Quote Request API internal error:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
