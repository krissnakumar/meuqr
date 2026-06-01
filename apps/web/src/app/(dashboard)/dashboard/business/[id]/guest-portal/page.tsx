"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  MessageSquare,
  MapPin,
  Sun,
  Phone,
} from "lucide-react";

interface PortalSettings {
  id?: string;
  business_id: string;
  key: string;
  value: any;
}

export default function GuestPortalPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [amenities, setAmenities] = useState("");
  const [localAttractions, setLocalAttractions] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data: settings } = await supabase
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .eq("key", "guest_portal")
        .single();

      if (settings?.value) {
        const val = typeof settings.value === "string" ? JSON.parse(settings.value) : settings.value;
        setWelcomeMessage(val.welcome_message || "");
        setAmenities(val.amenities || "");
        setLocalAttractions(val.local_attractions || "");
        setContactInfo(val.contact_info || "");
      }
    } catch (err) {
      console.error("Failed to load portal settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const value = {
        welcome_message: welcomeMessage,
        amenities,
        local_attractions: localAttractions,
        contact_info: contactInfo,
      };

      const { data: existing } = await supabase
        .from("business_settings")
        .select("id")
        .eq("business_id", businessId)
        .eq("key", "guest_portal")
        .single();

      if (existing) {
        await supabase
          .from("business_settings")
          .update({ value })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("business_settings")
          .insert({ business_id: businessId, key: "guest_portal", value });
      }

      toast.success("Configurações salvas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Portal do Hóspede
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie o portal digital para hóspedes de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <Button
            variant="default"
            onClick={saveSettings}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <GlassCard>
        <GlassCardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Mensagem de Boas-Vindas
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Escreva uma mensagem de boas-vindas para os hóspedes..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Sun className="w-4 h-4 text-indigo-500" />
              Comodidades
            </label>
            <textarea
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="Liste as comodidades disponíveis (Wi-Fi, café da manhã, estacionamento...)"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Atrações Locais
            </label>
            <textarea
              value={localAttractions}
              onChange={(e) => setLocalAttractions(e.target.value)}
              placeholder="Descreva as principais atrações turísticas da região..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Phone className="w-4 h-4 text-indigo-500" />
              Informações de Contato
            </label>
            <textarea
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Telefone, email, endereço e outras informações de contato..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>
        </GlassCardContent>
      </GlassCard>

      {!welcomeMessage && !amenities && !localAttractions && !contactInfo && (
        <GlassCard>
          <GlassCardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Portal do hóspede não configurado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Preencha os campos acima e clique em Salvar para configurar o portal do hóspede.
            </p>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
