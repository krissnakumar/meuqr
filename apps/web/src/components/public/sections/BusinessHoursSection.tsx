"use client";

import { Clock } from "lucide-react";

interface BusinessHoursSectionProps {
  hours: Record<string, string> | null;
}

const DAYS_MAP: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function BusinessHoursSection({ hours }: BusinessHoursSectionProps) {
  const defaultHours: Record<string, string> = {
    segunda: "08:00 - 18:00",
    terca: "08:00 - 18:00",
    quarta: "08:00 - 18:00",
    quinta: "08:00 - 18:00",
    sexta: "08:00 - 18:00",
    sabado: "08:00 - 12:00",
    domingo: "Fechado",
  };

  const activeHours = hours || defaultHours;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Horário de Funcionamento</h3>
          <p className="text-[10px] text-[#64748B]">Confira nossos dias e horários de atendimento.</p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(DAYS_MAP).map(([key, label]) => {
          const val = activeHours[key] || "Fechado";
          const isClosed = val.toLowerCase().includes("fechado");

          return (
            <div 
              key={key} 
              className="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0"
            >
              <span className="font-medium text-[#475569]">{label}</span>
              <span className={`font-semibold ${isClosed ? "text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-[10px]" : "text-[#0F172A]"}`}>
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
