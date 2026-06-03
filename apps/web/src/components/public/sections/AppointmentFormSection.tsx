"use client";

import { useState } from "react";
import { Calendar, Clock, User, Phone, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number | null;
}

interface AppointmentFormSectionProps {
  businessId: string;
  services: Service[];
  businessName: string;
}

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30"];

export function AppointmentFormSection({
  businessId,
  services,
  businessName,
}: AppointmentFormSectionProps) {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatPhone = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Insira um número de telefone com DDD válido.");
      return;
    }

    if (!selectedServiceId && services.length > 0) {
      toast.error("Por favor, selecione um serviço.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          serviceId: selectedServiceId || services[0]?.id || "default",
          customerName: name.trim(),
          customerPhone: cleanPhone,
          appointmentDate: date,
          startTime: time,
          endTime: time, // Same slot for simplicity
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao realizar o agendamento.");
      }

      setSuccess(true);
      toast.success("Horário agendado com sucesso!");
      
      // Track event
      fetch("/api/track/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clickType: "whatsapp" }),
      }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Não foi possível agendar o horário.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm space-y-3 animate-fade-in">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-base font-bold text-[#0F172A]">Agendamento Confirmado!</h3>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
          Seu horário em <strong>{businessName}</strong> foi reservado para o dia <strong>{date.split("-").reverse().join("/")}</strong> às <strong>{time}</strong>. Aguarde contato de confirmação.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSelectedServiceId("");
            setDate("");
            setTime("");
            setName("");
            setPhone("");
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-2"
        >
          Agendar Outro Horário
        </button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Agendar um Horário</h3>
          <p className="text-[10px] text-[#64748B]">Escolha o dia, horário e preencha seus dados.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {services.length > 0 && (
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Serviço desejado
            </label>
            <select
              required
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
            >
              <option value="" disabled>Selecione o serviço</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.price ? `(R$ ${s.price.toFixed(2)})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Data
            </label>
            <input
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Horário
            </label>
            <select
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
            >
              <option value="" disabled>Selecione</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Seu Nome
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ana Souza"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Seu WhatsApp
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Ex: (11) 99999-9999"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? "Enviando..." : "Confirmar Agendamento"}</span>
        </button>
      </form>
    </div>
  );
}
