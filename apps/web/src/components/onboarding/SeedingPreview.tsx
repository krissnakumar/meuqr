"use client";

import { useState } from "react";
import { Plus, Trash2, Package, Wrench, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { SampleProduct } from "@meuqr/shared";

interface SeedingPreviewProps {
  vertical: string;
  items: SampleProduct[];
  onChange: (items: SampleProduct[]) => void;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(raw: string): number {
  // Accept "1.234,56" or "1234.56" or "49,90"
  const cleaned = raw.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function SeedingPreview({
  vertical,
  items,
  onChange,
  onBack,
  onConfirm,
  submitting,
}: SeedingPreviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [priceInputs, setPriceInputs] = useState<string[]>(
    items.map((i) => formatBRL(i.price))
  );

  const updateItem = (index: number, patch: Partial<SampleProduct>) => {
    const updated = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    const updatedPrices = priceInputs.filter((_, i) => i !== index);
    onChange(updated);
    setPriceInputs(updatedPrices);
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const addItem = () => {
    const newItem: SampleProduct = {
      name: "Novo Item",
      description: "Descrição do produto ou serviço.",
      price: 0,
      itemType: "product",
    };
    onChange([...items, newItem]);
    setPriceInputs([...priceInputs, "0,00"]);
    setExpandedIndex(items.length);
  };

  const handlePriceBlur = (index: number, raw: string) => {
    const parsed = parseBRL(raw);
    const formatted = formatBRL(parsed);
    const updatedPrices = priceInputs.map((p, i) => (i === index ? formatted : p));
    setPriceInputs(updatedPrices);
    updateItem(index, { price: parsed });
  };

  const handlePriceChange = (index: number, val: string) => {
    const updatedPrices = priceInputs.map((p, i) => (i === index ? val : p));
    setPriceInputs(updatedPrices);
  };

  const isProduct = (type: string) => type === "product";

  return (
    <div className="space-y-5">
      {/* Header hint */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
        <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Estes são os itens de demonstração que criaremos no seu catálogo.{" "}
          <strong>Edite, remova ou adicione</strong> conforme sua realidade — você pode alterar depois também.
        </p>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isOpen = expandedIndex === index;
          const Icon = isProduct(item.itemType) ? Package : Wrench;

          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-indigo-300 shadow-sm shadow-indigo-100"
                  : "border-[#E2E8F0] bg-white hover:border-indigo-200"
              }`}
            >
              {/* Row header */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
                  isOpen ? "bg-indigo-50/60" : "bg-white"
                }`}
                onClick={() => setExpandedIndex(isOpen ? null : index)}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isProduct(item.itemType)
                      ? "bg-blue-100 text-blue-600"
                      : "bg-violet-100 text-violet-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{item.name || "Item sem nome"}</p>
                  <p className="text-xs text-[#64748B]">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold mr-1 ${
                        isProduct(item.itemType)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {isProduct(item.itemType) ? "Produto" : "Serviço"}
                    </span>
                    R$ {priceInputs[index] ?? formatBRL(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </div>
              </div>

              {/* Expanded edit form */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-indigo-100 pt-3 bg-white">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Nome</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      placeholder="Nome do item"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Descrição</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                      placeholder="Breve descrição do item"
                    />
                  </div>

                  {/* Price + Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Preço (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] font-medium">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={priceInputs[index] ?? ""}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          onBlur={(e) => handlePriceBlur(index, e.target.value)}
                          className="w-full h-10 pl-8 pr-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Tipo</label>
                      <select
                        value={item.itemType}
                        onChange={(e) => updateItem(index, { itemType: e.target.value as "product" | "service" })}
                        className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      >
                        <option value="product">Produto</option>
                        <option value="service">Serviço</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add item */}
      {items.length < 10 && (
        <button
          type="button"
          onClick={addItem}
          className="w-full h-11 rounded-2xl border-2 border-dashed border-[#CBD5E1] text-sm font-medium text-[#64748B] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar item
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting || items.length === 0}
          className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? "Criando Workspace..." : `Confirmar e Criar (${items.length} ${items.length === 1 ? "item" : "itens"})`}
        </button>
      </div>
    </div>
  );
}
