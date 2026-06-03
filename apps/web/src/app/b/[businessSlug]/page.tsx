import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PublicBusinessPageClient } from "../../[businessSlug]/client";
import { PublicPageProvider } from "../../[businessSlug]/context";
import { notFound, redirect } from "next/navigation";
import { getPublicBusinessHomePath, getPublicBusinessPagePath } from "@/lib/public-url";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{ p?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { businessSlug } = await params;
  const sParams = await searchParams;
  const pageSlug = sParams?.p;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}, // Read-only context
      },
    }
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, description, logo_url")
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .single();

  const biz = business as unknown as { id: string; name: string; description: string | null; logo_url: string | null } | null;

  if (!biz) {
    return { title: "Página não encontrada | MeuQR" };
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, seo_title, seo_description, seo_image_url")
    .eq("business_id", biz.id)
    .eq("is_published", true);

  const pagesList = (pages as unknown as { id: string; title: string; slug: string; seo_title: string | null; seo_description: string | null; seo_image_url: string | null }[]) || null;
  
  let page = null;
  if (pageSlug) {
    page = pagesList?.find((p) => p.slug === pageSlug) || null;
    if (!page) {
      return { title: "Página não encontrada | MeuQR" };
    }
  } else {
    page = pagesList?.[0] || null;
  }

  const title = page?.seo_title || (page ? `${page.title} - ${biz.name}` : biz.name);
  const description = page?.seo_description || biz.description || `Conheça ${biz.name} no MeuQR`;
  const imageUrl = page?.seo_image_url || biz.logo_url;
  const canonical = page ? getPublicBusinessPagePath(businessSlug, page.slug) : getPublicBusinessHomePath(businessSlug);

  return {
    title: `${title} | MeuQR`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function PublicBusinessPage({ params, searchParams }: PageProps) {
  const { businessSlug } = await params;
  const sParams = await searchParams;
  const pageSlug = sParams?.p;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}, // Read-only context
      },
    }
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .single();

  const biz = business as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    phone: string | null;
    whatsapp: string | null;
    pix_key: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    instagram: string | null;
    facebook: string | null;
    website: string | null;
    opening_hours: Record<string, string> | null;
    notification_settings: any;
    form_schema?: any;
  } | null;

  if (!biz) {
    notFound();
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, seo_title, seo_description")
    .eq("business_id", biz.id)
    .eq("is_published", true);

  const pagesList = (pages as unknown as { id: string; title: string; slug: string }[]) || null;
  
  let page = null;
  if (pageSlug) {
    page = pagesList?.find((p) => p.slug === pageSlug) || null;
    if (!page) {
      notFound();
    }

    if (page.slug === "home") {
      redirect(getPublicBusinessHomePath(businessSlug));
    }

    redirect(getPublicBusinessPagePath(businessSlug, page.slug));
  } else {
    page = pagesList?.[0] || null;
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#111827] mb-2">{biz.name}</h1>
          <p className="text-gray-500">Página em construção</p>
        </div>
      </div>
    );
  }

  const pageIds = pagesList?.map((p) => p.id) || [];
  const { data: sections } = await supabase
    .from("sections")
    .select("*, items(*)")
    .in("page_id", pageIds)
    .eq("is_visible", true)
    .order("sort_order");

  let nearbyBusinesses: any[] = [];
  if (biz.city) {
    const { data: nearby } = await supabase
      .from("businesses")
      .select("id, name, slug, logo_url, category, city")
      .eq("city", biz.city)
      .eq("is_active", true)
      .neq("id", biz.id)
      .limit(4);
    nearbyBusinesses = nearby || [];
  }

  return (
    <PublicPageProvider>
      <PublicBusinessPageClient
        business={biz}
        page={page}
        pages={pagesList || []}
        sections={(sections as unknown as any[]) || []}
        nearbyBusinesses={nearbyBusinesses}
      />
    </PublicPageProvider>
  );
}
