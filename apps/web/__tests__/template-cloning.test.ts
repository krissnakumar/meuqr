import { describe, it, expect } from "vitest";
import { TEMPLATES, type TemplateDefinition } from "@meuqr/shared";

describe("Template Definitions", () => {
  it("should have all 13 templates", () => {
    expect(TEMPLATES.length).toBe(13);
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
    expect(restaurant!.sections.some((s) => s.name === "Cardápio")).toBe(true);
    expect(restaurant!.sections.some((s) => s.name === "Bebidas")).toBe(true);
  });

  it("salon template should have services section", () => {
    const salon = TEMPLATES.find((t) => t.slug === "salao-barbearia");
    expect(salon).toBeDefined();
    expect(salon!.sections.some((s) => s.name === "Serviços")).toBe(true);
  });

  it("restaurant menu items should include Prato Feito", () => {
    const restaurant = TEMPLATES.find((t) => t.slug === "restaurante");
    const menu = restaurant!.sections.find((s) => s.slug === "cardapio");
    expect(menu).toBeDefined();
    expect(menu!.items.some((i) => i.name === "Prato Feito")).toBe(true);
  });

  it("each template should have at least one default item", () => {
    TEMPLATES.forEach((t: TemplateDefinition) => {
      const totalItems = t.sections.reduce((sum, s) => sum + s.items.length, 0);
      expect(totalItems).toBeGreaterThan(0);
    });
  });

  it("should clone template data correctly", () => {
    const restaurant = TEMPLATES.find((t) => t.slug === "restaurante")!;
    
    // Simulate cloning a template (sort_order is set from array index)
    const clonedSections = restaurant.sections.map((section, idx) => ({
      name: section.name,
      slug: section.slug,
      sort_order: idx,
      items: section.items.map((item, itemIdx) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        sort_order: itemIdx,
      })),
    }));

    expect(clonedSections.length).toBe(restaurant.sections.length);
    expect(clonedSections[0].name).toBe("Cardápio");
    expect(clonedSections[0].items.length).toBeGreaterThan(0);
  });
});
