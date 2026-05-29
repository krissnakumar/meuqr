import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createBusinessSchema,
  createItemSchema,
  qrStyleSchema,
  leadSchema,
  trackScanSchema,
  trackClickSchema,
} from "@meuqr/shared";

describe("loginSchema", () => {
  it("should validate a correct login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("should validate a correct registration", () => {
    const result = registerSchema.safeParse({
      fullName: "João Silva",
      email: "joao@example.com",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when passwords do not match", () => {
    const result = registerSchema.safeParse({
      fullName: "João Silva",
      email: "joao@example.com",
      password: "123456",
      confirmPassword: "654321",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("should reject short name", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "joao@example.com",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(false);
  });
});

describe("createBusinessSchema", () => {
  const validBusiness = {
    name: "Restaurante do João",
    slug: "restaurante-joao",
    category: "restaurant" as const,
  };

  it("should validate a correct business payload", () => {
    const result = createBusinessSchema.safeParse(validBusiness);
    expect(result.success).toBe(true);
  });

  it("should reject invalid slug characters", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusiness,
      slug: "Restaurante João!",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusiness,
      category: "invalid_category",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusiness,
      description: "Um ótimo restaurante",
      phone: "(11) 99999-8888",
      whatsapp: "5511999998888",
      instagram: "@joaorestaurante",
      website: "https://joaorestaurante.com.br",
    });
    expect(result.success).toBe(true);
  });
});

describe("createItemSchema", () => {
  it("should validate a correct item with defaults", () => {
    const result = createItemSchema.safeParse({ name: "Prato Feito" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemType).toBe("product");
      expect(result.data.isAvailable).toBe(true);
    }
  });

  it("should validate a service type item", () => {
    const result = createItemSchema.safeParse({
      name: "Corte de Cabelo",
      itemType: "service",
      price: 35.0,
    });
    expect(result.success).toBe(true);
  });

  it("should validate an item with price", () => {
    const result = createItemSchema.safeParse({
      name: "Item",
      price: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe("qrStyleSchema", () => {
  it("should validate with defaults", () => {
    const result = qrStyleSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dotStyle).toBe("rounded");
      expect(result.data.errorCorrectionLevel).toBe("M");
    }
  });

  it("should validate all dot styles", () => {
    const validStyles = ["square", "rounded", "classy", "dots", "extra-rounded"] as const;
    validStyles.forEach((style) => {
      const result = qrStyleSchema.safeParse({ dotStyle: style });
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid hex colors", () => {
    const result = qrStyleSchema.safeParse({ foregroundColor: "not-a-color" });
    expect(result.success).toBe(false);
  });

  it("should validate hex colors correctly", () => {
    const result = qrStyleSchema.safeParse({
      foregroundColor: "#FF5733",
      backgroundColor: "#FFFFFF",
    });
    expect(result.success).toBe(true);
  });
});

describe("leadSchema", () => {
  it("should validate with just name", () => {
    const result = leadSchema.safeParse({ name: "Maria" });
    expect(result.success).toBe(true);
  });

  it("should validate with all fields", () => {
    const result = leadSchema.safeParse({
      name: "Maria",
      email: "maria@example.com",
      phone: "(11) 99999-8888",
      message: "Quero mais informações",
    });
    expect(result.success).toBe(true);
  });
});

describe("analytics schemas", () => {
  it("trackScanSchema should validate a scan event", () => {
    const result = trackScanSchema.safeParse({
      qrCodeId: "550e8400-e29b-41d4-a716-446655440000",
      referrer: "instagram",
    });
    expect(result.success).toBe(true);
  });

  it("trackScanSchema should reject invalid UUID", () => {
    const result = trackScanSchema.safeParse({
      qrCodeId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("trackClickSchema should validate a click event", () => {
    const result = trackClickSchema.safeParse({
      qrCodeId: "550e8400-e29b-41d4-a716-446655440000",
      clickType: "whatsapp",
    });
    expect(result.success).toBe(true);
  });

  it("trackClickSchema should reject invalid click type", () => {
    const result = trackClickSchema.safeParse({
      qrCodeId: "550e8400-e29b-41d4-a716-446655440000",
      clickType: "facebook",
    });
    expect(result.success).toBe(false);
  });
});
