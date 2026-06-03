import { supabaseAdmin } from "@/lib/supabase-admin";
import { PLANS, PlanConfig } from "@meuqr/shared";

export class PlanLimitsChecker {
  /**
   * Gets the plan configuration for a business.
   */
  static async getPlanConfig(businessId: string): Promise<{ tier: string; config: PlanConfig }> {
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("subscription_tier")
      .eq("id", businessId)
      .single();

    const tier = (business?.subscription_tier || "free").toLowerCase();
    const config = PLANS[tier] || PLANS.free;

    return { tier, config };
  }

  /**
   * Verifies if the user can create another business.
   */
  static async canCreateBusiness(userId: string): Promise<boolean> {
    // Count current businesses
    const { count, error } = await supabaseAdmin
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);

    if (error) return false;

    // Standard check: Free users are restricted to 1 business
    // (If they are upgrading, they check limits on the user level, but by default we use Free tier limit of 1)
    const currentCount = count || 0;
    return currentCount < PLANS.free.maxBusinesses;
  }

  /**
   * Verifies if the business can create another page.
   */
  static async canCreatePage(businessId: string): Promise<boolean> {
    const { config } = await this.getPlanConfig(businessId);

    const { count, error } = await supabaseAdmin
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    if (error) return false;

    const currentCount = count || 0;
    return currentCount < config.maxPages;
  }

  /**
   * Verifies if the business can create another product or service.
   */
  static async canCreateItem(businessId: string): Promise<boolean> {
    const { config } = await this.getPlanConfig(businessId);

    // Fetch page IDs
    const { data: pages } = await supabaseAdmin
      .from("pages")
      .select("id")
      .eq("business_id", businessId);

    const pageIds = pages?.map((p) => p.id) || [];
    if (pageIds.length === 0) return true; // No pages, so 0 items, which is under limit

    // Fetch section IDs
    const { data: sections } = await supabaseAdmin
      .from("sections")
      .select("id")
      .in("page_id", pageIds);

    const sectionIds = sections?.map((s) => s.id) || [];
    if (sectionIds.length === 0) return true; // No sections, so 0 items

    // Count items
    const { count, error } = await supabaseAdmin
      .from("items")
      .select("id", { count: "exact", head: true })
      .in("section_id", sectionIds);

    if (error) return false;

    const currentCount = count || 0;
    return currentCount < config.maxItems;
  }
}
