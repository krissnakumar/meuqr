"use client";

import { MessageCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  is_available: boolean;
}

interface ProductGridSectionProps {
  title: string;
  items: Product[];
  businessPhone: string | null;
  businessName: string;
  onSelectItem?: (product: Product) => void;
  hideTitle?: boolean;
}

export function ProductGridSection({
  title,
  items,
  businessPhone,
  businessName,
  onSelectItem,
  hideTitle = false,
}: ProductGridSectionProps) {
  if (items.length === 0) return null;

  const handleInquiry = (product: Product) => {
    if (!businessPhone) return;
    const text = encodeURIComponent(
      `Olá! Estou na página do ${businessName} e gostaria de saber mais sobre o produto: *${product.name}* (R$ ${product.price?.toFixed(2) || "Preço sob consulta"}).`
    );
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clickType: "whatsapp" }),
    }).catch(() => {});

    window.open(`https://wa.me/${businessPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {!hideTitle && (
        <h2 className="text-lg font-black text-[#0F172A] border-l-4 border-indigo-600 pl-2.5">
          {title || "Produtos"}
        </h2>
      )}

      <div className="space-y-2.5">
        {items.map((item) => {
          const isOffer = item.original_price && item.price && item.original_price > item.price;

          return (
            <article
              key={item.id}
              className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)] cursor-pointer"
              onClick={() => onSelectItem?.(item)}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Sem imagem
                  </div>
                )}

                {isOffer && (
                  <div className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                    Oferta
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#0F172A]">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#64748B]">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInquiry(item);
                    }}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                    title="Perguntar no WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="flex flex-col">
                    {isOffer && (
                      <span className="text-[10px] text-[#94A3B8] line-through">
                        R$ {item.original_price?.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-black text-indigo-600">
                      {item.price ? `R$ ${item.price.toFixed(2)}` : "Consultar"}
                    </span>
                  </div>

                  {!item.is_available && (
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      Indisponível
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
