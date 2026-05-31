import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-04-10" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const businessId = session.metadata?.businessId;
        const planKey = session.metadata?.planKey;

        if (businessId && planKey) {
          // Update the business subscription tier
          const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: planKey })
            .eq("id", businessId);

          if (error) {
            console.error("Failed to update subscription in Supabase:", error);
            return NextResponse.json({ error: "Database Update Error" }, { status: 500 });
          }
          
          console.log(`Successfully upgraded business ${businessId} to ${planKey}`);
        }
        break;
      }
      // Add other events like invoice.payment_succeeded, customer.subscription.deleted, etc.
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing failed.", err.message);
    return NextResponse.json({ error: "Webhook Processing Error" }, { status: 500 });
  }
}
