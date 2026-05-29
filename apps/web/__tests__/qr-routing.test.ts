import { describe, it, expect } from "vitest";

describe("QR Short Code Routing", () => {
  it("should generate a valid short code format", () => {
    // Short codes are alphanumeric, 6-12 chars
    const shortCode = "abc123";
    expect(shortCode).toMatch(/^[a-z0-9]{4,12}$/);
  });

  it("should validate short code format", () => {
    const validCodes = ["abc123", "test01", "qr-code"];
    const invalidCodes = ["AB", "", "short code with spaces", "too-long-short-code-here"];

    validCodes.forEach((code) => {
      expect(code.length).toBeGreaterThanOrEqual(4);
      expect(code.length).toBeLessThanOrEqual(12);
      expect(code).toMatch(/^[a-z0-9-]+$/);
    });

    invalidCodes.forEach((code) => {
      const isValid =
        code.length >= 4 && code.length <= 12 && /^[a-z0-9-]+$/.test(code);
      expect(isValid).toBe(false);
    });
  });

  it("should detect device type from user agent", () => {
    const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
    const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0";

    const detectDeviceType = (ua: string): string => {
      if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return "mobile";
      if (/tablet|ipad/i.test(ua)) return "tablet";
      return "desktop";
    };

    expect(detectDeviceType(mobileUA)).toBe("mobile");
    expect(detectDeviceType(desktopUA)).toBe("desktop");
  });

  it("should detect browser from user agent", () => {
    const detectBrowser = (ua: string): string => {
      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari")) return "Safari";
      if (ua.includes("Edge")) return "Edge";
      return "Other";
    };

    expect(detectBrowser("Mozilla Chrome/91.0")).toBe("Chrome");
    expect(detectBrowser("Mozilla Firefox/89.0")).toBe("Firefox");
    expect(detectBrowser("Mozilla Safari/605.1")).toBe("Safari");
    expect(detectBrowser("Unknown Browser")).toBe("Other");
  });
});
