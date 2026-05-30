"use client";

import { useEffect, useState } from "react";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  LogOut,
  Mail,
  Languages,
  User,
  Settings2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const [language, setLanguage] = useState(lang);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business states
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [bizName, setBizName] = useState("");
  const [bizSlug, setBizSlug] = useState("");
  const [bizCategory, setBizCategory] = useState("restaurante");
  const [bizPhone, setBizPhone] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizCity, setBizCity] = useState("");
  const [bizState, setBizState] = useState("");

  useEffect(() => {
    loadProfileAndBusiness();
  }, []);

  async function loadProfileAndBusiness() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }

      const { data: businesses } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (businesses && businesses.length > 0) {
        const biz = businesses[0];
        setBusinessId(biz.id);
        setBizName(biz.name || "");
        setBizSlug(biz.slug || "");
        setBizCategory(biz.category || "restaurante");
        setBizPhone(biz.phone || "");
        setBizWhatsapp(biz.whatsapp || "");
        setBizAddress(biz.address || "");
        setBizCity(biz.city || "");
        setBizState(biz.state || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("session_expired"));
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: phone || null })
        .eq("id", user.id);

      if (profileError) {
        toast.error(t("errors.generic"));
        return;
      }

      if (businessId) {
        const { error: bizError } = await supabase
          .from("businesses")
          .update({
            name: bizName,
            slug: bizSlug,
            category: bizCategory,
            phone: bizPhone || null,
            whatsapp: bizWhatsapp || null,
            address: bizAddress || null,
            city: bizCity || null,
            state: bizState || null,
          })
          .eq("id", businessId);

        if (bizError) {
          if (bizError.code === "23505") {
            toast.error(t("business.slug_taken"));
          } else {
            toast.error(t("errors.generic"));
          }
          return;
        }
      }

      toast.success(t("success.saved"));
    } catch (err) {
      console.error(err);
      toast.error(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    toast.success(t("auth.logout_success"));
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-[#64748B]">Carregando configurações...</p>
      </div>
    );
  }

  function handleLanguageChange(code: string) {
    const langCode = code === "pt" ? "pt-BR" : code as "pt-BR" | "en" | "es";
    setLanguage(langCode);
    setLang(langCode);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Settings2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{t("dashboard.settings")}</h1>
            <p className="text-sm text-[#64748B] mt-0.5">{t("common.my_account")}</p>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <GlassCard className="animate-fade-in-up delay-1">
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Languages className="w-4 h-4 text-indigo-600" />
            </div>
            <GlassCardTitle className="text-lg">{t("common.language")}</GlassCardTitle>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm text-[#64748B] mb-4">{t("common.language")}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: "pt-BR", label: "Português", flag: "🇧🇷" },
              { code: "en", label: "English", flag: "🇺🇸" },
              { code: "es", label: "Español", flag: "🇪🇸" },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLanguageChange(l.code)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                  language === l.code
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B] bg-white hover:shadow-sm"
                }`}
              >
                <span className="text-2xl mb-1">{l.flag}</span>
                <span className="text-sm font-medium">{l.label}</span>
              </button>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Profile & Business Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <GlassCard className="animate-fade-in-up delay-2">
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <GlassCardTitle className="text-lg">Perfil do Usuário</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0F172A]">{t("auth.email_label")}</Label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] text-sm text-[#64748B] border border-[#E2E8F0]">
                <Mail className="w-4 h-4 text-[#94A3B8]" />
                {email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#0F172A]">{t("auth.name_label")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-[#0F172A]">{t("common.phone")}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
              />
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Business Settings Card */}
        {businessId && (
          <GlassCard className="animate-fade-in-up delay-3">
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                </div>
                <GlassCardTitle className="text-lg">{t("business.business_profile")}</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bizName" className="text-sm font-medium text-[#0F172A]">{t("business.name_label")}</Label>
                <Input
                  id="bizName"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                  className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizSlug" className="text-sm font-medium text-[#0F172A]">{t("business.slug_label")}</Label>
                <div className="flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#E2E8F0] bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] text-[#64748B] text-xs sm:text-sm font-medium">
                    {t("business.slug_prefix")}
                  </span>
                  <Input
                    id="bizSlug"
                    value={bizSlug}
                    onChange={(e) => setBizSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="rounded-l-none border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bizCategory" className="text-sm font-medium text-[#0F172A]">{t("business.category_label")}</Label>
                  <select
                    id="bizCategory"
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm"
                  >
                    <option value="restaurant">Restaurante</option>
                    <option value="pizzeria">Pizzaria</option>
                    <option value="burger_shop">Hamburgueria</option>
                    <option value="bakery">Padaria</option>
                    <option value="coffee_shop">Cafeteria</option>
                    <option value="bar_pub">Bar</option>
                    <option value="construction_materials">Construção</option>
                    <option value="hardware_store">Ferramentas</option>
                    <option value="clothing_store">Vestuário</option>
                    <option value="salon">Salão</option>
                    <option value="pet_shop">Pet Shop</option>
                    <option value="hotel">Hotel</option>
                    <option value="real_estate">Imobiliária</option>
                    <option value="auto_repair">Oficina</option>
                    <option value="supermarket">Mercado</option>
                    <option value="school">Escola</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="pharmacy">Farmácia</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizPhone" className="text-sm font-medium text-[#0F172A]">{t("business.phone_label")}</Label>
                  <Input
                    id="bizPhone"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizWhatsapp" className="text-sm font-medium text-[#0F172A]">{t("business.whatsapp_label")}</Label>
                <Input
                  id="bizWhatsapp"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  placeholder="5511999998888"
                  className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizAddress" className="text-sm font-medium text-[#0F172A]">{t("business.address_label")}</Label>
                <Input
                  id="bizAddress"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bizCity" className="text-sm font-medium text-[#0F172A]">{t("business.city_label")}</Label>
                  <Input
                    id="bizCity"
                    value={bizCity}
                    onChange={(e) => setBizCity(e.target.value)}
                    className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bizState" className="text-sm font-medium text-[#0F172A]">{t("business.state_label")}</Label>
                  <Input
                    id="bizState"
                    value={bizState}
                    onChange={(e) => setBizState(e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="SP"
                    className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                  />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <Button
          type="submit"
          variant="default"
          className="w-full h-12 animate-fade-in-up delay-4 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {t("common.save")}
        </Button>
      </form>

      {/* Danger Zone / Logout */}
      <GlassCard className="animate-fade-in-up delay-5 border border-red-200/50 bg-gradient-to-br from-red-50/30 to-transparent">
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <GlassCardTitle className="text-lg text-red-700">{t("auth.logout_title")}</GlassCardTitle>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm text-[#64748B] mb-4">
            {t("auth.logout_desc")}
          </p>
          <Button
            variant="destructive"
            onClick={handleLogout}
            type="button"
            className="shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("auth.logout_btn")}
          </Button>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
