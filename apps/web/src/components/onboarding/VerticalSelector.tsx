"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, Store, Hammer, HeartPulse, Sparkles, Briefcase, Home, Hotel, ShoppingBag, Car, BookOpen } from "lucide-react";
import { VERTICALS_CONFIG, VerticalConfig } from "@meuqr/shared";
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardTitle } from "@meuqr/ui";

const VERTICAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  food_beverage: Store,
  construction: Hammer,
  health: HeartPulse,
  beauty_wellness: Sparkles,
  professional_services: Briefcase,
  real_estate: Home,
  hotels_tourism: Hotel,
  retail: ShoppingBag,
  automotive: Car,
  education: BookOpen,
};

interface VerticalSelectorProps {
  selectedVertical: string;
  onSelect: (verticalSlug: string) => void;
}

export function VerticalSelector({ selectedVertical, onSelect }: VerticalSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const verticalKeys = useMemo(() => Object.keys(VERTICALS_CONFIG), []);

  const filteredVerticals = useMemo(() => {
    if (!searchQuery) return verticalKeys;
    const q = searchQuery.toLowerCase();
    return verticalKeys.filter((key) => {
      const v = VERTICALS_CONFIG[key];
      return (
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, verticalKeys]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar categoria de negócio..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
        />
      </div>

      {/* Grid of options */}
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-1">
        {filteredVerticals.map((key) => {
          const v = VERTICALS_CONFIG[key];
          const Icon = VERTICAL_ICONS[key] || Store;
          const isSelected = selectedVertical === key;

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              type="button"
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                  : "border-[#E2E8F0] bg-white hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-indigo-100 text-indigo-600 scale-110"
                  : "bg-gradient-to-br from-slate-50 to-slate-100 text-[#64748B] border border-[#E2E8F0]"
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-[#0F172A]"}`}>
                  {v.name}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{v.description}</p>
              </div>
              <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? "text-indigo-500" : "text-[#CBD5E1]"}`} />
            </button>
          );
        })}

        {filteredVerticals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#64748B]">Nenhuma categoria encontrada para "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
