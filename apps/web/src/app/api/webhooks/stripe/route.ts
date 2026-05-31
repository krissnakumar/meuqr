import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import crypto from "crypto";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyStripeSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = 5 * 60,
}: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
}) {
  if (!signatureHeader) throw new Error("Missing stripe-signature header");
  if (!secret || secret === "whsec_placeholder") throw new Error("Missing STRIPE_WEBHOOK_SECRET");

  const parts = signatureHeader.split(",").map((p) => p.trim());
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));

  const timestamp = timestampPart ? Number(timestampPart.slice(2)) : NaN;
  if (!Number.isFinite(timestamp)) throw new Error("Invalid stripe-signature timestamp");

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    throw new Error("Stripe signature timestamp out of tolerance");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const matches = v1Parts.some((p) => timingSafeEqual(p.slice(3), expected));
  if (!matches) throw new Error("Stripe signature verification failed");
}

async function stripeGet<T>(path: string): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await res.json();
  if (!res.ok) {
    const message = (data && (data.error?.message || data.message)) || "Stripe request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  try {
    verifyStripeSignature({ payload: body, signatureHeader: signature, secret: webhookSecret });

    const event = JSON.parse(body) as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        
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
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const businessId = subscription.metadata?.businessId;
        
        if (businessId) {
          const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: "free" })
            .eq("id", businessId);
            
          if (error) console.error("Failed to downgrade subscription:", error);
        }
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        
        // You would typically query your subscriptions table to find the business, 
        // or get the businessId from the customer metadata
        const customerId = invoice.customer as string | undefined;
        const customer = customerId
          ? await stripeGet<{ metadata?: Record<string, string> }>(`/v1/customers/${customerId}`)
          : null;
        const businessId = customer?.metadata?.businessId;
        
        if (businessId) {
          // Update status to past_due in a real implementation
          // For now, if payment fails, we downgrade to free
          const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: "free" })
            .eq("id", businessId);
            
          if (error) console.error("Failed to update payment failure:", error);
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const businessId = subscription.metadata?.businessId;
        const planKey = subscription.metadata?.planKey;
        
        if (businessId && planKey) {
          const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: planKey })
            .eq("id", businessId);
            
          if (error) console.error("Failed to update subscription tier:", error);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing failed.", err.message);
    return NextResponse.json({ error: "Webhook Processing Error" }, { status: 500 });
  }
}
