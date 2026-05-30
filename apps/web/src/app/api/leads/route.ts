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
    const { businessId, pageId, name, email, phone, message, source } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando (businessId e name são necessários)." },
        { status: 400 }
      );
    }

    // 1. Create/Retrieve client profile if phone is supplied
    let clientId = null;
    if (phone) {
      try {
        const client = await getOrCreateClient({
          businessId,
          name,
          phone,
          email: email || undefined,
          source: "menu"
        });
        clientId = client?.id || null;

        // Update client last interaction
        if (clientId && client) {
          await supabaseAdmin
            .from("clients")
            .update({
              last_seen_at: new Date().toISOString(),
              last_interaction_type: "lead_created"
            })
            .eq("id", clientId);
        }
      } catch (clientErr) {
        console.error("Failed to link client to lead:", clientErr);
      }
    }

    // 2. Insert lead into Supabase
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        page_id: pageId || null,
        client_id: clientId,
        name: name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        source: source || "public_page",
      })
      .select()
      .single();

    if (error) {
      console.error("Lead creation error:", error);
      return NextResponse.json({ error: "Erro ao registrar lead." }, { status: 500 });
    }

    // 3. Dispatch new lead notification
    await createNotification({
      businessId,
      clientId: clientId || undefined,
      leadId: lead.id,
      type: "new_lead",
      title: "Novo contato de lead",
      message: `${name} enviou uma nova mensagem pelo formulário de contato.`,
      priority: "normal"
    });

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error("Leads API internal error:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
