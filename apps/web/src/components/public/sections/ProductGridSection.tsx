"use client";

import { ShoppingCart, MessageCircle } from "lucide-react";

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
}

export function ProductGridSection({
  title,
  items,
  businessPhone,
  businessName,
  onSelectItem,
}: ProductGridSectionProps) {
  if (items.length === 0) return null;

  const handleInquiry = (product: Product) => {
    if (!businessPhone) return;
    const text = encodeURIComponent(
      `Olá! Estou na página do ${businessName} e gostaria de saber mais sobre o produto: *${product.name}* (R$ ${product.price?.toFixed(2) || "Preço sob consulta"}).`
    );
    // Track click event
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clickType: "whatsapp" }),
    }).catch(() => {});

    window.open(`https://wa.me/${businessPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-[#0F172A] border-l-4 border-indigo-600 pl-2.5">
        {title || "Produtos"}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectItem?.(item)}
          >
            {/* Image */}
            <div className="h-32 bg-slate-50 relative overflow-hidden flex items-center justify-center">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#CBD5E1] text-xs">Sem Imagem</span>
              )}
              {item.original_price && item.price && item.original_price > item.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Oferta
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] line-clamp-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-[10px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-1.5">
                <div className="flex flex-col">
                  {item.original_price && item.price && item.original_price > item.price && (
                    <span className="text-[10px] text-[#94A3B8] line-through">
                      R$ {item.original_price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-black text-indigo-600">
                    {item.price ? `R$ ${item.price.toFixed(2)}` : "Consultar"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInquiry(item);
                  }}
                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                  title="Perguntar no WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
