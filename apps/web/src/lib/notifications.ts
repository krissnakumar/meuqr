import { supabaseAdmin } from "./supabase-admin";

export const notificationTemplates: Record<string, Record<string, { title: string; message: string }>> = {
  new_order: {
    "pt-BR": {
      title: "Novo pedido recebido",
      message: "{{clientName}} enviou um pedido pelo catálogo MeuQR."
    },
    en: {
      title: "New order received",
      message: "{{clientName}} sent an order through the MeuQR catalog."
    },
    es: {
      title: "Nuevo pedido recibido",
      message: "{{clientName}} envió un pedido por el catálogo MeuQR."
    }
  },
  new_quote: {
    "pt-BR": {
      title: "Novo orçamento solicitado",
      message: "{{clientName}} quer orçamento para {{itemName}}."
    },
    en: {
      title: "New quote requested",
      message: "{{clientName}} wants a quote for {{itemName}}."
    },
    es: {
      title: "Nuevo presupuesto solicitado",
      message: "{{clientName}} quiere un presupuesto para {{itemName}}."
    }
  },
  new_lead: {
    "pt-BR": {
      title: "Novo contato de lead",
      message: "{{clientName}} enviou uma mensagem de contato."
    },
    en: {
      title: "New lead contact",
      message: "{{clientName}} sent a contact message."
    },
    es: {
      title: "Nuevo contacto de lead",
      message: "{{clientName}} envió un mensaje de contacto."
    }
  },
  whatsapp_click: {
    "pt-BR": {
      title: "Cliente chamou no WhatsApp",
      message: "Um cliente iniciou contato no WhatsApp."
    },
    en: {
      title: "Client clicked WhatsApp",
      message: "A client started contact on WhatsApp."
    },
    es: {
      title: "Cliente llamó por WhatsApp",
      message: "Un cliente inició contacto en WhatsApp."
    }
  },
  qr_scan: {
    "pt-BR": {
      title: "QR Code escaneado",
      message: "O QR de {{qrTitle}} foi escaneado."
    },
    en: {
      title: "QR Code scanned",
      message: "The {{qrTitle}} QR was scanned."
    },
    es: {
      title: "Código QR escaneado",
      message: "El código QR {{qrTitle}} fue escaneado."
    }
  },
  pix_copied: {
    "pt-BR": {
      title: "PIX copiado no checkout",
      message: "Cliente copiou o PIX para o pedido."
    },
    en: {
      title: "PIX copied in checkout",
      message: "Client copied the PIX for the order."
    },
    es: {
      title: "PIX copiado en checkout",
      message: "El cliente copió el PIX para el pedido."
    }
  }
};

/**
 * Checks whether quiet hours are currently active for a business
 */
function isQuietHoursActive(settings: any): boolean {
  if (!settings?.quiet_hours_enabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;
  
  const [startH, startM] = (settings.quiet_hours_start || "22:00").split(":").map(Number);
  const [endH, endM] = (settings.quiet_hours_end || "08:00").split(":").map(Number);
  
  const startVal = startH * 60 + startM;
  const endVal = endH * 60 + endM;
  
  if (startVal > endVal) {
    // Spans across midnight (e.g. 22:00 to 08:00)
    return currentTimeVal >= startVal || currentTimeVal <= endVal;
  } else {
    // Normal same-day window (e.g. 13:00 to 15:00)
    return currentTimeVal >= startVal && currentTimeVal <= endVal;
  }
}

/**
 * Securely register or update a client profile
 */
export async function getOrCreateClient(params: {
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  source: "menu" | "qr" | "whatsapp" | "manual";
}) {
  const { businessId, name, phone, email, source } = params;
  
  // Find existing client by phone inside business scope
  const { data: existingClient } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("business_id", businessId)
    .eq("phone", phone)
    .maybeSingle();
    
  if (existingClient) {
    // Update existing client last seen and contact details if provided
    const updatePayload: any = {
      last_seen_at: new Date().toISOString(),
      name,
    };
    if (email) updatePayload.email = email;
    
    const { data: updatedClient } = await supabaseAdmin
      .from("clients")
      .update(updatePayload)
      .eq("id", existingClient.id)
      .select()
      .single();
      
    return updatedClient;
  } else {
    // Insert new client
    const { data: newClient, error } = await supabaseAdmin
      .from("clients")
      .insert({
        business_id: businessId,
        name,
        phone,
        email: email || null,
        source,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.error("Client registration failed:", error);
      throw error;
    }
    return newClient;
  }
}

/**
 * Dispatches a server-side notifications payload
 */
export async function createNotification(params: {
  businessId: string;
  userId?: string;
  clientId?: string;
  orderId?: string;
  quoteRequestId?: string;
  leadId?: string;
  qrCodeId?: string;
  itemId?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: "low" | "normal" | "high" | "urgent";
  channel?: "in_app" | "push" | "email" | "whatsapp" | "system";
}) {
  const {
    businessId,
    userId,
    clientId,
    orderId,
    quoteRequestId,
    leadId,
    qrCodeId,
    itemId,
    type,
    title,
    message,
    data = {},
    priority = "normal",
    channel = "in_app"
  } = params;

  // 1. Fetch business notification settings and language preference
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("notification_settings, owner_id")
    .eq("id", businessId)
    .single();

  const settings = business?.notification_settings || {};
  
  // Apply settings filter
  if (type === "qr_scan" && settings.notify_qr_scan === false) return null;
  if (type === "whatsapp_click" && settings.notify_whatsapp_click === false) return null;
  if (type === "new_order" && settings.notify_new_order === false) return null;
  if (type === "new_quote" && settings.notify_quote_request === false) return null;
  if (type === "new_lead" && settings.notify_lead === false) return null;

  // 2. Persist the in-app notification in Supabase
  const { data: notification, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      business_id: businessId,
      user_id: userId || business?.owner_id || null,
      client_id: clientId || null,
      order_id: orderId || null,
      quote_request_id: quoteRequestId || null,
      lead_id: leadId || null,
      qr_code_id: qrCodeId || null,
      item_id: itemId || null,
      type,
      title,
      message,
      data,
      priority,
      channel,
      status: "unread"
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to persist notification:", error);
    return null;
  }

  // 3. Handle push channel dispatch if enabled
  if (settings.push_enabled !== false) {
    const quiet = isQuietHoursActive(settings);
    // Suppress push notification if quiet hours are active and priority is not urgent
    if (!quiet || priority === "urgent") {
      const targetUserId = userId || business?.owner_id;
      if (targetUserId) {
        // Query active device push tokens
        const { data: tokens } = await supabaseAdmin
          .from("device_push_tokens")
          .select("expo_push_token")
          .eq("user_id", targetUserId)
          .eq("is_active", true);

        if (tokens && tokens.length > 0) {
          const pushTokens = tokens.map(t => t.expo_push_token);
          await sendExpoPushNotification({
            to: pushTokens,
            title,
            body: message,
            data: {
              notificationId: notification.id,
              type,
              businessId,
              orderId,
              quoteRequestId,
              leadId,
              clientId
            }
          });
        }
      }
    }
  }

  return notification;
}

/**
 * Dispatches push messages to Expo Gateway API
 */
export async function sendExpoPushNotification(params: {
  to: string[];
  title: string;
  body: string;
  data?: any;
}) {
  const { to, title, body, data } = params;
  if (!to || to.length === 0) return;

  const messages = to.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
  }));

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error("Expo Push gateway failed:", await res.text());
    } else {
      const responseData = await res.json();
      // Handle deactivated/invalid tokens if returned by Expo
      if (responseData.data && Array.isArray(responseData.data)) {
        responseData.data.forEach(async (receipt: any, idx: number) => {
          if (receipt.status === "error" && receipt.details?.error === "DeviceNotRegistered") {
            const invalidToken = to[idx];
            console.warn(`Deactivating invalid Expo token: ${invalidToken}`);
            await supabaseAdmin
              .from("device_push_tokens")
              .update({ is_active: false })
              .eq("expo_push_token", invalidToken);
          }
        });
      }
    }
  } catch (err) {
    console.error("Expo Push connection exception:", err);
  }
}
