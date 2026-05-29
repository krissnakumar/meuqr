// MeuQR - Mercado Pago Payment Processing Edge Function
// This function handles payment webhooks and subscription management

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface WebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

interface PaymentData {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
  metadata?: {
    business_id?: string;
    tier?: string;
  };
}

interface SubscriptionData {
  id: string;
  status: string;
  external_reference?: string;
  preapproval_plan_id?: string;
  payer: {
    email: string;
  };
  metadata?: {
    business_id?: string;
    tier?: string;
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mercadoPagoAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
const mercadoPagoWebhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify Mercado Pago webhook signature.
 * The signature is sent in the X-Signature header and should be validated
 * against the webhook secret using HMAC-SHA256.
 */
async function verifyWebhookSignature(
  req: Request,
  rawBody: string
): Promise<boolean> {
  if (!mercadoPagoWebhookSecret) {
    // If no secret is configured, skip verification (development mode)
    console.warn("MERCADO_PAGO_WEBHOOK_SECRET not configured — skipping signature verification");
    return true;
  }

  const signature = req.headers.get("x-signature");
  if (!signature) {
    console.error("Missing x-signature header");
    return false;
  }

  try {
    // Mercado Pago sends signature in format: ts=<timestamp>,v1=<hash>
    const parts = signature.split(",");
    const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
    const hash = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

    if (!ts || !hash) {
      console.error("Invalid signature format");
      return false;
    }

    const manifest = `id:${ts};`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(mercadoPagoWebhookSecret);
    const messageData = encoder.encode(manifest);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = hexToBytes(hash);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, messageData);

    if (!valid) {
      console.error("Invalid webhook signature");
    }

    return valid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function getPaymentData(paymentId: string): Promise<PaymentData | null> {
  if (!mercadoPagoAccessToken) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch payment ${paymentId}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    return null;
  }
}

async function getSubscriptionData(subscriptionId: string): Promise<SubscriptionData | null> {
  if (!mercadoPagoAccessToken) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch subscription ${subscriptionId}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching subscription ${subscriptionId}:`, error);
    return null;
  }
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-signature",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Read raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, rawBody);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WebhookPayload = JSON.parse(rawBody);
    console.log(`Received webhook: ${payload.type} / ${payload.action}`);

    // Handle payment notifications
    if (payload.type === "payment") {
      const paymentData = await getPaymentData(payload.data.id);
      if (!paymentData) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch payment data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const businessId = paymentData.metadata?.business_id || paymentData.external_reference;
      const tier = paymentData.metadata?.tier || "pro";

      // Record payment
      await supabase.from("payments").insert({
        business_id: businessId || "unknown",
        amount: paymentData.transaction_amount,
        currency: "BRL",
        provider: "mercado_pago",
        provider_payment_id: paymentData.id,
        status: paymentData.status === "approved" ? "approved" : "rejected",
      });

      // If approved, update subscription
      if (paymentData.status === "approved" && businessId) {
        await supabase
          .from("subscriptions")
          .update({
            tier,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .eq("business_id", businessId);

        await supabase
          .from("businesses")
          .update({ subscription_tier: tier })
          .eq("id", businessId);
      }
    }

    // Handle subscription notifications
    if (payload.type === "subscription" || payload.type === "subscription_preapproval") {
      const subscriptionData = await getSubscriptionData(payload.data.id);
      if (!subscriptionData) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch subscription data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const businessId = subscriptionData.metadata?.business_id || subscriptionData.external_reference;
      const subscriptionStatus = subscriptionData.status;

      if (businessId) {
        const dbStatus =
          subscriptionStatus === "authorized" ? "active"
          : subscriptionStatus === "paused" ? "past_due"
          : subscriptionStatus === "cancelled" ? "cancelled"
          : "past_due";

        await supabase
          .from("subscriptions")
          .update({
            status: dbStatus,
            provider_subscription_id: subscriptionData.id,
          })
          .eq("business_id", businessId);

        if (dbStatus === "cancelled" || dbStatus === "past_due") {
          await supabase
            .from("businesses")
            .update({ subscription_tier: "free" })
            .eq("id", businessId);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
