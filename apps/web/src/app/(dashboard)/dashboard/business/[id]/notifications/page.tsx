"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  Bell,
  BellOff,
  ShoppingBag,
  Calendar,
  Star,
  MessageSquare,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    notify_new_order: true,
    notify_new_appointment: true,
    notify_new_review: true,
    notify_new_lead: true,
    notify_low_stock: false,
    push_enabled: true,
    email_enabled: false,
    whatsapp_enabled: false,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, notification_settings")
        .eq("id", businessId)
        .single();

      if (biz) {
        setBusinessName(biz.name);
        if (biz.notification_settings) {
          setSettings((prev) => ({ ...prev, ...biz.notification_settings }));
        }
      }

      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(notifs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSetting(key: keyof typeof settings) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ notification_settings: updated })
        .eq("id", businessId);

      if (error) {
        toast.error("Erro ao salvar configuração");
        setSettings(settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ status: "read" }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );
  }

  const toggleConfigs: { key: keyof typeof settings; label: string; description: string; icon: any }[] = [
    { key: "notify_new_order", label: "Novos pedidos", description: "Receba alertas quando um novo pedido for realizado", icon: ShoppingBag },
    { key: "notify_new_appointment", label: "Novos agendamentos", description: "Receba alertas quando um cliente agendar um horário", icon: Calendar },
    { key: "notify_new_review", label: "Novas avaliações", description: "Receba alertas quando receber uma nova avaliação", icon: Star },
    { key: "notify_new_lead", label: "Novos leads", description: "Receba alertas quando um novo lead for capturado", icon: MessageSquare },
    { key: "notify_low_stock", label: "Estoque baixo", description: "Receba alertas quando itens estiverem com estoque baixo", icon: Package },
  ];

  const channelConfigs: { key: "push_enabled" | "email_enabled" | "whatsapp_enabled"; label: string; description: string }[] = [
    { key: "push_enabled", label: "Notificações Push", description: "Receber notificações no navegador" },
    { key: "email_enabled", label: "Notificações por Email", description: "Receber resumos por email" },
    { key: "whatsapp_enabled", label: "Notificações via WhatsApp", description: "Receber alertas no WhatsApp" },
  ];

  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-indigo-500" : "bg-slate-300"}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando notificações...</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notificações
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-[52px]">
            Configure alertas e notificações do seu negócio{" "}
            <span className="font-semibold text-slate-600">{businessName}</span>.
          </p>
        </div>
      </div>

      {/* Eventos */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            Alertas por Evento
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="divide-y divide-slate-100">
          {toggleConfigs.map((cfg) => {
            const Icon = cfg.icon;
            return (
              <div key={cfg.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{cfg.label}</p>
                    <p className="text-xs text-gray-400">{cfg.description}</p>
                  </div>
                </div>
<Toggle checked={!!settings[cfg.key]} onChange={() => toggleSetting(cfg.key)} />
              </div>
            );
          })}
        </GlassCardContent>
      </GlassCard>

      {/* Canais */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <BellOff className="w-4 h-4 text-indigo-500" />
            Canais de Notificação
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="divide-y divide-slate-100">
          {channelConfigs.map((cfg) => (
            <div key={cfg.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-slate-700">{cfg.label}</p>
                <p className="text-xs text-gray-400">{cfg.description}</p>
              </div>
              <Toggle checked={settings[cfg.key]} onChange={() => toggleSetting(cfg.key)} />
            </div>
          ))}
        </GlassCardContent>
      </GlassCard>

      {/* Histórico */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Histórico Recente
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">Nenhuma notificação recente</p>
              <p className="text-xs text-gray-400 mt-1">As notificações do seu negócio aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => n.status === "unread" && markAsRead(n.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 ${
                    n.status === "unread"
                      ? "bg-indigo-50 border border-indigo-100 hover:bg-indigo-100"
                      : "bg-slate-50 border border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.status === "unread" ? "bg-indigo-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.status === "unread" ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {n.status === "unread" && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
