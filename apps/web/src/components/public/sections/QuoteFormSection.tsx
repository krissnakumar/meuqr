"use client";

import { useState } from "react";
import { ClipboardList, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteFormSectionProps {
  businessId: string;
  pageId: string | null;
  businessName: string;
}

export function QuoteFormSection({ businessId, pageId, businessName }: QuoteFormSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
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
      toast.error("Por favor, insira um telefone válido com DDD.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          pageId,
          customerName: name.trim(),
          customerPhone: cleanPhone,
          message: message.trim(),
          items: [], // Empty items for simple lead form
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar solicitação.");
      }

      setSuccess(true);
      toast.success("Solicitação de orçamento enviada com sucesso!");
      
      // Track event
      fetch("/api/track/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clickType: "quote" }),
      }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Não foi possível enviar o orçamento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm space-y-3 animate-fade-in">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-base font-bold text-[#0F172A]">Orçamento Solicitado!</h3>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
          Sua mensagem foi entregue à equipe do <strong>{businessName}</strong>. Entraremos em contato em breve pelo WhatsApp.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setName("");
            setPhone("");
            setMessage("");
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-2"
        >
          Enviar Outro Pedido
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <ClipboardList className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Solicitar Orçamento</h3>
          <p className="text-[10px] text-[#64748B]">Preencha os dados e receba uma cotação rápida.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Seu Nome
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
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

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Quais itens ou serviços você precisa?
          </label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Descreva aqui o que precisa para fazermos seu orçamento..."
            className="w-full p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-inner resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? "Enviando..." : "Enviar Solicitação"}</span>
        </button>
      </form>
    </div>
  );
}
