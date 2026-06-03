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
  hideTitle?: boolean;
}

export function ServiceListSection({
  title,
  items,
  businessPhone,
  businessName,
  onBookService,
  hideTitle = false,
}: ServiceListSectionProps) {
  if (items.length === 0) return null;

  const handleInquiry = (service: Service) => {
    if (!businessPhone) return;
    const text = encodeURIComponent(
      `Olá! Estou na página do ${businessName} e gostaria de tirar dúvidas sobre o serviço: *${service.name}* (R$ ${service.price?.toFixed(2) || "Preço sob consulta"}).`
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
          {title || "Serviços & Procedimentos"}
        </h2>
      )}

      <div className="space-y-2.5">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          >
            <div className="flex min-h-20 min-w-0 flex-1 flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{item.name}</h3>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#64748B]">
                    {item.description}
                  </p>
                )}
              </div>

              {item.duration_minutes && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#94A3B8]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{item.duration_minutes} min</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-sm font-black text-indigo-600">
                {item.price ? `R$ ${item.price.toFixed(2)}` : "Consultar"}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleInquiry(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                  title="Perguntar no WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                {onBookService && (
                  <button
                    onClick={() => onBookService(item)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
                  >
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Agendar</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
