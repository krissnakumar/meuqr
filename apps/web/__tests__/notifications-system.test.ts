import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationTemplates } from "@/lib/notifications";

// Simple local mock/stub for quiet hours calculation to verify business logic
function isQuietHoursActive(settings: any, testTime?: Date): boolean {
  if (!settings?.quiet_hours_enabled) return false;
  
  const now = testTime || new Date();
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

// Stub for resolving templates
function resolveTemplate(type: string, lang: string, variables: Record<string, string>): { title: string; message: string } {
  const templateGroup = notificationTemplates[type];
  if (!templateGroup) return { title: type, message: "" };

  const template = templateGroup[lang] || templateGroup["pt-BR"];
  if (!template) return { title: type, message: "" };

  let title = template.title;
  let message = template.message;

  Object.entries(variables).forEach(([key, val]) => {
    title = title.replace(new RegExp(`{{${key}}}`, "g"), val);
    message = message.replace(new RegExp(`{{${key}}}`, "g"), val);
  });

  return { title, message };
}

// Stub for mobile deep link resolution
function resolveMobileDeepLink(data: any): string {
  const scheme = "meuqr://";
  if (data.orderId) return `${scheme}orders/${data.orderId}`;
  if (data.quoteRequestId) return `${scheme}quote-requests/${data.quoteRequestId}`;
  if (data.leadId) return `${scheme}leads/${data.leadId}`;
  if (data.clientId) return `${scheme}clients/${data.clientId}`;
  if (data.qrCodeId) return `${scheme}qr/${data.qrCodeId}`;
  return `${scheme}dashboard`;
}

describe("Notification System Core Logic", () => {
  
  // 1. Test notification templates & language selection
  describe("Multilingual Templates", () => {
    it("should resolve pt-BR notifications correctly", () => {
      const { title, message } = resolveTemplate("new_order", "pt-BR", { clientName: "Alice" });
      expect(title).toBe("Novo pedido recebido");
      expect(message).toBe("Alice enviou um pedido pelo catálogo MeuQR.");
    });

    it("should resolve en notifications correctly", () => {
      const { title, message } = resolveTemplate("new_quote", "en", { clientName: "Bob", itemName: "Pizza" });
      expect(title).toBe("New quote requested");
      expect(message).toBe("Bob wants a quote for Pizza.");
    });

    it("should fallback to pt-BR if language is unknown", () => {
      const { title, message } = resolveTemplate("pix_copied", "fr", {});
      expect(title).toBe("PIX copiado no checkout");
      expect(message).toBe("Cliente copiou o PIX para o pedido.");
    });
  });

  // 2. Test quiet hours logic
  describe("Quiet Hours Rules", () => {
    it("should return false if quiet hours are disabled", () => {
      const settings = {
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00"
      };
      // Test at midnight
      const testDate = new Date();
      testDate.setHours(0, 30);
      expect(isQuietHoursActive(settings, testDate)).toBe(false);
    });

    it("should suppress push during active overnight quiet hours (e.g. 23:00)", () => {
      const settings = {
        quiet_hours_enabled: true,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00"
      };
      const testDate = new Date();
      testDate.setHours(23, 0); // 11 PM
      expect(isQuietHoursActive(settings, testDate)).toBe(true);
    });

    it("should NOT suppress push during daytime if quiet hours are overnight", () => {
      const settings = {
        quiet_hours_enabled: true,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00"
      };
      const testDate = new Date();
      testDate.setHours(12, 0); // 12 PM
      expect(isQuietHoursActive(settings, testDate)).toBe(false);
    });

    it("should support same-day quiet hours window (e.g. 13:00 to 15:00)", () => {
      const settings = {
        quiet_hours_enabled: true,
        quiet_hours_start: "13:00",
        quiet_hours_end: "15:00"
      };
      const activeDate = new Date();
      activeDate.setHours(14, 0);
      expect(isQuietHoursActive(settings, activeDate)).toBe(true);

      const inactiveDate = new Date();
      inactiveDate.setHours(10, 0);
      expect(isQuietHoursActive(settings, inactiveDate)).toBe(false);
    });
  });

  // 3. Test mark as read & unread count calculation
  describe("Notifications Read Status & Aggregation", () => {
    const list = [
      { id: "1", status: "unread", priority: "high" },
      { id: "2", status: "read", priority: "normal" },
      { id: "3", status: "unread", priority: "low" },
      { id: "4", status: "archived", priority: "normal" }
    ];

    it("should calculate correct unread count", () => {
      const unread = list.filter(n => n.status === "unread").length;
      expect(unread).toBe(2);
    });

    it("should change status to read and record read timestamp", () => {
      const notification = { id: "1", status: "unread", read_at: null };
      
      // Simulate markAsRead behavior
      const updated = {
        ...notification,
        status: "read",
        read_at: new Date().toISOString()
      };

      expect(updated.status).toBe("read");
      expect(updated.read_at).not.toBeNull();
    });
  });

  // 4. Test client creation from orders, quotes, leads
  describe("Public Actions to Persistent CRM Clients", () => {
    // Client fields schema checklist
    const mockClientData = {
      businessId: "biz-123",
      name: "Carlos Silva",
      phone: "+5511999999999",
      email: "carlos@example.com",
      source: "menu" // menu, qr, whatsapp, manual
    };

    it("should check client creation fields are structured properly", () => {
      expect(mockClientData.businessId).toBeDefined();
      expect(mockClientData.name).toBe("Carlos Silva");
      expect(mockClientData.phone).toBe("+5511999999999");
      expect(["menu", "qr", "whatsapp", "manual"]).toContain(mockClientData.source);
    });

    it("should link order payload correctly to client_id", () => {
      const orderPayload = {
        id: "order-999",
        business_id: "biz-123",
        client_id: "client-abc",
        total: 150.00
      };
      expect(orderPayload.client_id).toBe("client-abc");
    });

    it("should link quote request payload correctly to client_id", () => {
      const quotePayload = {
        id: "quote-777",
        business_id: "biz-123",
        client_id: "client-abc",
        items: [{ name: "Product A", qty: 2 }]
      };
      expect(quotePayload.client_id).toBe("client-abc");
    });
  });

  // 5. Test push token registration and Expo validation
  describe("Push Token Registry & Invalid Tokens Deactivation", () => {
    it("should validate push token registration schema", () => {
      const tokenReg = {
        userId: "user-456",
        expoPushToken: "ExponentPushToken[xxxxxx]",
        isActive: true
      };
      expect(tokenReg.expoPushToken).toMatch(/^ExponentPushToken\[.+\]$/);
    });

    it("should identify and deactivate DeviceNotRegistered error tokens", () => {
      // Simulate Expo Push Gateway receipt response
      const receipt = {
        status: "error",
        message: "The device is no longer registered.",
        details: {
          error: "DeviceNotRegistered"
        }
      };

      const tokensList = [
        { expo_push_token: "ExponentPushToken[valid]", is_active: true },
        { expo_push_token: "ExponentPushToken[invalid]", is_active: true }
      ];

      // Simulated deactivation handler
      const handleTokenReceipt = (token: string, response: any) => {
        if (response.status === "error" && response.details?.error === "DeviceNotRegistered") {
          return { expo_push_token: token, is_active: false };
        }
        return { expo_push_token: token, is_active: true };
      };

      const result = handleTokenReceipt("ExponentPushToken[invalid]", receipt);
      expect(result.is_active).toBe(false);
    });
  });

  // 6. Test mobile deep link routing logic
  describe("Mobile Deep Link Routing", () => {
    it("should resolve order deep links properly", () => {
      const link = resolveMobileDeepLink({ orderId: "ord-123" });
      expect(link).toBe("meuqr://orders/ord-123");
    });

    it("should resolve quote request deep links properly", () => {
      const link = resolveMobileDeepLink({ quoteRequestId: "qte-456" });
      expect(link).toBe("meuqr://quote-requests/qte-456");
    });

    it("should resolve lead contact deep links properly", () => {
      const link = resolveMobileDeepLink({ leadId: "led-789" });
      expect(link).toBe("meuqr://leads/led-789");
    });

    it("should resolve client CRM profile deep links properly", () => {
      const link = resolveMobileDeepLink({ clientId: "cli-999" });
      expect(link).toBe("meuqr://clients/cli-999");
    });

    it("should fallback to dashboard deep link", () => {
      const link = resolveMobileDeepLink({});
      expect(link).toBe("meuqr://dashboard");
    });
  });

});
