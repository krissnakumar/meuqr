import { describe, it, expect } from "vitest";
import {
  PLANS,
  BUSINESS_CATEGORIES,
  QR_DEFAULTS,
  COLORS,
  UPLOAD_LIMITS,
  APP_NAME,
  APP_DESCRIPTION,
} from "@meuqr/shared";

describe("APP_NAME and APP_DESCRIPTION", () => {
  it("should have correct app name", () => {
    expect(APP_NAME).toBe("MeuQR");
  });

  it("should have a description", () => {
    expect(APP_DESCRIPTION.length).toBeGreaterThan(10);
  });
});

describe("BUSINESS_CATEGORIES", () => {
  it("should have all defined categories", () => {
    expect(BUSINESS_CATEGORIES.length).toBeGreaterThan(10);
  });

  it("each category should have value, label, and icon", () => {
    BUSINESS_CATEGORIES.forEach((cat) => {
      expect(cat.value).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    });
  });

  it("should include restaurant category", () => {
    const restaurant = BUSINESS_CATEGORIES.find((c) => c.value === "restaurant");
    expect(restaurant).toBeDefined();
    expect(restaurant!.label).toBe("Restaurante / Lanchonete");
  });

  it("should have unique values", () => {
    const values = BUSINESS_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("PLANS", () => {
  it("should have all tiers", () => {
    expect(Object.keys(PLANS)).toEqual(["free", "pro", "business", "past_due"]);
  });

  it("free plan should have no custom QR, analytics, or staff", () => {
    const free = PLANS.free;
    expect(free.custom_qr).toBe(false);
    expect(free.analytics).toBe(false);
    expect(free.staff_members).toBe(false);
    expect(free.api_access).toBe(false);
  });

  it("free plan should limit to 1 business and 20 items", () => {
    expect(PLANS.free.max_businesses).toBe(1);
    expect(PLANS.free.max_items).toBe(20);
  });

  it("pro plan should have custom QR, analytics, and no staff", () => {
    expect(PLANS.pro.custom_qr).toBe(true);
    expect(PLANS.pro.analytics).toBe(true);
    expect(PLANS.pro.staff_members).toBe(false);
  });

  it("business plan should have everything enabled", () => {
    expect(PLANS.business.custom_qr).toBe(true);
    expect(PLANS.business.analytics).toBe(true);
    expect(PLANS.business.staff_members).toBe(true);
    expect(PLANS.business.api_access).toBe(true);
  });

  it("should have correct pricing", () => {
    expect(PLANS.free.price_monthly).toBe(0);
    expect(PLANS.pro.price_monthly).toBe(29.9);
    expect(PLANS.business.price_monthly).toBe(79.9);
    expect(PLANS.pro.price_yearly).toBe(299);
    expect(PLANS.business.price_yearly).toBe(799);
  });

  it("pro plan should have unlimited QRs", () => {
    expect(PLANS.pro.max_qrs).toBe(-1);
  });
});

describe("QR_DEFAULTS", () => {
  it("should have sensible defaults", () => {
    expect(QR_DEFAULTS.foregroundColor).toBe("#1877F2");
    expect(QR_DEFAULTS.backgroundColor).toBe("#FFFFFF");
    expect(QR_DEFAULTS.errorCorrectionLevel).toBe("M");
    expect(QR_DEFAULTS.margin).toBe(10);
  });
});

describe("COLORS", () => {
  it("should have all required color keys", () => {
    const keys = [
      "primary", "accent", "secondary", "background", "white",
      "muted", "border", "error", "success", "warning",
    ];
    keys.forEach((key) => {
      expect(COLORS).toHaveProperty(key);
    });
  });

  it("all colors should be valid hex codes", () => {
    Object.values(COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

describe("UPLOAD_LIMITS", () => {
  it("should have max file size of 5MB", () => {
    expect(UPLOAD_LIMITS.max_file_size_mb).toBe(5);
  });

  it("should allow common image types", () => {
    expect(UPLOAD_LIMITS.allowed_image_types).toContain("image/jpeg");
    expect(UPLOAD_LIMITS.allowed_image_types).toContain("image/png");
    expect(UPLOAD_LIMITS.allowed_image_types).toContain("image/webp");
  });
});
