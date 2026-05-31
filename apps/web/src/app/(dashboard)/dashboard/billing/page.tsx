"use client";

import { useEffect, useState } from "react";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@meuqr/shared";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CreditCard,
  Crown,
  Star,
} from "lucide-react";

export default function BillingPage() {
  const { t } = useTranslation();
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("subscription_tier")
        .eq("owner_id", user.id);

      if (businesses?.length) {
        setCurrentTier(businesses[0].subscription_tier);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("errors.session_expired"));

      const { data: businesses, error: fetchError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      if (businesses && businesses.length > 0) {
        const businessId = businesses[0].id;

        if (planKey === "free") {
          // Downgrade to free via secure backend API
          const res = await fetch("/api/billing/downgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Erro ao fazer downgrade");
          
          setCurrentTier("free");
          toast.success(t('success.updated'));
        } else {
          // Redirect to checkout for paid plans (MercadoPago)
          const res = await fetch("/api/checkout-mp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planKey, businessId }),
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Erro no checkout");
          
          if (data.url) {
            window.location.href = data.url;
          }
        }
      } else {
        toast.error(t('errors.generic'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('errors.generic'));
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-[#64748B]">{t('business.loading_plans')}</p>
      </div>
    );
  }

  const plans = [
    { key: "free", ...PLANS.free },
    { key: "pro", ...PLANS.pro },
    { key: "business", ...PLANS.business },
  ];

  const tierLabels: Record<string, string> = {
    free: t("pricing.free_name"),
    pro: t("pricing.pro_name"),
    business: t("pricing.biz_name"),
  };

  const tierBadgeVariant: Record<string, "default" | "accent" | "secondary" | "outline" | "muted" | "indigo" | "emerald" | "amber" | "rose"> = {
    free: "muted",
    pro: "indigo",
    business: "amber",
  };

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

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{t("dashboard.subscription")}</h1>
            <p className="text-sm text-[#64748B] mt-0.5">{t("pricing.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      <GlassCard className="animate-fade-in-up delay-1">
        <GlassCardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shadow-sm">
                {planIcons[currentTier] || planIcons.free}
              </div>
              <div>
                <p className="text-sm text-[#64748B] font-medium">{t("dashboard.current_plan")}</p>
                <p className="text-lg font-bold text-[#0F172A]">{tierLabels[currentTier]}</p>
              </div>
            </div>
            <Badge variant={tierBadgeVariant[currentTier]} className="text-sm px-4 py-1">
              {tierLabels[currentTier]}
            </Badge>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Plans Grid */}
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 animate-fade-in-up delay-2">
        <button
          onClick={() => setAnnual(false)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !annual
              ? "bg-white text-[#0F172A] shadow-md shadow-slate-200/50 border border-slate-200"
              : "text-[#94A3B8] hover:text-[#64748B]"
          }`}
        >
          {t('pricing.monthly')}
        </button>
        <button
          onClick={() => setAnnual(true)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            annual
              ? "bg-white text-[#0F172A] shadow-md shadow-slate-200/50 border border-slate-200"
              : "text-[#94A3B8] hover:text-[#64748B]"
          }`}
        >
          {t('pricing.yearly')}
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ECONOMIZE 17%
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-6">
        {plans.map((plan, i) => {
          const isCurrent = plan.key === currentTier;
          const delay = `delay-${i + 2}`;

          return (
            <div key={plan.key} className={`animate-fade-in-up ${delay}`}>
              <GlassCard className={`relative overflow-hidden bg-gradient-to-br ${planGradients[plan.key]} ${
                isCurrent ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#F8FAFC]" : ""
              }`}>
                {/* Decorative gradient blob */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl ${
                  plan.key === "pro" ? "bg-indigo-400" :
                  plan.key === "business" ? "bg-amber-400" : "bg-slate-300"
                }`} />

                {isCurrent && (
                  <Badge
                    variant="indigo"
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    {t('pricing.current_plan')}
                  </Badge>
                )}

                <GlassCardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {planIcons[plan.key]}
                    <GlassCardTitle className="text-lg">{plan.namePt}</GlassCardTitle>
                  </div>
                  <div className="mt-2">
                    {annual && plan.price_yearly > 0 ? (
                      <>
                        <span className="text-3xl font-bold text-[#0F172A]">
                          R$ {plan.price_yearly.toFixed(0)}
                        </span>
                        <span className="text-[#64748B] text-sm ml-1">/ano</span>
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
                        <span className="text-3xl font-bold text-[#0F172A]">
                          {plan.price_monthly === 0
                            ? t("common.free")
                            : `R$ ${plan.price_monthly.toFixed(2)}`}
                        </span>
                        {plan.price_monthly > 0 && (
                          <span className="text-[#64748B] text-sm ml-1">{t("pricing.month")}</span>
                        )}
                      </>
                    )}
                  </div>
                  {plan.key === "free" && (
                    <p className="text-xs text-[#94A3B8] mt-1">{t('pricing.free_tagline')}</p>
                  )}
                  {plan.key === "pro" && (
                    <p className="text-xs text-indigo-600 font-medium mt-1">{t('pricing.pro_tagline')}</p>
                  )}
                  {plan.key === "business" && (
                    <p className="text-xs text-amber-600 font-medium mt-1">{t('pricing.biz_tagline')}</p>
                  )}
                </GlassCardHeader>

                <GlassCardContent>
                  <ul className="space-y-3 mb-6">
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                        : `1 ${t("pricing.feature_1_business")}`}
                    </li>
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                        : `1 ${t("pricing.feature_1_qr")}`}
                    </li>
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                        : `20 ${t("pricing.feature_20_items")}`}
                    </li>
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                    <li className={`flex items-center gap-2.5 text-sm ${
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
                  </ul>

                  {!isCurrent && plan.key !== "free" && (
                    <Button 
                      variant="default" 
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={upgrading === plan.key}
                      className="w-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
                    >
                      {upgrading === plan.key ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          {t("business.upgrade")}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}

                  {!isCurrent && plan.key === "free" && (
                    <p className="text-center text-xs text-[#94A3B8]">{t('pricing.current_plan_free')}</p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
