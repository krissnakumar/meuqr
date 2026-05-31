import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { trackClickSchema } from "@meuqr/shared";
import { z } from "zod";
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { ERR } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`click:${ip}`, RATE_LIMIT_CONFIGS.tracking);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: ERR.TOO_MANY_REQUESTS },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = trackClickSchema.parse(body);

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

    const { data, error } = await supabase
      .from("clicks")
      .insert({
        scan_id: parsed.scanId ?? null,
        qr_code_id: parsed.qrCodeId ?? null,
        page_id: parsed.pageId ?? null,
        click_type: parsed.clickType,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Click tracking error:", error);
      return NextResponse.json({ error: ERR.TRACK_CLICK_ERROR }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: ERR.INVALID_INPUT, details: err.errors }, { status: 400 });
    }
    console.error("Click tracking error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR_EN }, { status: 500 });
  }
}
