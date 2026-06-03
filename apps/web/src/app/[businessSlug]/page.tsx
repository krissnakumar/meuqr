import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicBusinessHomePath, getPublicBusinessPagePath } from "@/lib/public-url";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{ p?: string }>;
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
        setAll() {},
      },
    }
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, is_active")
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .single();

  if (!business) {
    notFound();
  }

  if (pageSlug) {
    const { data: page } = await supabase
      .from("pages")
      .select("slug")
      .eq("business_id", (business as { id: string }).id)
      .eq("slug", pageSlug)
      .eq("is_published", true)
      .maybeSingle();

    if (!page) {
      notFound();
    }

    redirect(getPublicBusinessPagePath(businessSlug, page.slug));
  }

  redirect(getPublicBusinessHomePath(businessSlug));
}
