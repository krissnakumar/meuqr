import { describe, it, expect } from "vitest";
import {
  generateShortCode,
  isValidShortCode,
  formatBRL,
  slugify,
  detectDeviceType,
  detectBrowser,
} from "@meuqr/shared";

describe("generateShortCode", () => {
  it("should generate a string of default length 8", () => {
    const code = generateShortCode();
    expect(code.length).toBe(8);
  });

  it("should generate a string of specified length", () => {
    const code = generateShortCode(12);
    expect(code.length).toBe(12);
  });

  it("should only contain lowercase letters and numbers", () => {
    const code = generateShortCode(100);
    expect(code).toMatch(/^[a-z0-9]+$/);
  });

  it("should generate unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateShortCode(6)));
    expect(codes.size).toBe(100);
  });
});

describe("isValidShortCode", () => {
  it("should accept valid short codes", () => {
    expect(isValidShortCode("abc123")).toBe(true);
    expect(isValidShortCode("test01")).toBe(true);
    expect(isValidShortCode("qr-code")).toBe(true);
    expect(isValidShortCode("a1b2")).toBe(true);
    expect(isValidShortCode("abc-def-ghi")).toBe(true);
  });

  it("should reject codes that are too short", () => {
    expect(isValidShortCode("ab")).toBe(false);
    expect(isValidShortCode("")).toBe(false);
  });

  it("should reject codes that are too long", () => {
    expect(isValidShortCode("abcdefghijklm")).toBe(false);
  });

  it("should reject codes with invalid characters", () => {
    expect(isValidShortCode("ABC123")).toBe(false);
    expect(isValidShortCode("hello world")).toBe(false);
    expect(isValidShortCode("test_01")).toBe(false);
  });
});

describe("formatBRL", () => {
  it("should format integer values correctly", () => {
    const result = formatBRL(2990);
    expect(result).toContain("2.990");
    expect(result).toContain("R$");
  });

  it("should format decimal values correctly", () => {
    const result = formatBRL(29.9);
    expect(result).toContain("29");
    expect(result).toContain("90");
    expect(result).toContain("R$");
  });

  it("should format zero", () => {
    const result = formatBRL(0);
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("should use Brazilian locale format", () => {
    const result = formatBRL(1499.99);
    // Brazilian format: R$ 1.499,99
    expect(result).toMatch(/R\$/);
    expect(result).toContain("1.499");
  });
});

describe("slugify", () => {
  it("should convert to lowercase", () => {
    expect(slugify("HELLO WORLD")).toBe("hello-world");
  });

  it("should replace spaces with hyphens", () => {
    expect(slugify("hello world foo")).toBe("hello-world-foo");
  });

  it("should remove accented characters", () => {
    expect(slugify("coração são João")).toBe("coracao-sao-joao");
  });

  it("should remove non-alphanumeric characters and replace spaces with hyphens", () => {
    // @, !, and # are removed, space becomes a hyphen
    expect(slugify("hello@world! #2024")).toBe("helloworld-2024");
  });

  it("should trim leading and trailing hyphens", () => {
    expect(slugify("--hello-world--")).toBe("hello-world");
  });

  it("should collapse multiple hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("should handle empty strings", () => {
    expect(slugify("")).toBe("");
  });
});

describe("detectDeviceType", () => {
  it("should detect mobile devices", () => {
    expect(detectDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)")).toBe("mobile");
    expect(detectDeviceType("Mozilla/5.0 (Android 10; Mobile)")).toBe("mobile");
    expect(detectDeviceType("Mozilla/5.0 (iPod)")).toBe("mobile");
  });

  it("should detect desktop as default", () => {
    expect(detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("should handle empty user agent", () => {
    expect(detectDeviceType("")).toBe("desktop");
  });
});

describe("detectBrowser", () => {
  it("should detect Chrome", () => {
    expect(detectBrowser("Mozilla Chrome/91.0 Safari/537.36")).toBe("Chrome");
  });

  it("should detect Firefox", () => {
    expect(detectBrowser("Mozilla Firefox/89.0")).toBe("Firefox");
  });

  it("should detect Safari", () => {
    expect(detectBrowser("Mozilla Safari/605.1")).toBe("Safari");
  });

  it("should detect Edge", () => {
    expect(detectBrowser("Mozilla Edge/91.0")).toBe("Edge");
  });

  it("should return Other for unknown browsers", () => {
    expect(detectBrowser("Unknown Browser")).toBe("Other");
  });

  it("should handle empty user agent", () => {
    expect(detectBrowser("")).toBe("Other");
  });
});
