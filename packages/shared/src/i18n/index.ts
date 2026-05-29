// =============================================================================
// i18n — Multilingual Support for MeuQR
// =============================================================================

import type { Language, TranslatedText } from "./types";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, LANGUAGE_INFO } from "./types";
import type { BusinessCategory } from "../types";

// Import locale bundles directly from JSON
import ptBRBundle from "./locales/pt-BR.json";
import enBundle from "./locales/en.json";
import esBundle from "./locales/es.json";

export type { Language, TranslatedText, LanguageInfo } from "./types";
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, LANGUAGE_INFO, tt, ttSame, resolveText } from "./types";

// =============================================================================
// Translation Dictionary Type
// =============================================================================

export type TranslationDict = Record<string, string>;

export type LocaleBundle = {
  common: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  business: Record<string, string>;
  onboarding: Record<string, string>;
  pricing: Record<string, string>;
  public: Record<string, string>;
  forms: Record<string, string>;
  validation: Record<string, string>;
  errors: Record<string, string>;
  success: Record<string, string>;
  templates: Record<string, string>;
  categories: Record<string, string>;
};

// =============================================================================
// Pre-loaded locale bundles
// =============================================================================

export const LOCALE_BUNDLES: Record<Language, LocaleBundle> = {
  "pt-BR": ptBRBundle as LocaleBundle,
  en: enBundle as LocaleBundle,
  es: esBundle as LocaleBundle,
};

// =============================================================================
// Translation function (using pre-loaded bundles)
// =============================================================================

/**
 * Translate a key into the given language with fallback to pt-BR.
 */
function lookupKey(
  key: string,
  bundle: LocaleBundle,
  params?: Record<string, string | number>
): string | null {
  // Support dotted notation: "section.key"
  const dotIdx = key.indexOf(".");
  if (dotIdx > 0) {
    const sectionName = key.substring(0, dotIdx);
    const actualKey = key.substring(dotIdx + 1);
    const section = (bundle as Record<string, Record<string, string>>)[sectionName];
    if (section && section[actualKey] !== undefined) {
      let text = section[actualKey];
      if (params) {
        for (const [pk, pv] of Object.entries(params)) {
          text = text.replace(`{${pk}}`, String(pv));
        }
      }
      return text;
    }
  }

  // Fallback: search all sections for the key
  const sections = Object.values(bundle) as Record<string, string>[];
  for (const section of sections) {
    if (section[key] !== undefined) {
      let text = section[key];
      if (params) {
        for (const [pk, pv] of Object.entries(params)) {
          text = text.replace(`{${pk}}`, String(pv));
        }
      }
      return text;
    }
  }

  return null;
}

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  // Try the requested language
  const bundle = LOCALE_BUNDLES[lang];
  if (bundle) {
    const result = lookupKey(key, bundle, params);
    if (result !== null) return result;
  }

  // Fallback to pt-BR
  if (lang !== DEFAULT_LANGUAGE) {
    const fbBundle = LOCALE_BUNDLES[DEFAULT_LANGUAGE];
    if (fbBundle) {
      const result = lookupKey(key, fbBundle, params);
      if (result !== null) return result;
    }
  }

  return key;
}

/**
 * Get category label localized for a given language.
 */
export function getCategoryLabel(category: BusinessCategory, lang: Language): string {
  const bundle = LOCALE_BUNDLES[lang] || LOCALE_BUNDLES[DEFAULT_LANGUAGE];
  if (bundle?.categories?.[category]) return bundle.categories[category];
  // Fallback: try to t() it
  const translated = t(`category_${category}`, lang);
  if (translated !== `category_${category}`) return translated;
  return category;
}

// =============================================================================
// Language persistence helpers (web)
// =============================================================================

const STORAGE_KEY = "meuqr_language";
const EVENT_NAME = "meuqr_language_changed";

export function getSavedLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
    return saved as Language;
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, lang);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export const LANGUAGE_STORAGE_KEY = STORAGE_KEY;
export const LANGUAGE_CHANGE_EVENT = EVENT_NAME;
