import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";
import { ERR, leadSchema } from "@meuqr/shared";

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

    // Validate request body using leadSchema
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || ERR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = parsed.data;
    const { businessId, pageId, source } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: ERR.MISSING_BUSINESS_ID },
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

    // 2. Insert lead into Supabase (using admin client to bypass select RLS constraint for anonymous guest)
    const { data: lead, error } = await supabaseAdmin
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
      return NextResponse.json({ error: ERR.CREATE_LEAD_ERROR }, { status: 500 });
    }

    // 3. Dispatch new lead notification
    await createNotification({
      businessId,
      clientId: clientId || undefined,
      leadId: lead.id,
      type: "new_lead",
      data: { clientName: name },
      priority: "normal"
    });

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error("Leads API internal error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
