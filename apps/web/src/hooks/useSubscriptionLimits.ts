"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@meuqr/shared";
import type { SubscriptionTier, SubscriptionLimits } from "@meuqr/shared";

interface UsageCounts {
  businesses: number;
  qrCodes: number;
  items: number;
}

interface SubscriptionInfo {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  usage: UsageCounts;
  canCreateBusiness: boolean;
  canCreateQR: boolean;
  canAddItem: boolean;
  isLoading: boolean;
}

export function useSubscriptionLimits(userId?: string): SubscriptionInfo {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [usage, setUsage] = useState<UsageCounts>({
    businesses: 0,
    qrCodes: 0,
    items: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Try to get current user
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          loadLimits(user.id);
        } else {
          setIsLoading(false);
        }
      });
    } else {
      loadLimits(userId);
    }
  }, [userId]);

  async function loadLimits(uid: string) {
    try {
      // Get user's businesses with their subscription tiers
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, subscription_tier")
        .eq("owner_id", uid);

      const bizList = businesses || [];
      const bizIds = bizList.map((b) => b.id);

      // Determine highest tier across all businesses
      const tiers = bizList.map((b) => b.subscription_tier as SubscriptionTier);
      const highestTier: SubscriptionTier = tiers.includes("business")
        ? "business"
        : tiers.includes("pro")
        ? "pro"
        : "free";

      // Count usage
      let itemCount = 0;
      if (bizIds.length > 0) {
        const { data: pages } = await supabase
          .from("pages")
          .select("id")
          .in("business_id", bizIds);

        const pageIds = (pages || []).map((p) => p.id);

        if (pageIds.length > 0) {
          const { data: sections } = await supabase
            .from("sections")
            .select("id")
            .in("page_id", pageIds);

          const sectionIds = (sections || []).map((s) => s.id);

          if (sectionIds.length > 0) {
            const { count } = await supabase
              .from("items")
              .select("*", { count: "exact", head: true })
              .in("section_id", sectionIds);
            itemCount = count || 0;
          }
        }
      }

      const qrCount = bizIds.length > 0
        ? (await supabase
            .from("qr_codes")
            .select("*", { count: "exact", head: true })
            .in("business_id", bizIds)).count || 0
        : 0;

      setTier(highestTier);
      setUsage({
        businesses: bizList.length,
        qrCodes: qrCount,
        items: itemCount,
      });
    } catch (err) {
      console.error("Error loading subscription limits:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const plan = PLANS[tier];

  const canCreateBusiness =
    plan.max_businesses === -1 || usage.businesses < plan.max_businesses;

  const canCreateQR = plan.max_qrs === -1 || usage.qrCodes < plan.max_qrs;

  const canAddItem = plan.max_items === -1 || usage.items < plan.max_items;

  return {
    tier,
    limits: plan,
    usage,
    canCreateBusiness,
    canCreateQR,
    canAddItem,
    isLoading,
  };
}

/**
 * Check if a specific action is allowed for the given tier.
 * Returns an object with `allowed` and a `message` if blocked.
 */
export function checkActionLimit(
  tier: SubscriptionTier,
  action: "businesses" | "qrs" | "items",
  currentCount: number
): { allowed: boolean; message?: string } {
  const plan = PLANS[tier];
  const max =
    action === "businesses"
      ? plan.max_businesses
      : action === "qrs"
      ? plan.max_qrs
      : plan.max_items;

  if (max === -1) return { allowed: true };

  if (currentCount >= max) {
    const names: Record<string, string> = {
      businesses: "negócios",
      qrs: "QR codes",
      items: "itens",
    };
    return {
      allowed: false,
      message: `Você atingiu o limite de ${names[action]} do seu plano. Faça upgrade para continuar.`,
    };
  }

  return { allowed: true };
}
