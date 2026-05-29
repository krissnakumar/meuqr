"use client";

import Link from "next/link";
import { Button } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
import {
  QrCode,
  Smartphone,
  Store,
  BarChart3,
  Menu,
  X,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Building2,
  Scissors,
  Dog,
  Hotel,
  Home,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const features = [
  {
    icon: QrCode,
    titleKey: "feature_qr_title",
    descKey: "feature_qr_desc",
  },
  {
    icon: Smartphone,
    titleKey: "feature_mobile_title",
    descKey: "feature_mobile_desc",
  },
  {
    icon: Store,
    titleKey: "feature_catalog_title",
    descKey: "feature_catalog_desc",
  },
  {
    icon: BarChart3,
    titleKey: "feature_analytics_title",
    descKey: "feature_analytics_desc",
  },
];

const categories = [
  { icon: Utensils, nameKey: "category_restaurants", descKey: "category_digital_menu" },
  { icon: Building2, nameKey: "category_construction", descKey: "category_materials_catalog" },
  { icon: Scissors, nameKey: "category_salon", descKey: "category_services_schedule" },
  { icon: Dog, nameKey: "category_petshop", descKey: "category_products_services" },
  { icon: Hotel, nameKey: "category_hotel", descKey: "category_guest_guide" },
  { icon: Home, nameKey: "category_realestate", descKey: "category_property_showcase" },
  { icon: Calendar, nameKey: "category_events", descKey: "category_interactive_page" },
  { icon: Stethoscope, nameKey: "category_clinic", descKey: "category_online_booking" },
];

const plans = [
  {
    nameKey: "pricing.free_name",
    price: "R$ 0",
    periodKey: "pricing.month",
    featuresKey: ["free_feature_1", "free_feature_2", "free_feature_3", "free_feature_4"],
    ctaKey: "pricing.free_cta",
    popular: false,
  },
  {
    nameKey: "pricing.pro_name",
    price: "R$ 29,90",
    periodKey: "pricing.month",
    featuresKey: ["pro_feature_1", "pro_feature_2", "pro_feature_3", "pro_feature_4", "pro_feature_5"],
    ctaKey: "pricing.pro_cta",
    popular: true,
  },
  {
    nameKey: "pricing.biz_name",
    price: "R$ 79,90",
    periodKey: "pricing.month",
    featuresKey: ["biz_feature_1", "biz_feature_2", "biz_feature_3", "biz_feature_4", "biz_feature_5", "biz_feature_6", "biz_feature_7"],
    ctaKey: "pricing.biz_cta",
    popular: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const featureItems = features.map((f) => ({
    ...f,
    title: t(f.titleKey),
    description: t(f.descKey),
  }));

  const categoryItems = categories.map((c) => ({
    ...c,
    name: t(c.nameKey),
    desc: t(c.descKey),
  }));

  const planItems = plans.map((p) => ({
    ...p,
    name: t(p.nameKey),
    period: t(p.periodKey),
    cta: t(p.ctaKey),
    features: p.featuresKey.map((fk) => t(fk)),
  }));

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* ===== Navigation ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E4E6EB]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#050505]">MeuQR</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#funcionalidades" className="text-sm text-gray-600 hover:text-[#1877F2] transition-colors">
              {t("common.footer_features")}
            </Link>
            <Link href="#planos" className="text-sm text-gray-600 hover:text-[#1877F2] transition-colors">
              {t("common.footer_plans")}
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#1877F2] transition-colors">
              {t("auth.login_link")}
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm">
                {t("auth.register_btn")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E4E6EB] px-4 py-4 space-y-3 animate-fade-in">
            <Link
              href="#funcionalidades"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("common.footer_features")}
            </Link>
            <Link
              href="#planos"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("common.footer_plans")}
            </Link>
            <Link
              href="/login"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("auth.login_link")}
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full">
                {t("auth.register_btn")}
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* ===== Hero Section ===== */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#31A24C]/10 rounded-full text-[#31A24C] text-sm font-medium mb-8 animate-fade-in border border-[#31A24C]/20">
            <CheckCircle2 className="w-4 h-4" />
            {t("common.hero_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#050505] tracking-tight leading-tight mb-6 animate-fade-in-up">
            {t("common.hero_title_line1")}
            <br />
            {t("common.hero_title_with")}{" "}
            <span className="text-[#1877F2]">{t("common.hero_qr")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {t("common.hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button variant="default" size="xl" className="w-full sm:w-auto">
                {t("auth.register_btn")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#funcionalidades">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                {t("common.hero_see_features")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E4E6EB]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#050505] text-center mb-4">
            {t("common.for_every_business")}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {t("common.for_every_business_desc")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryItems.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#E4E6EB] hover:border-[#1877F2]/30 hover:shadow-sm transition-all cursor-default group"
              >
                <cat.icon className="w-8 h-8 text-[#1877F2] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-[#050505] text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-400">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#050505] text-center mb-4">
            {t("common.all_you_need")}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {t("common.all_you_need_desc")}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureItems.map((feat) => (
              <div
                key={feat.title}
                className="p-6 rounded-xl bg-white border border-[#E4E6EB] hover:shadow-lg hover:border-[#1877F2]/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#1877F2]/10 flex items-center justify-center mb-4 group-hover:bg-[#1877F2] transition-colors">
                  <feat.icon className="w-6 h-6 text-[#1877F2] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#050505] mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-gray-500">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Plans ===== */}
      <section id="planos" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E4E6EB]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#050505] text-center mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planItems.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-[#1877F2] text-white shadow-xl scale-105"
                    : "bg-white border border-[#E4E6EB]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#31A24C] text-white text-xs font-semibold rounded-full">
                    {t("pricing.popular_badge")}
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-[#050505]"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[#050505]"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-blue-100" : "text-gray-400"}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 ${plan.popular ? "text-white" : "text-[#31A24C]"}`} />
                      <span className={plan.popular ? "text-blue-50" : "text-gray-600"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.popular ? "secondary" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#050505] tracking-tight mb-6">
            {t("pricing.cta_title")}
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            {t("pricing.cta_desc")}
          </p>
          <Link href="/register">
            <Button variant="default" size="xl">
              {t("auth.register_btn")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#1c1e21] text-white">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#1c1e21]" />
              </div>
              <span className="text-xl font-bold">MeuQR</span>
            </div>
            <p className="text-sm text-gray-400">
              {t("common.footer_tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("common.footer_product")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#funcionalidades" className="hover:text-white transition-colors">{t("common.footer_features")}</Link></li>
              <li><Link href="#planos" className="hover:text-white transition-colors">{t("common.footer_plans")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("common.footer_contact")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>contato@meuqr.com.br</li>
              <li>WhatsApp: (11) 99999-8888</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          {t("common.footer_rights")}
        </div>
      </footer>
    </div>
  );
}
