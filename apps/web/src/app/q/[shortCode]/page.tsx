import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { detectDeviceType, detectBrowser } from "@meuqr/shared";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "edge";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

// Instantiate anon client for edge
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache the QR resolution query to prevent database overload during viral spikes
const getCachedQrCode = unstable_cache(
  async (shortCode: string) => {
    const { data } = await supabase
      .from("qr_codes")
      .select(`
        id,
        page_id,
        short_code,
        pages (
          slug
        ),
        businesses (
          slug
        )
      `)
      .eq("short_code", shortCode)
      .eq("is_active", true)
      .single();
    
    return data;
  },
  ["qr-code-resolve"],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ["qr-codes"],
  }
);

export default async function QRRedirectPage({ params }: PageProps) {
  const { shortCode } = await params;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || null;

  // Fetch from Edge Cache instead of directly hitting DB every time
  const qrCode = await getCachedQrCode(shortCode);

  if (!qrCode) {
    redirect("/");
  }

  const typedQr = qrCode as any;
  const businessSlug = typedQr.businesses?.slug;
  const pageSlug = typedQr.pages?.slug;

  // Fire and forget - insert scan and increment count
  // Since we are on edge runtime, we must ensure waitUntil or standard promises are handled.
  // Vercel Edge supports background tasks if they are spawned before response finishes.
  void supabase
    .from("scans")
    .insert({
      qr_code_id: typedQr.id,
      page_id: typedQr.page_id,
      user_agent: userAgent,
      device_type: detectDeviceType(userAgent || ""),
      browser: detectBrowser(userAgent || ""),
    })
    .then(() => void supabase.rpc("increment_scan_count", { qr_code_id: typedQr.id }));

  // Redirect to public business page
  if (businessSlug) {
    if (pageSlug) {
      redirect(`/b/${businessSlug}/${pageSlug}`);
    } else {
      redirect(`/b/${businessSlug}`);
    }
  }

  redirect("/");
}
