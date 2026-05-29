"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@meuqr/shared";
import { useTranslation } from "@/lib/i18n-provider";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function BillingPage() {
  const { t } = useTranslation();
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const plans = [
    { key: "free", ...PLANS.free },
    { key: "pro", ...PLANS.pro },
    { key: "business", ...PLANS.business },
  ];

  const tierLabels: Record<string, string> = {
    free: t('pricing.free_name'),
    pro: 'Pro',
    business: 'Business',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          {t('dashboard.subscription')}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('pricing.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('dashboard.current_plan')}</CardTitle>
              <CardDescription>
                {t('pricing.free_name')}: {tierLabels[currentTier]}
              </CardDescription>
            </div>
            <Badge
              variant={
                currentTier === "free"
                  ? "outline"
                  : currentTier === "pro"
                  ? "accent"
                  : "secondary"
              }
              className="text-sm px-4 py-1"
            >
              {tierLabels[currentTier]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentTier;
          const tierKey = `pricing.${plan.key}_` as const;
          return (
            <Card
              key={plan.key}
              className={`relative ${
                isCurrent ? "border-2 border-[#00C853]" : ""
              }`}
            >
              {isCurrent && (
                <Badge
                  variant="accent"
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2"
                >
                  {t('pricing.popular_badge')}
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.namePt}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price_monthly === 0
                      ? t('common.free')
                      : `R$ ${plan.price_monthly.toFixed(2)}`}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-gray-400 text-sm">{t('pricing.month')}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_businesses === -1
                      ? t('pricing.feature_unlimited_businesses')
                      : `1 ${t('pricing.feature_1_business')}`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_qrs === -1
                      ? t('pricing.feature_unlimited_qrs')
                      : `1 ${t('pricing.feature_1_qr')}`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_items === -1
                      ? t('pricing.feature_unlimited_items')
                      : `20 ${t('pricing.feature_20_items')}`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.custom_qr ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    {plan.custom_qr ? t('pricing.feature_custom_qr') : t('pricing.feature_basic_qr')}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.analytics ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    {plan.analytics ? t('pricing.feature_full_analytics') : t('pricing.feature_basic_analytics')}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.staff_members ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    {t('pricing.feature_staff')}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.api_access ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    {t('pricing.feature_api')}
                  </li>
                </ul>

                {!isCurrent && plan.key !== "free" && (
                  <Button variant="default" className="w-full">
                    {t('business.upgrade')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
