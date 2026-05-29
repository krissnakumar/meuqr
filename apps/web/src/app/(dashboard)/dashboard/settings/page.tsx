"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      // Load Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }

      // Load First Business owned by user
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("session_expired"));
        return;
      }

      // Save Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: phone || null })
        .eq("id", user.id);

      if (profileError) {
        toast.error(t("errors.generic"));
        return;
      }

      // Save Business
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  function handleLanguageChange(code: string) {
    const langCode = code === "pt" ? "pt-BR" : code as "pt-BR" | "en" | "es";
    setLanguage(langCode);
    setLang(langCode);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          {t("dashboard.settings")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("common.my_account")}
        </p>
      </div>

      {/* Language Selection Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Languages className="w-5 h-5 text-[#1877F2]" />
          <CardTitle className="text-lg font-bold">{t("common.language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">{t("common.language")}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: "pt-BR", label: t("common.language_pt"), flag: t("common.flag_pt") },
              { code: "en", label: t("common.language_en"), flag: t("common.flag_en") },
              { code: "es", label: t("common.language_es"), flag: t("common.flag_es") },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLanguageChange(l.code)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                  language === l.code
                    ? "border-[#1877F2] bg-[#1877F2]/5 text-[#1877F2] font-semibold"
                    : "border-[#E4E6EB] hover:border-gray-300 text-gray-700 bg-white"
                }`}
              >
                <span className="text-2xl mb-1">{l.flag}</span>
                <span className="text-sm font-medium">{l.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combined Profile & Business Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("business.business_profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("auth.email_label")}</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm text-gray-500 border border-[#E4E6EB]">
                <Mail className="w-4 h-4 text-gray-400" />
                {email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.name_label")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings Card */}
        {businessId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("business.business_profile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bizName">{t("business.name_label")}</Label>
                <Input
                  id="bizName"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizSlug">{t("business.slug_label")}</Label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E4E6EB] bg-gray-50 text-gray-500 text-xs sm:text-sm">
                    {t("business.slug_prefix")}
                  </span>
                  <Input
                    id="bizSlug"
                    value={bizSlug}
                    onChange={(e) => setBizSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bizCategory">{t("business.category_label")}</Label>
                  <select
                    id="bizCategory"
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E6EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="restaurant">{t("categories.restaurant")}</option>
                    <option value="pizzeria">{t("categories.pizzeria")}</option>
                    <option value="burger_shop">{t("categories.burger_shop")}</option>
                    <option value="bakery">{t("categories.bakery")}</option>
                    <option value="coffee_shop">{t("categories.coffee_shop")}</option>
                    <option value="bar_pub">{t("categories.bar_pub")}</option>
                    <option value="construction_materials">{t("categories.construction_materials")}</option>
                    <option value="hardware_store">{t("categories.hardware_store")}</option>
                    <option value="clothing_store">{t("categories.clothing_store")}</option>
                    <option value="salon">{t("categories.salon")}</option>
                    <option value="pet_shop">{t("categories.pet_shop")}</option>
                    <option value="hotel">{t("categories.hotel")}</option>
                    <option value="real_estate">{t("categories.real_estate")}</option>
                    <option value="auto_repair">{t("categories.auto_repair")}</option>
                    <option value="supermarket">{t("categories.supermarket")}</option>
                    <option value="school">{t("categories.school")}</option>
                    <option value="freelancer">{t("categories.freelancer")}</option>
                    <option value="pharmacy">{t("categories.pharmacy")}</option>
                    <option value="other">{t("categories.other")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizPhone">{t("business.phone_label")}</Label>
                  <Input
                    id="bizPhone"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizWhatsapp">{t("business.whatsapp_label")}</Label>
                <Input
                  id="bizWhatsapp"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizAddress">{t("business.address_label")}</Label>
                <Input
                  id="bizAddress"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bizCity">{t("business.city_label")}</Label>
                  <Input
                    id="bizCity"
                    value={bizCity}
                    onChange={(e) => setBizCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizState">{t("business.state_label")}</Label>
                  <Input
                    id="bizState"
                    value={bizState}
                    onChange={(e) => setBizState(e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" variant="default" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t("common.save")}
        </Button>
      </form>

      {/* Danger Zone / Logout Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600 font-bold">{t("auth.logout_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {t("auth.logout_desc")}
          </p>
          <Button
            variant="destructive"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("auth.logout_btn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
