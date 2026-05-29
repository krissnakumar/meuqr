"use client";

import React, { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES, LANGUAGE_INFO, type Language } from "@meuqr/shared";
import { Globe } from "lucide-react";

export interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: "dropdown" | "minimal" | "flags";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LanguageSelector({
  currentLang,
  onLanguageChange,
  variant = "dropdown",
  size = "sm",
  className = "",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentInfo = LANGUAGE_INFO[currentLang];

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  if (variant === "flags") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {SUPPORTED_LANGUAGES.map((code) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 ${
              code === currentLang ? "ring-2 ring-[#1877F2] scale-110" : "opacity-60 hover:opacity-90"
            }`}
            title={LANGUAGE_INFO[code].nativeName}
          >
            {LANGUAGE_INFO[code].flag}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`} ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center ${sizeClasses[size]} rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors`}
        >
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-700">{currentInfo.flag}</span>
        </button>
        {open && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {SUPPORTED_LANGUAGES.map((code) => {
              const info = LANGUAGE_INFO[code];
              return (
                <button
                  key={code}
                  onClick={() => {
                    onLanguageChange(code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    code === currentLang ? "bg-blue-50 text-[#1877F2] font-medium" : "text-gray-700"
                  }`}
                >
                  <span>{info.flag}</span>
                  <span>{info.nativeName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center ${sizeClasses[size]} rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors`}
      >
        <Globe className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-700">{currentInfo.flag}</span>
        <span className="text-gray-700 font-medium">{currentInfo.nativeName}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {SUPPORTED_LANGUAGES.map((code) => {
            const info = LANGUAGE_INFO[code];
            return (
              <button
                key={code}
                onClick={() => {
                  onLanguageChange(code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  code === currentLang ? "bg-blue-50 text-[#1877F2] font-medium" : "text-gray-700"
                }`}
              >
                <span>{info.flag}</span>
                <div className="flex flex-col items-start">
                  <span>{info.nativeName}</span>
                  <span className="text-xs text-gray-400">{info.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
