// =============================================================================
// Templates Module — Re-exports the new business template system
// and maintains backward compatibility with the old TemplateDefinition format.
// =============================================================================

import type { BusinessCategory, LocalizedString } from "./types";
import type { Language } from "./i18n/types";
import { resolveText } from "./i18n/types";
import {
  BUSINESS_TEMPLATES,
  getAllBusinessTemplates,
  getBusinessTemplateById,
  getTemplatesByBusinessType,
} from "./templates/business-templates";

// ===== Re-export everything from the new system =====
export {
  BUSINESS_TEMPLATES,
  getAllBusinessTemplates,
  getBusinessTemplateById,
  getTemplatesByBusinessType,
  searchBusinessTemplates,
  getTemplateItemCount,
  getTemplateSectionCount,
  getFormTypeLabel,
} from "./templates/business-templates";

export type {
  BusinessTemplate,
  BusinessTemplateSection,
  BusinessTemplateItem,
  FormType,
  LocalizedString,
} from "./types";

// =============================================================================
// Language-aware template helpers
// =============================================================================

import type { BusinessTemplate, BusinessTemplateSection, BusinessTemplateItem } from "./types";

/**
 * Resolve a localized string (string | TranslatedText) to a concrete string for the given language.
 */
export function resolveLocalized(value: LocalizedString | undefined, lang: Language): string {
  return resolveText(value as any, lang);
}

/**
 * Convert a BusinessTemplate so all user-facing strings are resolved for a given language.
 */
export function resolveTemplateForLanguage(template: BusinessTemplate, lang: Language): ResolvedTemplate {
  return {
    ...template,
    name: resolveLocalized(template.name, lang),
    description: resolveLocalized(template.description, lang),
    pageTitle: resolveLocalized(template.pageTitle, lang),
    whatsappCta: resolveLocalized(template.whatsappCta, lang),
    qrUseCase: resolveLocalized(template.qrUseCase, lang),
    sections: template.sections.map((section) => ({
      ...section,
      title: resolveLocalized(section.title, lang),
      description: section.description ? resolveLocalized(section.description, lang) : undefined,
      items: section.items.map((item) => ({
        ...item,
        name: resolveLocalized(item.name, lang),
        description: item.description ? resolveLocalized(item.description, lang) : undefined,
        whatsappMessage: item.whatsappMessage ? resolveLocalized(item.whatsappMessage, lang) : undefined,
      })),
    })),
  };
}

/**
 * A fully resolved template with all strings resolved to a concrete language.
 */
export interface ResolvedTemplate {
  id: string;
  businessType: BusinessCategory;
  name: string;
  description: string;
  pageTitle: string;
  formType: import("./types").FormType;
  whatsappCta: string;
  qrUseCase: string;
  sections: ResolvedSection[];
}

export interface ResolvedSection {
  title: string;
  description?: string;
  sectionType?: string;
  items: ResolvedItem[];
}

export interface ResolvedItem {
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  whatsappMessage?: string;
  imagePlaceholder?: string;
  isFeatured?: boolean;
}

/**
 * Get all templates with strings resolved for a given language.
 */
export function getResolvedTemplates(lang: Language): ResolvedTemplate[] {
  return getAllBusinessTemplates().map((t) => resolveTemplateForLanguage(t, lang));
}

/**
 * Get a resolved template by id for a given language.
 */
export function getResolvedTemplateById(id: string, lang: Language): ResolvedTemplate | undefined {
  const template = getBusinessTemplateById(id);
  return template ? resolveTemplateForLanguage(template, lang) : undefined;
}

/**
 * Get resolved templates by business type for a given language.
 */
export function getResolvedTemplatesByType(type: BusinessCategory, lang: Language): ResolvedTemplate[] {
  return getTemplatesByBusinessType(type).map((t) => resolveTemplateForLanguage(t, lang));
}

// =============================================================================
// LEGACY — TemplateDefinition for backward compatibility
// =============================================================================

export interface TemplateDefinition {
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string;
  sections: {
    name: string;
    slug: string;
    sectionType?: string;
    items: {
      name: string;
      description?: string;
      price?: number;
    }[];
  }[];
}

/**
 * Converts a BusinessTemplate to the legacy TemplateDefinition format (using pt-BR).
 */
function toTemplateDefinition(t: BusinessTemplate): TemplateDefinition {
  const resolved = resolveTemplateForLanguage(t, "pt-BR");
  return {
    name: resolved.name,
    slug: t.id.replace(/^tmpl-\d+-/, ""),
    category: t.businessType,
    description: resolved.description,
    sections: resolved.sections.map((s) => ({
      name: s.title,
      slug: s.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      sectionType: s.sectionType,
      items: s.items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
      })),
    })),
  };
}

/**
 * LEGACY — Array of TemplateDefinitions for backward compatibility.
 * Derived from the new BUSINESS_TEMPLATES.
 */
export const TEMPLATES: TemplateDefinition[] = BUSINESS_TEMPLATES.map(toTemplateDefinition);

/**
 * LEGACY — Get a template by its slug.
 */
export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

/**
 * LEGACY — Get templates by category.
 */
export function getTemplatesByCategory(category: BusinessCategory): TemplateDefinition[] {
  return TEMPLATES.filter((t) => t.category === category);
}

/**
 * LEGACY — Get all templates.
 */
export function getAllTemplates(): TemplateDefinition[] {
  return TEMPLATES;
}
