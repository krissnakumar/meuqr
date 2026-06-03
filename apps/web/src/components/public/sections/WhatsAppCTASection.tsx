"use client";

import { MessageCircle, ArrowRight } from "lucide-react";

interface WhatsAppCTASectionProps {
  businessPhone: string | null;
  businessName: string;
}

export function WhatsAppCTASection({ businessPhone, businessName }: WhatsAppCTASectionProps) {
  if (!businessPhone) return null;

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      `Olá! Estou visitando a página do ${businessName} e gostaria de iniciar um atendimento.`
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
    <div 
      onClick={handleWhatsAppClick}
      className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase opacity-90">Atendimento Rápido</span>
        </div>
        <h3 className="text-base sm:text-lg font-black mt-2 leading-tight">
          Fale Conosco via WhatsApp
        </h3>
        <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-sm">
          Tire dúvidas, faça perguntas sobre produtos/serviços ou solicite suporte imediato.
        </p>
      </div>

      <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
        <ArrowRight className="w-5 h-5" />
      </div>
    </div>
  );
}
