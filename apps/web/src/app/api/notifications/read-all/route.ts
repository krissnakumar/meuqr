import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
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

    // 2. Read businessId from body or query params
    const body = await request.json().catch(() => ({}));
    const businessId = body.businessId || request.nextUrl.searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "O parâmetro businessId é obrigatório." }, { status: 400 });
    }

    // Verify user membership or business ownership
    const { data: isAuthorized } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!isAuthorized) {
      const { data: member } = await supabase
        .from("business_members")
        .select("id")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!member) {
        return NextResponse.json({ error: "Acesso negado para este negócio." }, { status: 403 });
      }
    }

    // 4. Update all unread notifications to 'read'
    const { error } = await supabase
      .from("notifications")
      .update({
        status: "read",
        read_at: new Date().toISOString()
      })
      .eq("business_id", businessId)
      .eq("status", "unread");

    if (error) {
      console.error("Failed to mark all notifications as read:", error);
      return NextResponse.json({ error: "Erro ao atualizar notificações." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Todas as notificações marcadas como lidas." });
  } catch (err) {
    console.error("Notifications Read All PATCH exception:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
