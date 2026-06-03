import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { trackScanSchema, detectDeviceType, detectBrowser } from "@meuqr/shared";
import { z } from "zod";
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { ERR } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`scan:${ip}`, RATE_LIMIT_CONFIGS.tracking);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: ERR.TOO_MANY_REQUESTS },
      { status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }

    const body = await request.json();
    const headersList = request.headers;

    // Validate input
    const parsed = trackScanSchema.parse(body);

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

    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
    const userAgent = headersList.get("user-agent") || null;
    const referrer = headersList.get("referer") || null;

    const { data, error } = await supabase
      .from("scans")
      .insert({
        qr_code_id: parsed.qrCodeId,
        page_id: parsed.pageId ?? null,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: detectDeviceType(userAgent || ""),
        browser: detectBrowser(userAgent || ""),
        referrer: referrer,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Scan tracking error:", error);
      return NextResponse.json({ error: ERR.TRACK_SCAN_ERROR }, { status: 500 });
    }

    // Fire and forget - increment scan count
    try {
      await supabase.rpc("increment_scan_count", { qr_code_id: parsed.qrCodeId });
    } catch {
      // Ignore errors on fire-and-forget RPC
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: ERR.INVALID_INPUT, details: err.errors }, { status: 400 });
    }
    console.error("Scan tracking error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR_EN }, { status: 500 });
  }
}
