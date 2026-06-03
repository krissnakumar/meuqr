import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ERR } from "@meuqr/shared";

async function stripeRequest<T>(path: string, init: RequestInit): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  const res = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const message = (data && (data.error?.message || data.message)) || "Stripe request failed";
    throw new Error(message);
  }

  return data as T;
}

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

    // Usually you would map planKey to a Stripe Price ID from your environment
    const planPrices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
      business: process.env.STRIPE_PRICE_BUSINESS || "price_business_placeholder",
      pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
      business_annual:
        process.env.STRIPE_PRICE_BUSINESS_ANNUAL || process.env.STRIPE_PRICE_BUSINESS || "price_business_placeholder",
    };

    const priceId = planPrices[planKey];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[businessId]", businessId);
    params.set("metadata[planKey]", planKey);
    params.set(
      "success_url",
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?success=true`
    );
    params.set(
      "cancel_url",
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?canceled=true`
    );

    const session = await stripeRequest<{ url: string | null }>("/v1/checkout/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
