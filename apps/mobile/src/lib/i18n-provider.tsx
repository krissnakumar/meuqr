import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@meuqr/shared";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LANGUAGE_INFO,
  t as translate,
} from "@meuqr/shared";
import { supabase } from "./supabase";

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
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  // Load user's language preference from profile
  useEffect(() => {
    loadUserLanguage();
  }, []);

  async function loadUserLanguage() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", user.id)
        .single();

      if (profile?.language && SUPPORTED_LANGUAGES.includes(profile.language as Language)) {
        setLangState(profile.language as Language);
      }
    } catch {
      // Fall back to default language
    }
  }

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translate(key, lang, params);
    },
    [lang]
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
