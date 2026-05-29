import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { trackClickSchema } from "@meuqr/shared";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    }
    console.error("Click tracking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
