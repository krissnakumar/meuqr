import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { expoPushToken, platform, deviceName, businessId } = body;

    if (!expoPushToken || !platform) {
      return NextResponse.json({ error: "Parâmetros expoPushToken e platform são obrigatórios." }, { status: 400 });
    }

    // 2. Register/Update the device push token
    const { data: token, error } = await supabase
      .from("device_push_tokens")
      .upsert({
        user_id: user.id,
        business_id: businessId || null,
        platform,
        expo_push_token: expoPushToken,
        device_name: deviceName || null,
        is_active: true,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: "user_id,expo_push_token"
      })
      .select()
      .single();

    if (error) {
      console.error("Token registration error:", error);
      return NextResponse.json({ error: "Erro ao registrar token de push." }, { status: 500 });
    }

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("Push Register exception:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
