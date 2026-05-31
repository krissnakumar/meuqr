"use client";

import { useEffect, useState } from "react";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Label, ImageUpload, LanguageSelector } from "@meuqr/ui";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const [language, setLanguage] = useState(lang);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business states
  type Business = {
    id: string;
    name: string;
    slug: string;
    category: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
    cep?: string;
  };
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);

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
        setAvatarUrl(profile.avatar_url || "");
      }

      const { data: businessesData } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData.map(biz => ({
          id: biz.id,
          name: biz.name || "",
          slug: biz.slug || "",
          category: biz.category || "restaurante",
          phone: biz.phone || "",
          whatsapp: biz.whatsapp || "",
          address: biz.address || "",
          city: biz.city || "",
          state: biz.state || "",
          cep: "",
        })));
        setExpandedBusinessId(businessesData[0].id);
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
        .update({ full_name: fullName, phone: phone || null, avatar_url: avatarUrl || null })
        .eq("id", user.id);

      if (profileError) {
        toast.error(t("errors.generic"));
        return;
      }

      if (businesses.length > 0) {
        for (const biz of businesses) {
          if (!biz.name?.trim() || !biz.slug?.trim() || !biz.category) {
            toast.error(t("business.mandatory_fields_error") || `Preencha os dados obrigatórios para: ${biz.name || "Novo Negócio"}`);
            return;
          }

          const { error: bizError } = await supabase
            .from("businesses")
            .update({
              name: biz.name,
              slug: biz.slug,
              category: biz.category,
              phone: biz.phone || null,
              whatsapp: biz.whatsapp || null,
              address: biz.address || null,
              city: biz.city || null,
              state: biz.state || null,
            })
            .eq("id", biz.id);

          if (bizError) {
            if (bizError.code === "23505") {
              toast.error(t("business.slug_taken") + ` (${biz.name})`);
            } else {
              toast.error(t("errors.generic"));
            }
            return;
          }
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

  function handleBusinessChange(id: string, field: keyof Business, value: string) {
    setBusinesses(prev => prev.map(biz => biz.id === id ? { ...biz, [field]: value } : biz));
  }

  async function handleCepChange(id: string, cepValue: string) {
    const cleanedCep = cepValue.replace(/\D/g, "").slice(0, 8);
    let displayCep = cleanedCep;
    if (displayCep.length > 5) {
      displayCep = `${displayCep.slice(0, 5)}-${displayCep.slice(5)}`;
    }
    handleBusinessChange(id, "cep", displayCep);

    if (cleanedCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setBusinesses(prev => prev.map(biz => biz.id === id ? {
            ...biz,
            address: data.logradouro || biz.address,
            city: data.localidade || biz.city,
            state: data.uf || biz.state,
          } : biz));
        } else {
          toast.error("CEP não encontrado");
        }
      } catch (err) {
        console.error("Failed to fetch CEP", err);
      }
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
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-32 shrink-0">
                <Label className="text-sm font-medium text-[#0F172A] mb-2 block">Sua Foto</Label>
                <ImageUpload 
                  value={avatarUrl}
                  onChange={(file: File) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                  shape="rounded"
                  label="Upload foto"
                  className="w-24 h-24 sm:w-full sm:h-auto"
                />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
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
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Business Settings Cards */}
        {businesses.length > 0 && (
          <div className="space-y-4 animate-fade-in-up delay-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-[#0F172A]">{t("business.business_profile")}</h2>
            </div>
            {businesses.map((biz) => {
              const isExpanded = expandedBusinessId === biz.id;
              return (
                <GlassCard key={biz.id} className="overflow-hidden transition-all duration-200">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    onClick={() => setExpandedBusinessId(isExpanded ? null : biz.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {biz.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0F172A]">{biz.name || "Novo Negócio"}</h3>
                        <p className="text-xs text-[#64748B]">{biz.slug ? `/${biz.slug}` : "Sem slug"}</p>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-[#64748B]" /> : <ChevronDown className="w-5 h-5 text-[#64748B]" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <GlassCardContent className="space-y-4 p-4 border-t border-[#E2E8F0] bg-white">
                      <div className="space-y-2">
                        <Label htmlFor={`bizName-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.name_label")}</Label>
                        <Input
                          id={`bizName-${biz.id}`}
                          value={biz.name}
                          onChange={(e) => handleBusinessChange(biz.id, "name", e.target.value)}
                          required
                          className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`bizSlug-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.slug_label")}</Label>
                        <div className="flex rounded-xl shadow-sm">
                          <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#E2E8F0] bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] text-[#64748B] text-xs sm:text-sm font-medium">
                            {t("business.slug_prefix")}
                          </span>
                          <Input
                            id={`bizSlug-${biz.id}`}
                            value={biz.slug}
                            onChange={(e) => handleBusinessChange(biz.id, "slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                            className="rounded-l-none border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`bizCategory-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.category_label")}</Label>
                          <select
                            id={`bizCategory-${biz.id}`}
                            value={biz.category}
                            onChange={(e) => handleBusinessChange(biz.id, "category", e.target.value)}
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
                          <Label htmlFor={`bizPhone-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.phone_label")}</Label>
                          <Input
                            id={`bizPhone-${biz.id}`}
                            value={biz.phone}
                            onChange={(e) => handleBusinessChange(biz.id, "phone", e.target.value)}
                            className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`bizWhatsapp-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.whatsapp_label")}</Label>
                        <Input
                          id={`bizWhatsapp-${biz.id}`}
                          value={biz.whatsapp}
                          onChange={(e) => handleBusinessChange(biz.id, "whatsapp", e.target.value)}
                          placeholder="5511999998888"
                          className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`bizCep-${biz.id}`} className="text-sm font-medium text-[#0F172A]">CEP</Label>
                        <Input
                          id={`bizCep-${biz.id}`}
                          value={biz.cep || ""}
                          onChange={(e) => handleCepChange(biz.id, e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`bizAddress-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.address_label")}</Label>
                        <Input
                          id={`bizAddress-${biz.id}`}
                          value={biz.address}
                          onChange={(e) => handleBusinessChange(biz.id, "address", e.target.value)}
                          className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`bizCity-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.city_label")}</Label>
                          <Input
                            id={`bizCity-${biz.id}`}
                            value={biz.city}
                            onChange={(e) => handleBusinessChange(biz.id, "city", e.target.value)}
                            className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`bizState-${biz.id}`} className="text-sm font-medium text-[#0F172A]">{t("business.state_label")}</Label>
                          <Input
                            id={`bizState-${biz.id}`}
                            value={biz.state}
                            onChange={(e) => handleBusinessChange(biz.id, "state", e.target.value.toUpperCase())}
                            maxLength={2}
                            placeholder="SP"
                            className="border-[#E2E8F0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl"
                          />
                        </div>
                      </div>
                    </GlassCardContent>
                  )}
                </GlassCard>
              );
            })}
          </div>
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

      {/* Language Selection */}
      <GlassCard className="animate-fade-in-up delay-1 relative z-50">
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
          <div className="mt-2">
            <LanguageSelector 
              currentLang={language as any} 
              onLanguageChange={handleLanguageChange} 
              size="lg" 
              className="w-full sm:w-64" 
            />
          </div>
        </GlassCardContent>
      </GlassCard>

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
