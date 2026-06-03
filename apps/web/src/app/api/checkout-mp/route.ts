import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ERR } from "@meuqr/shared";

export async function POST(req: NextRequest) {
  try {
    const { planKey, businessId } = await req.json();

    if (!planKey || !businessId) {
      return NextResponse.json({ error: "Missing planKey or businessId" }, { status: 400 });
    }

    // Verify authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // Not setting cookies in API route
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERR.NOT_AUTHENTICATED }, { status: 401 });
    }

    // Verify the user owns this business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: ERR.BUSINESS_NOT_FOUND_OR_NO_PERMISSION },
        { status: 403 }
      );
    }

    // Usually you would map planKey to a MercadoPago Item
    const planPrices: Record<string, number> = {
      pro: 29.90,
      business: 79.90,
    };
    
    const planNames: Record<string, string> = {
      pro: "MeuQR Pro",
      business: "MeuQR Business",
    };

    const price = planPrices[planKey];
    if (!price) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-placeholder";
    
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: planNames[planKey],
            description: `Assinatura ${planNames[planKey]}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: price,
          },
        ],
        external_reference: businessId,
        metadata: {
          plan_key: planKey,
          business_id: businessId,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?success=true`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?canceled=true`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?pending=true`,
        },
        auto_return: "approved",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MercadoPago Error:", data);
      return NextResponse.json({ error: "Erro ao criar pagamento no MercadoPago" }, { status: 400 });
    }

    return NextResponse.json({ url: data.init_point });
  } catch (error: any) {
    console.error("Checkout MP Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
