import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { detectDeviceType, detectBrowser } from "@meuqr/shared";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function QRRedirectPage({ params }: PageProps) {
  const { shortCode } = await params;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || null;

  // Create an anon supabase client for scan tracking
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Find the QR code and join relations in a single query
  const { data: qrCode } = await supabase
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

  if (!qrCode) {
    redirect("/");
  }

  const typedQr = qrCode as any;
  const businessSlug = typedQr.businesses?.slug;
  const pageSlug = typedQr.pages?.slug;

  // Fire and forget - insert scan and increment count
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
      redirect(`/${businessSlug}?p=${pageSlug}`);
    } else {
      redirect(`/${businessSlug}`);
    }
  }

  redirect("/");
}
