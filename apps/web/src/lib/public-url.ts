export function getPublicBusinessHomePath(businessSlug: string) {
  return `/b/${businessSlug}`;
}

export function getPublicBusinessPagePath(businessSlug: string, pageSlug?: string | null) {
  if (!pageSlug || pageSlug === "home") {
    return getPublicBusinessHomePath(businessSlug);
  }

  return `/b/${businessSlug}/${pageSlug}`;
}

export function getPublicBusinessPageQueryPath(businessSlug: string, pageSlug?: string | null) {
  const base = getPublicBusinessHomePath(businessSlug);
  return pageSlug ? `${base}?p=${pageSlug}` : base;
}

export function getPublicBusinessSectionPath(
  businessSlug: string,
  pageSlug: string | null | undefined,
  sectionId: string
) {
  const pagePath = getPublicBusinessPagePath(businessSlug, pageSlug);
  return `${pagePath}#${sectionId}`;
}
