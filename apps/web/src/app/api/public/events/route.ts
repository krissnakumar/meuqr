import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { getOrCreateClient, createNotification, supabaseAdmin } from "@/lib/notifications";
import { ERR } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check
    const ip = getClientIp(request);
    const limitRes = await checkRateLimit(ip, RATE_LIMIT_CONFIGS.tracking);
    if (!limitRes.allowed) {
      return NextResponse.json({ error: ERR.TOO_MANY_SOLICITATIONS }, { status: 429 });
    }

    // 2. Parse event payload
    const body = await request.json();
    const {
      businessId,
      eventType,
      clientName,
      clientPhone,
      clientEmail,
      qrCodeId,
      qrTitle,
      itemId,
      itemName,
      orderId,
      metadata = {}
    } = body;

    if (!businessId || !eventType) {
      return NextResponse.json({ error: ERR.MISSING_REQUIRED_DATA }, { status: 400 });
    }

    // Validate business exists
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, name")
      .eq("id", businessId)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: ERR.BUSINESS_NOT_FOUND }, { status: 404 });
    }

    // 3. Resolve Client profile if name/phone is provided
    let client = null;
    if (clientName && clientPhone) {
      client = await getOrCreateClient({
        businessId,
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        source: qrCodeId ? "qr" : "menu"
      });

      // Update client statistics/timeline for tracking
      let updatePayload: any = {
        last_seen_at: new Date().toISOString(),
        last_interaction_type: eventType
      };

      await supabaseAdmin
        .from("clients")
        .update(updatePayload)
        .eq("id", client.id);
    }

    // 4. Create custom notification based on event type
    let notification = null;
    let priority: "low" | "normal" | "high" | "urgent" = "normal";
    let title = "";
    let message = "";

    switch (eventType) {
      case "qr_scan":
        priority = "low";
        title = "QR Code escaneado";
        message = qrTitle 
          ? `O QR de "${qrTitle}" foi escaneado.` 
          : "Um QR Code do seu negócio foi escaneado.";
        
        // Log the scan click in Supabase
        if (qrCodeId) {
          await supabaseAdmin
            .from("clicks")
            .insert({
              qr_code_id: qrCodeId,
              click_type: "share" // Generic tracking
            });
        }
        break;

      case "whatsapp_click":
        priority = "normal";
        title = "Cliente chamou no WhatsApp";
        message = itemName 
          ? `Um cliente clicou no WhatsApp pelo item: "${itemName}".` 
          : "Um cliente clicou no botão de WhatsApp do seu catálogo.";
        
        // Log the WhatsApp click
        await supabaseAdmin
          .from("clicks")
          .insert({
            qr_code_id: qrCodeId || null,
            click_type: "whatsapp"
          });
        break;

      case "checkout_started":
        priority = "high";
        title = "Checkout iniciado";
        message = clientName 
          ? `${clientName} iniciou o checkout do pedido.` 
          : "Um cliente iniciou a finalização de um pedido.";
        break;

      case "pix_copied":
        priority = "high";
        title = "PIX copiado no checkout";
        message = clientName
          ? `${clientName} copiou a chave PIX para pagamento.`
          : `Um cliente copiou a chave PIX no checkout.`;
        
        await supabaseAdmin
          .from("clicks")
          .insert({
            qr_code_id: qrCodeId || null,
            click_type: "pix"
          });
        break;

      case "item_view":
        // Quiet tracking event, no instant push notification, only register in analytics
        break;

      default:
        title = "Interação de Cliente";
        message = `Cliente interagiu com seu catálogo (${eventType}).`;
        break;
    }

    // 5. Fire notification if we generated title/message
    if (title && message) {
      notification = await createNotification({
        businessId,
        clientId: client?.id || null,
        qrCodeId: qrCodeId || null,
        itemId: itemId || null,
        orderId: orderId || null,
        type: eventType,
        title,
        message,
        data: metadata,
        priority
      });
    }

    return NextResponse.json({
      success: true,
      clientId: client?.id || null,
      notificationId: notification?.id || null
    });

  } catch (err) {
    console.error("Public Event API exception:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
