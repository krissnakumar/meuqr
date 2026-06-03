"use client";

import { Star } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  date: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  // Fallback default reviews if none are provided
  const list = reviews.length > 0 ? reviews : [
    {
      id: "1",
      customerName: "Mariana Costa",
      rating: 5,
      comment: "Atendimento excelente! Super profissionais, pontuais e atenciosos. Recomendo com certeza.",
      date: "Há 1 semana",
    },
    {
      id: "2",
      customerName: "Carlos Eduardo",
      rating: 5,
      comment: "Preço justo, material de alta qualidade e entrega super rápida. Nota dez!",
      date: "Há 2 semanas",
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-[#0F172A] border-l-4 border-indigo-600 pl-2.5">
        Avaliações dos Clientes
      </h2>
      <div className="space-y-3">
        {list.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {item.customerName[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{item.customerName}</h4>
                  <span className="text-[9px] text-[#94A3B8] font-medium">{item.date}</span>
                </div>
              </div>

              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${
                      i < item.rating 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {item.comment && (
              <p className="text-xs text-[#475569] leading-relaxed italic">
                "{item.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
