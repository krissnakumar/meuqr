import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`public-page:${ip}`, RATE_LIMIT_CONFIGS.publicData);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const shortCode = request.nextUrl.searchParams.get("shortCode");

  if (!slug && !shortCode) {
    return NextResponse.json(
      { error: "Provide either slug or shortCode parameter" },
      { status: 400 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Not setting cookies in API route
        },
      },
    }
  );

  try {
    if (shortCode) {
      // Resolve QR short code to business slug
      const { data: qrCode } = await supabase
        .from("qr_codes")
        .select("*, pages!inner(*, businesses!inner(slug))")
        .eq("short_code", shortCode)
        .eq("is_active", true)
        .single();

      if (!qrCode) {
        return NextResponse.json({ error: "QR code not found" }, { status: 404 });
      }

      const page = qrCode.pages as any;
      const businessSlug = page?.businesses?.slug;

      if (!businessSlug) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      // Fetch full public data
      const data = await fetchPublicPageData(supabase, businessSlug, page?.id);
      return NextResponse.json(data);
    }

    if (slug) {
      const data = await fetchPublicPageData(supabase, slug);
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("Public page error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchPublicPageData(
  supabase: ReturnType<typeof createServerClient>,
  slug: string,
  pageId?: string
) {
  // Get business
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!business) {
    return { error: "Business not found" };
  }

  // Get published pages
  const query = supabase
    .from("pages")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_published", true);

  if (pageId) {
    query.eq("id", pageId);
  }

  const { data: pages } = await query;

  if (!pages || pages.length === 0) {
    return { business, pages: [] };
  }

  // Get sections and items for each page
  const pagesWithContent = await Promise.all(
    pages.map(async (page: any) => {
      const { data: sections } = await supabase
        .from("sections")
        .select("*")
        .eq("page_id", page.id)
        .eq("is_visible", true)
        .order("sort_order");

      const sectionsWithItems = await Promise.all(
        (sections || []).map(async (section: any) => {
          const { data: items } = await supabase
            .from("items")
            .select("*")
            .eq("section_id", section.id)
            .eq("is_available", true)
            .order("sort_order");

          return { ...section, items: items || [] };
        })
      );

      return { ...page, sections: sectionsWithItems };
    })
  );

  // Get active QR codes
  const { data: qrCodes } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true);

  return {
    business,
    pages: pagesWithContent,
    qr_codes: qrCodes || [],
  };
}
