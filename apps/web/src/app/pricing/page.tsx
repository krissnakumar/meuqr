"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import { PLANS } from "@meuqr/shared";
import { useTranslation } from "@/lib/i18n-provider";
import {
  CheckCircle2,
  Sparkles,
  Crown,
  Star,
  ArrowRight,
  QrCode,
  Smartphone,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const plans = [
  { key: "free" as const, ...PLANS.free },
  { key: "pro" as const, ...PLANS.pro },
  { key: "business" as const, ...PLANS.business },
];

const planIcons: Record<string, React.ReactNode> = {
  free: <Star className="w-6 h-6 text-[#94A3B8]" />,
  pro: <Crown className="w-6 h-6 text-indigo-600" />,
  business: <Sparkles className="w-6 h-6 text-amber-500" />,
};

const planGradients: Record<string, string> = {
  free: "from-slate-50/80 to-transparent",
  pro: "from-indigo-50/80 to-transparent",
  business: "from-amber-50/80 to-transparent",
};

const decorativeBlobs: Record<string, string> = {
  free: "bg-slate-300",
  pro: "bg-indigo-400",
  business: "bg-amber-400",
};

const NAV_ITEMS = [
  { id: "planos", label: "Planos" },
  { id: "recursos", label: "Recursos" },
  { id: "faq", label: "FAQ" },
] as const;

export default function PricingPage() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);

  const faqs = [
    { q: t("pricing.faq_change_plan_q"), a: t("pricing.faq_change_plan_a") },
    { q: t("pricing.faq_credit_card_q"), a: t("pricing.faq_credit_card_a") },
    { q: t("pricing.faq_cancel_q"), a: t("pricing.faq_cancel_a") },
    { q: t("pricing.faq_support_q"), a: t("pricing.faq_support_a") },
  ];

  // Track scroll position to toggle header visibility
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 320);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const billingParam = annual ? "billing=annual" : "";
  const registerHref = (base: string) => {
    if (!billingParam) return base;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}${billingParam}`;
  };

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ===== STICKY HEADER ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-2 sm:mx-4 mt-2 sm:mt-3">
          <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg shadow-slate-200/50 rounded-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="font-bold text-[#0F172A] text-sm sm:text-base hidden sm:block">
                  MeuQR
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href={registerHref("/register")}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 active:scale-[0.97] transition-all"
                >
                  Começar Grátis
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out mx-2 sm:mx-4 ${
            mobileMenuOpen
              ? "opacity-100 max-h-80 mt-2"
              : "opacity-0 max-h-0 mt-0 pointer-events-none"
          }`}
        >
          <div className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-3 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href={registerHref("/register")}
                className="w-full text-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-indigo-400 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl bg-violet-400 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <Badge variant="indigo" className="mb-6 px-4 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              {t("common.hero_badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] tracking-tight mb-6">
              {t("pricing.title")}
            </h1>
            <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              {t("pricing.subtitle")}
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-10 animate-fade-in-up delay-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  !annual
                    ? "bg-white text-[#0F172A] shadow-md shadow-slate-200/50 border border-slate-200"
                    : "text-[#94A3B8] hover:text-[#64748B]"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  annual
                    ? "bg-white text-[#0F172A] shadow-md shadow-slate-200/50 border border-slate-200"
                    : "text-[#94A3B8] hover:text-[#64748B]"
                }`}
              >
                Anual
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ECONOMIZE 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANS GRID ===== */}
      <section id="planos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-8 scroll-mt-24">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isPopular = plan.key === "pro";
            const planName = plan.key === "free"
              ? t("pricing.free_name")
              : plan.key === "pro"
              ? t("pricing.pro_name")
              : t("pricing.biz_name");

            const planDesc = plan.key === "free"
              ? t("pricing.free_desc")
              : plan.key === "pro"
              ? t("pricing.pro_desc")
              : t("pricing.biz_desc");

            const planCta = plan.key === "free"
              ? t("pricing.free_cta")
              : plan.key === "pro"
              ? t("pricing.pro_cta")
              : t("pricing.biz_cta");

            const planHref = registerHref(
              plan.key === "free"
                ? "/register"
                : plan.key === "pro"
                ? "/register?plan=pro"
                : "/register?plan=business"
            );

            const delay = `delay-${i + 1}`;

            return (
              <div key={plan.key} className={`animate-fade-in-up ${delay} relative`}>
                <GlassCard
                  className={`relative overflow-hidden bg-gradient-to-br ${planGradients[plan.key]} h-full flex flex-col ${
                    isPopular ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#F8FAFC]" : ""
                  }`}
                >
                  {/* Decorative blob */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl ${decorativeBlobs[plan.key]}`} />

                  {/* Popular badge */}
                  {isPopular && (
                    <Badge
                      variant="indigo"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg shadow-indigo-200"
                    >
                      {t("pricing.popular_badge")}
                    </Badge>
                  )}

                  {/* Header */}
                  <GlassCardHeader className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      {planIcons[plan.key]}
                      <GlassCardTitle className="text-lg">{planName}</GlassCardTitle>
                    </div>
                    <p className="text-sm text-[#64748B] mb-3">{planDesc}</p>
                    <div className="mt-1">
                      {annual && plan.price_yearly > 0 ? (
                        <>
                          <span className="text-4xl font-bold text-[#0F172A] tracking-tight">
                            R$ {plan.price_yearly.toFixed(0)}
                          </span>
                          <span className="text-[#64748B] text-sm ml-1.5 font-medium">/ano</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-[#94A3B8] line-through">
                              R$ {(plan.price_monthly * 12).toFixed(0)}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              ECONOMIZE {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-[#0F172A] tracking-tight">
                            {plan.price_monthly === 0
                              ? t("common.free")
                              : `R$ ${plan.price_monthly.toFixed(2)}`}
                          </span>
                          {plan.price_monthly > 0 && (
                            <span className="text-[#64748B] text-sm ml-1.5 font-medium">
                              {t("pricing.month")}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                  </GlassCardHeader>

                  {/* Features */}
                  <GlassCardContent className="flex-1 flex flex-col relative z-10">
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {/* Businesses */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.max_businesses >= 1 ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.max_businesses >= 1 ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.max_businesses >= 1 ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {plan.max_businesses === -1
                          ? t("pricing.feature_unlimited_businesses")
                          : plan.max_businesses === 1
                          ? t("pricing.feature_1_business")
                          : t("pricing.feature_3_businesses")}
                      </li>

                      {/* QR codes */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.max_qrs >= 1 ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.max_qrs >= 1 ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.max_qrs >= 1 ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {plan.max_qrs === -1
                          ? t("pricing.feature_unlimited_qrs")
                          : t("pricing.feature_1_qr")}
                      </li>

                      {/* Items */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.max_items >= 1 ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.max_items >= 1 ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.max_items >= 1 ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {plan.max_items === -1
                          ? t("pricing.feature_unlimited_items")
                          : t("pricing.feature_20_items")}
                      </li>

                      {/* Custom QR */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.custom_qr ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.custom_qr ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.custom_qr ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {plan.custom_qr ? t("pricing.feature_custom_qr") : t("pricing.feature_basic_qr")}
                      </li>

                      {/* Analytics */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.analytics ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.analytics ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.analytics ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {plan.analytics ? t("pricing.feature_full_analytics") : t("pricing.feature_basic_analytics")}
                      </li>

                      {/* Staff members */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.staff_members ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.staff_members ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.staff_members ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {t("pricing.feature_staff")}
                      </li>

                      {/* API access */}
                      <li className={`flex items-center gap-3 text-sm ${
                        plan.api_access ? "text-[#0F172A]" : "text-[#CBD5E1]"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.api_access ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            plan.api_access ? "text-emerald-600" : "text-[#CBD5E1]"
                          }`} />
                        </div>
                        {t("pricing.feature_api")}
                      </li>

                      {/* Support */}
                      <li className="flex items-center gap-3 text-sm text-[#0F172A]">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        {plan.key === "business"
                          ? t("pricing.feature_24h_support")
                          : plan.key === "pro"
                          ? t("pricing.feature_priority_support")
                          : t("pricing.feature_email_support")}
                      </li>
                    </ul>

                    {/* CTA */}
                    <Link href={planHref}>
                      <button
                        className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all ${
                          isPopular
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98]"
                            : "bg-white text-[#0F172A] border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 active:scale-[0.98]"
                        }`}
                      >
                        {planCta}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </GlassCardContent>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <section id="recursos" className="border-y border-slate-100 bg-white/40 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: QrCode, title: t("common.feature_qr_title"), desc: t("common.feature_qr_desc") },
              { icon: Smartphone, title: t("common.feature_mobile_title"), desc: t("common.feature_mobile_desc") },
              { icon: Menu, title: t("common.feature_catalog_title"), desc: t("common.feature_catalog_desc") },
              { icon: BarChart3, title: t("common.feature_analytics_title"), desc: t("common.feature_analytics_desc") },
            ].map((feature, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <feature.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">{feature.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-10 animate-fade-in-up">
          {t("pricing.faq_title")}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <GlassCard
              key={i}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <GlassCardContent className="p-6">
                <h3 className="font-semibold text-[#0F172A] mb-2 text-sm">{faq.q}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl bg-white pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full opacity-10 blur-3xl bg-violet-300 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            {t("pricing.cta_title")}
          </h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-lg animate-fade-in-up delay-1">
            {t("pricing.cta_desc")}
          </p>
          <div className="animate-fade-in-up delay-2">
            <Link
              href={registerHref("/register")}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("pricing.cta_btn")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
