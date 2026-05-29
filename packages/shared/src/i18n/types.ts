// =============================================================================
// i18n Types — Multilingual Support for MeuQR
// =============================================================================

export type Language = "pt-BR" | "en" | "es";

export const DEFAULT_LANGUAGE: Language = "pt-BR";

export const SUPPORTED_LANGUAGES: Language[] = ["pt-BR", "en", "es"];

export interface LanguageInfo {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_INFO: Record<Language, LanguageInfo> = {
  "pt-BR": { code: "pt-BR", label: "Portuguese (Brazil)", nativeName: "Português (Brasil)", flag: "🇧🇷" },
  en: { code: "en", label: "English", nativeName: "English", flag: "🇺🇸" },
  es: { code: "es", label: "Spanish", nativeName: "Español", flag: "🇪🇸" },
};

/**
 * A translated text string that holds translations for all supported languages.
 * This is the primary type used throughout the template system.
 */
export type TranslatedText = {
  "pt-BR": string;
  en: string;
  es: string;
};

/**
 * Helper to create a TranslatedText value.
 */
export function tt(ptBR: string, en: string, es: string): TranslatedText {
  return { "pt-BR": ptBR, en, es };
}

/**
 * Resolve a translated text for a given language, falling back to pt-BR.
 */
export function resolveText(text: TranslatedText | string | undefined, lang: Language): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text["pt-BR"] || "";
}

/**
 * Create a TranslatedText where all languages share the same value.
 */
export function ttSame(value: string): TranslatedText {
  return { "pt-BR": value, en: value, es: value };
}
