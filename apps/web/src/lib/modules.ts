import { VERTICALS_CONFIG, MODULE_REGISTRY, FEATURE_FLAGS } from "@meuqr/shared";

/**
 * Checks if a module is enabled for a given business category/vertical.
 * Scopes feature flags for advanced modules.
 *
 * @param category The business category slug (e.g. "food_beverage", "construction")
 * @param moduleSlug The module slug to check (e.g. "orders", "appointments")
 */
export function isModuleEnabled(category: string, moduleSlug: string): boolean {
  // If the module is not in the registry, it's not supported
  const moduleDef = MODULE_REGISTRY[moduleSlug];
  if (!moduleDef) return false;

  // Core modules are always enabled
  if (moduleDef.isCore) return true;

  // Filter out advanced non-MVP modules if feature flag is disabled
  const advancedModules = ["courses", "hotel_concierge", "loyalty", "coupons"];
  if (advancedModules.includes(moduleSlug) && !FEATURE_FLAGS.ENABLE_ADVANCED_MODULES) {
    return false;
  }

  // Find vertical config by category slug (exact match or parent category)
  const vertical = VERTICALS_CONFIG[category];
  if (!vertical) {
    // If not found directly, check if it's a sub-category that belongs to a vertical
    // For safety, fallback to checking if category is included in default modules of any vertical
    // But since onboarding maps exact vertical ids (food_beverage, construction, etc.),
    // this direct check is standard.
    return false;
  }

  return vertical.defaultModules.includes(moduleSlug);
}

/**
 * Gets list of enabled modules for a business vertical/category.
 */
export function getEnabledModulesForCategory(category: string): string[] {
  const vertical = VERTICALS_CONFIG[category];
  if (!vertical) return [];

  // Filter out core modules and advanced modules if disabled
  return vertical.defaultModules.filter(slug => {
    const isAdvanced = ["courses", "hotel_concierge", "loyalty", "coupons"].includes(slug);
    if (isAdvanced && !FEATURE_FLAGS.ENABLE_ADVANCED_MODULES) return false;
    return true;
  });
}
