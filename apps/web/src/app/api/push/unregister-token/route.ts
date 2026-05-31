import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ERR, API_SUCCESS } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Not setting cookies
          },
        },
      }
    );

    // 1. Get authenticated session user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: ERR.UNAUTHORIZED }, { status: 401 });
    }

    const body = await request.json();
    const { expoPushToken } = body;

    if (!expoPushToken) {
      return NextResponse.json({ error: ERR.MISSING_PUSH_TOKEN }, { status: 400 });
    }

    // 2. Set token to inactive
    const { error } = await supabase
      .from("device_push_tokens")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("expo_push_token", expoPushToken);

    if (error) {
      console.error("Token unregistration error:", error);
      return NextResponse.json({ error: ERR.UNREGISTER_PUSH_TOKEN_ERROR }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: API_SUCCESS.PUSH_TOKEN_DISABLED });
  } catch (err) {
    console.error("Push Unregister exception:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
