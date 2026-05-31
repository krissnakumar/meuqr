"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { getAllBusinessTemplates, type BusinessTemplate, resolveText, type LocalizedString } from "@meuqr/shared";
import { useTranslation } from "@/lib/i18n-provider";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Store,
  Layout,
  Sparkles,
  CalendarDays,
  FileText,
  Users,
  Utensils,
  HeartPulse,
  Wrench,
  Building,
  GraduationCap,
  PartyPopper,
  PawPrint
} from "lucide-react";
import Link from "next/link";

export default function BusinessSetupPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const { t } = useTranslation();
  const [business, setBusiness] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [step, setStep] = useState<"categories" | "templates" | "done">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: existingPages } = await supabase
        .from("pages")
        .select("id, title, slug, is_published")
        .eq("business_id", businessId);

      setBusiness(biz);
      setPages(existingPages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function rt(text: LocalizedString): string {
    const lang = business?.default_language || "pt-BR";
    return resolveText(text, lang as any);
  }

  const categoryMap: Record<string, string[]> = {
    food: ["restaurant", "pizzeria", "burger_shop", "bakery", "coffee_shop", "acai_sorveteria", "bar_pub", "food_truck"],
    retail: ["construction_materials", "hardware_store", "paint_store", "electrical_supplies", "plumbing_supplies", "furniture_store", "clothing_store", "shoe_store", "cosmetics_store", "supermarket", "cellphone_store", "florist", "pharmacy", "pet_shop"],
    health: ["medical_clinic", "dental_clinic", "physiotherapy", "salon", "barber_shop", "nail_studio", "spa", "gym", "veterinary"],
    services: ["auto_repair", "motorcycle_repair", "car_wash", "cleaning_services", "laundry", "electronics_repair", "print_shop", "delivery_business", "freelancer", "photographer"],
    real_estate: ["real_estate", "car_dealership"],
    education: ["school", "daycare", "church"],
    events: ["event", "party_rental", "hotel", "travel_agency"]
  };

  const allTemplates = getAllBusinessTemplates();

  const recommendedTemplates = allTemplates.filter(
    (t) => selectedCategory ? categoryMap[selectedCategory]?.includes(t.businessType) : t.businessType === business?.category
  );

  function templateSlug(template: BusinessTemplate): string {
    return template.id.replace(/^tmpl-\d+-/, "");
  }

  function sectionSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function cloneTemplate(template: BusinessTemplate) {
    setCloning(true);
    try {
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: rt(template.pageTitle || template.name),
          slug: templateSlug(template),
          is_published: true,
          seo_title: `${business?.name} - ${rt(template.name)}`,
          seo_description: rt(template.description),
        })
        .select()
        .single();

      if (pageError) throw pageError;

      for (let i = 0; i < template.sections.length; i++) {
        const section = template.sections[i];

        const { data: newSection, error: secError } = await supabase
          .from("sections")
          .insert({
            page_id: page.id,
            name: rt(section.title),
            slug: sectionSlug(rt(section.title)),
            section_type: section.sectionType || null,
            sort_order: i,
          })
          .select()
          .single();

        if (secError) throw secError;

        if (section.items.length > 0) {
          const itemsToInsert = section.items.map((item, idx) => ({
            section_id: newSection.id,
            name: rt(item.name),
            description: item.description ? rt(item.description) : null,
            price: item.price || null,
            image_url: item.image || null,
            sort_order: idx,
          }));

          const { error: itemsError } = await supabase
            .from("items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      const shortCode = generateShortCode();
      await supabase.from("qr_codes").insert({
        business_id: businessId,
        page_id: page.id,
        short_code: shortCode,
        title: `${business?.name} - ${rt(template.name)}`,
      });

      setStep("done");
    } catch (err: any) {
      console.error("Error cloning template:", err);
      alert(t("business.page_create_error"));
    } finally {
      setCloning(false);
    }
  }

  function generateShortCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t("business.setup_loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("common.back")}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Store className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{business?.name}</h1>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            {t("business.setup_initial")}
          </p>
        </div>
      </div>

      {step === "categories" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">
            Qual é a categoria do seu negócio?
          </h2>
          <p className="text-sm text-gray-500">
            Escolha uma categoria para vermos os templates mais adequados.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "food", name: "Alimentação & Restaurantes", icon: <Utensils className="w-6 h-6" />, color: "bg-red-50 text-red-600 group-hover:bg-red-600" },
              { id: "retail", name: "Varejo & Lojas", icon: <Store className="w-6 h-6" />, color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600" },
              { id: "health", name: "Saúde & Beleza", icon: <HeartPulse className="w-6 h-6" />, color: "bg-pink-50 text-pink-600 group-hover:bg-pink-600" },
              { id: "services", name: "Serviços & Manutenção", icon: <Wrench className="w-6 h-6" />, color: "bg-orange-50 text-orange-600 group-hover:bg-orange-600" },
              { id: "real_estate", name: "Imóveis & Veículos", icon: <Building className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600" },
              { id: "education", name: "Educação & Institucional", icon: <GraduationCap className="w-6 h-6" />, color: "bg-purple-50 text-purple-600 group-hover:bg-purple-600" },
              { id: "events", name: "Eventos & Lazer", icon: <PartyPopper className="w-6 h-6" />, color: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setStep("templates"); }}
                className="p-6 text-left rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:text-white transition-colors ${cat.color}`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500">Ver templates para {cat.name.toLowerCase()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "templates" && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setStep("categories")} className="text-gray-400 hover:text-indigo-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-700">
              {t("business.setup_select_template")}
            </h2>
          </div>

          {pages.length > 0 && (
            <GlassCard className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/10 border-indigo-100/30">
              <GlassCardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm text-slate-700 flex-1">
                  {t("business.setup_pages_count", { count: String(pages.length) })}
                </p>
                <Link href={`/dashboard/business/${businessId}`}>
                  <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-200">
                    {t("business.setup_verify_pages")}
                  </Button>
                </Link>
              </GlassCardContent>
            </GlassCard>
          )}

          <div className="space-y-8">
            {/* Recommended */}
            {recommendedTemplates.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {t("business.setup_recommended")}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendedTemplates.map((template) => (
                    <GlassCard
                      key={template.id}
                      className="border-indigo-200/50 bg-gradient-to-br from-indigo-50/20 to-indigo-50/5 group-hover:shadow-xl transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400" />
                      <GlassCardContent className="p-6 pt-7">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                              <Layout className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">
                                {rt(template.name)}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {template.sections.length} {t("business.setup_sections")}
                              </p>
                            </div>
                          </div>                              <Badge variant="indigo">{t("business.recommended")}</Badge>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          {rt(template.description)}
                        </p>

                        <div className="space-y-1 mb-4">
                          {template.sections.slice(0, 3).map((sec, i) => (
                            <div key={rt(sec.title) + i} className="text-xs text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/40" />
                              {rt(sec.title)}
                              {sec.items.length > 0 && (
                                <span className="text-gray-300">({sec.items.length} {t("business.setup_items")})</span>
                              )}
                            </div>
                          ))}
                          {template.sections.length > 3 && (
                            <div className="text-xs text-gray-300 pl-3.5">
                              +{template.sections.length - 3} {t("business.setup_sections")}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="default"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                          onClick={() => cloneTemplate(template)}
                          disabled={cloning}
                        >
                          {cloning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {t("business.use_template")}
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </GlassCardContent>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skip */}
          <div className="text-center">
            <button
              onClick={() => setStep("done")}
              className="text-sm text-gray-400 hover:text-indigo-600 transition-colors font-medium"
            >
              {t("business.setup_skip")}
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t("business.setup_done_title")}
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t("business.setup_done_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/dashboard/business/${businessId}`}>
                <Button variant="default" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                  {t("business.setup_manage")}
                </Button>
              </Link>
              <Link href={`/dashboard/business/${businessId}/qr`}>
                <Button variant="default" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                  <QrCode className="w-5 h-5 mr-2" />
                  {t("business.setup_view_qr")}
                </Button>
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
