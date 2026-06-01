"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  Phone,
  Save,
  MessageSquare,
  Send,
  TrendingUp,
  Bot,
} from "lucide-react";

export default function WhatsAppPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const [autoReply, setAutoReply] = useState(false);
  const [autoReplyText, setAutoReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    totalConversations: 0,
    messagesSent: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, whatsapp")
        .eq("id", businessId)
        .single();

      if (biz) {
        setBusinessName(biz.name);
        if (biz.whatsapp) setPhoneNumber(biz.whatsapp);
      }

      const { data: settings } = await supabase
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .eq("key", "whatsapp")
        .single();

      if (settings?.value) {
        const cfg = settings.value;
        if (cfg.default_message) setDefaultMessage(cfg.default_message);
        if (cfg.auto_reply !== undefined) setAutoReply(cfg.auto_reply);
        if (cfg.auto_reply_text) setAutoReplyText(cfg.auto_reply_text);
      }

      const { count: clicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .eq("click_type", "whatsapp");

      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("business_id", businessId);

      const qrIds = qrCodes?.map((q) => q.id) || [];
      let clickCount = 0;
      if (qrIds.length > 0) {
        const { count: qrClicks } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true })
          .in("qr_code_id", qrIds)
          .eq("click_type", "whatsapp");
        clickCount = qrClicks || 0;
      }

      const { count: inboxItems } = await supabase
        .from("inbox_items")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      setStats({
        totalConversations: inboxItems || 0,
        messagesSent: clickCount,
        conversionRate: clickCount > 0 ? Math.round((inboxItems || 0) / clickCount * 100) : 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!phoneNumber.trim()) {
      toast.error("Informe o número de WhatsApp");
      return;
    }
    setSaving(true);
    try {
      await supabase
        .from("businesses")
        .update({ whatsapp: phoneNumber.trim() })
        .eq("id", businessId);

      const payload = {
        key: "whatsapp",
        value: {
          default_message: defaultMessage,
          auto_reply: autoReply,
          auto_reply_text: autoReplyText,
        },
      };

      const { data: existing } = await supabase
        .from("business_settings")
        .select("id")
        .eq("business_id", businessId)
        .eq("key", "whatsapp")
        .single();

      if (existing) {
        await supabase
          .from("business_settings")
          .update(payload)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("business_settings")
          .insert({ ...payload, business_id: businessId });
      }

      toast.success("Configurações salvas!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10 animate-fade-in-up">
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            WhatsApp
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-[52px]">
            Configure mensagens automáticas e ações do WhatsApp{" "}
            <span className="font-semibold text-slate-600">{businessName}</span>.
          </p>
        </div>
      </div>

      {/* Configuração */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            Configuração
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Número do WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="5511999999999"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-400">Código do país + DDD + número (apenas dígitos)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Mensagem padrão</label>
            <textarea
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              placeholder="Olá! Vi seu catálogo e gostaria de mais informações."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Resposta automática</p>
                <p className="text-xs text-gray-400">Enviar mensagem automática ao receber uma mensagem</p>
              </div>
            </div>
            <button
              onClick={() => setAutoReply(!autoReply)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoReply ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoReply ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {autoReply && (
            <div className="space-y-1.5 pl-4 border-l-2 border-emerald-200">
              <label className="text-xs font-semibold text-gray-500">Texto da resposta automática</label>
              <textarea
                value={autoReplyText}
                onChange={(e) => setAutoReplyText(e.target.value)}
                placeholder="Olá! Obrigado pelo contato. Em breve retornaremos."
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
              />
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Estatísticas */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Estatísticas
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Conversas", value: stats.totalConversations, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Mensagens Enviadas", value: stats.messagesSent, icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Taxa de Conversão", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((stat) => (
              <GlassCard key={stat.label} className="border border-slate-100">
                <GlassCardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                    <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
