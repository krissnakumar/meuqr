import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("data.id") || url.searchParams.get("id");

    const body = await req.json().catch(() => ({}));
    const action = body.action || body.type || topic;
    const paymentId = body.data?.id || id;

    if (action === "payment.created" || action === "payment") {
      if (!paymentId) {
        return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
      }

      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("MercadoPago Token not configured");
      }

      // Fetch payment details from MP
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const paymentInfo = await mpResponse.json();

      if (paymentInfo.status === "approved") {
        const businessId = paymentInfo.metadata?.business_id;
        const planKey = paymentInfo.metadata?.plan_key;

        if (businessId && planKey) {
          const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: planKey })
            .eq("id", businessId);

          if (error) {
            console.error("Failed to update subscription via MP Webhook:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
          }
          console.log(`[MercadoPago Webhook] Updated business ${businessId} to ${planKey}`);
        }
      } else if (paymentInfo.status === "rejected" || paymentInfo.status === "cancelled") {
        const businessId = paymentInfo.metadata?.business_id;
        if (businessId) {
           const { error } = await supabase
            .from("businesses")
            .update({ subscription_tier: "free" })
            .eq("id", businessId);
            if (error) console.error("Failed to downgrade via MP webhook:", error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("MercadoPago Webhook Error:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
