import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// Use a placeholder secret if not set
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-04-10" as any, // fallback to typical api version
});

export async function POST(req: NextRequest) {
  try {
    const { planKey, businessId } = await req.json();

    if (!planKey || !businessId) {
      return NextResponse.json({ error: "Missing planKey or businessId" }, { status: 400 });
    }

    // Usually you would map planKey to a Stripe Price ID from your environment
    const planPrices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
      business: process.env.STRIPE_PRICE_BUSINESS || "price_business_placeholder",
    };

    const priceId = planPrices[planKey];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Use metadata to track which business is being upgraded
      metadata: {
        businessId,
        planKey,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
