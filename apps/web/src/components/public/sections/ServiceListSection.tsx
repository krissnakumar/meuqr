"use client";

import { CalendarCheck, MessageCircle, Clock } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes?: number | null;
  is_available: boolean;
}

interface ServiceListSectionProps {
  title: string;
  items: Service[];
  businessPhone: string | null;
  businessName: string;
  onBookService?: (service: Service) => void;
}

export function ServiceListSection({
  title,
  items,
  businessPhone,
  businessName,
  onBookService,
}: ServiceListSectionProps) {
  if (items.length === 0) return null;

  const handleInquiry = (service: Service) => {
    if (!businessPhone) return;
    const text = encodeURIComponent(
      `Olá! Estou na página do ${businessName} e gostaria de tirar dúvidas sobre o serviço: *${service.name}* (R$ ${service.price?.toFixed(2) || "Preço sob consulta"}).`
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
        {title || "Serviços & Procedimentos"}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#0F172A]">{item.name}</h3>
              {item.description && (
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.duration_minutes && (
                <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-[#94A3B8]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.duration_minutes} min</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end shrink-0 gap-2">
              <span className="text-sm font-black text-indigo-600">
                {item.price ? `R$ ${item.price.toFixed(2)}` : "Consultar"}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleInquiry(item)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="Perguntar no WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                {onBookService && (
                  <button
                    onClick={() => onBookService(item)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Agendar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
