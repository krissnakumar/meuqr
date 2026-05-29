"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@meuqr/shared";
import {
  Loader2,
  CheckCircle2,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          Assinatura
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie seu plano e forma de pagamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>
                Você está no plano{" "}
                {currentTier === "free"
                  ? "Grátis"
                  : currentTier === "pro"
                  ? "Profissional"
                  : "Empresarial"}
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
              {currentTier === "free"
                ? "Grátis"
                : currentTier === "pro"
                ? "Pro"
                : "Business"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentTier;
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
                  Plano Atual
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.namePt}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price_monthly === 0
                      ? "Grátis"
                      : `R$ ${plan.price_monthly.toFixed(2)}`}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-gray-400 text-sm">/mês</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_businesses === -1
                      ? "Negócios ilimitados"
                      : `${plan.max_businesses} negócio(s)`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_qrs === -1
                      ? "QR ilimitados"
                      : `${plan.max_qrs} QR code`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                    {plan.max_items === -1
                      ? "Itens ilimitados"
                      : `${plan.max_items} itens`}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.custom_qr ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    QR personalizado
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.analytics ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    Analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.staff_members ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    Equipe multi-usuário
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        plan.api_access ? "text-[#00C853]" : "text-gray-300"
                      }`}
                    />
                    API access
                  </li>
                </ul>

                {!isCurrent && plan.key !== "free" && (
                  <Button variant="default" className="w-full">
                    Fazer Upgrade
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
