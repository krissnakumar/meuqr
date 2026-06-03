import { describe, it, expect } from "vitest";
import { TEMPLATES, BUSINESS_TEMPLATES, resolveLocalized, type TemplateDefinition, type BusinessTemplate } from "@meuqr/shared";

describe("Template Definitions (Legacy)", () => {
  it("should have all 55 templates", () => {
    expect(TEMPLATES.length).toBe(55);
  });

  it("each template should have a name, slug, category, sections", () => {
    TEMPLATES.forEach((t: TemplateDefinition) => {
      expect(t.name).toBeTruthy();
      expect(t.slug).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.sections.length).toBeGreaterThan(0);
    });
  });

  it("slug should be URL-safe", () => {
    TEMPLATES.forEach((t: TemplateDefinition) => {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("restaurant template should have menu and drinks sections", () => {
    const restaurant = TEMPLATES.find((t) => t.slug === "restaurante");
    expect(restaurant).toBeDefined();
    expect(restaurant!.sections.some((s) => s.name === "Combos")).toBe(true);
    expect(restaurant!.sections.some((s) => s.name === "Pratos Feitos")).toBe(true);
  });

  it("each template should have at least one default item", () => {
    TEMPLATES.forEach((t: TemplateDefinition) => {
      const totalItems = t.sections.reduce((sum, s) => sum + s.items.length, 0);
      expect(totalItems).toBeGreaterThan(0);
    });
  });
});

describe("Business Template System (v2)", () => {
  it("should have exactly 55 templates", () => {
    expect(BUSINESS_TEMPLATES.length).toBe(55);
  });

  it("each template should have required fields", () => {
    BUSINESS_TEMPLATES.forEach((t: BusinessTemplate) => {
      expect(t.id).toBeTruthy();
      expect(t.businessType).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.pageTitle).toBeTruthy();
      expect(t.formType).toBeTruthy();
      expect(t.whatsappCta).toBeTruthy();
      expect(t.qrUseCase).toBeTruthy();
      expect(t.sections.length).toBeGreaterThan(0);
    });
  });

  it("all form types should be valid", () => {
    const validFormTypes = ["lead", "quote", "order", "booking", "catalog", "menu"];
    BUSINESS_TEMPLATES.forEach((t: BusinessTemplate) => {
      expect(validFormTypes).toContain(t.formType);
    });
  });

  it("should have diverse business categories", () => {
    const categories = [...new Set(BUSINESS_TEMPLATES.map((t) => t.businessType))];
    expect(categories.length).toBeGreaterThanOrEqual(50);
  });

  it("should have at least 8 items per template on average", () => {
    const totalItems = BUSINESS_TEMPLATES.reduce(
      (sum, t) => sum + t.sections.reduce((s, sec) => s + sec.items.length, 0),
      0
    );
    const average = totalItems / BUSINESS_TEMPLATES.length;
    expect(average).toBeGreaterThanOrEqual(8);
  });

  it("should have at least 2 sections per template", () => {
    BUSINESS_TEMPLATES.forEach((t: BusinessTemplate) => {
      expect(t.sections.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("each item should have a name", () => {
    BUSINESS_TEMPLATES.forEach((t: BusinessTemplate) => {
      t.sections.forEach((section) => {
        section.items.forEach((item) => {
          expect(item.name).toBeTruthy();
        });
      });
    });
  });

  it("each template should have a unique ID", () => {
    const ids = BUSINESS_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("restaurant template should have combos, meals, drinks", () => {
    const restaurant = BUSINESS_TEMPLATES.find((t) => t.businessType === "restaurant");
    expect(restaurant).toBeDefined();
    expect(restaurant!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Combos")).toBe(true);
    expect(restaurant!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Pratos Feitos")).toBe(true);
    expect(restaurant!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Lanches")).toBe(true);
    expect(restaurant!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Bebidas")).toBe(true);
    expect(restaurant!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Sobremesas")).toBe(true);
  });

  it("construction materials template should have many sections", () => {
    const construction = BUSINESS_TEMPLATES.find((t) => t.businessType === "construction_materials");
    expect(construction).toBeDefined();
    expect(construction!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Cimento e Argamassa")).toBe(true);
    expect(construction!.sections.some((s) => resolveLocalized(s.title, "pt-BR") === "Tintas")).toBe(true);
  });
});
