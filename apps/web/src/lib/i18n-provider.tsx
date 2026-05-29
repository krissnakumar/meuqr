"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@meuqr/shared";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LANGUAGE_INFO,
  LOCALE_BUNDLES,
  saveLanguage,
  getSavedLanguage,
  LANGUAGE_CHANGE_EVENT,
} from "@meuqr/shared";
import type { LocaleBundle } from "@meuqr/shared";

// =============================================================================
// Context
// =============================================================================

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languageOptions: { code: Language; label: string; nativeName: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface I18nProviderProps {
  children: React.ReactNode;
  initialLang?: Language;
}

export function I18nProvider({ children, initialLang }: I18nProviderProps) {
  const [lang, setLangState] = useState<Language>(initialLang || getSavedLanguage());
  const bundles: Partial<Record<Language, LocaleBundle>> = LOCALE_BUNDLES;

  // Listen for language changes from other tabs
  useEffect(() => {
    const handler = () => {
      const saved = getSavedLanguage();
      if (saved !== lang) {
        setLangState(saved);
      }
    };
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handler);
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    saveLanguage(newLang);
  }, []);

  // Translation function — supports dotted notation: t("section.key")
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      function lookup(bundle: LocaleBundle): string | null {
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

        // Fallback: search all sections
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

      // Try current language
      const bundle = bundles[lang];
      if (bundle) {
        const result = lookup(bundle);
        if (result !== null) return result;
      }

      // Fallback to pt-BR
      if (lang !== DEFAULT_LANGUAGE) {
        const fbBundle = bundles[DEFAULT_LANGUAGE];
        if (fbBundle) {
          const result = lookup(fbBundle);
          if (result !== null) return result;
        }
      }

      return key;
    },
    [lang, bundles]
  );

  const value: I18nContextType = {
    lang,
    setLang,
    t,
    languageOptions: SUPPORTED_LANGUAGES.map((code) => ({
      code,
      label: LANGUAGE_INFO[code].label,
      nativeName: LANGUAGE_INFO[code].nativeName,
      flag: LANGUAGE_INFO[code].flag,
    })),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useTranslation(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
