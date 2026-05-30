import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;

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

    // 2. Fetch the notification to identify its business scope
    const { data: notification } = await supabase
      .from("notifications")
      .select("business_id")
      .eq("id", id)
      .maybeSingle();

    if (!notification) {
      return NextResponse.json({ error: "Notificação não encontrada." }, { status: 404 });
    }

    // Verify user membership or business ownership
    const { data: isAuthorized } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", notification.business_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!isAuthorized) {
      const { data: member } = await supabase
        .from("business_members")
        .select("id")
        .eq("business_id", notification.business_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!member) {
        return NextResponse.json({ error: "Acesso negado para este negócio." }, { status: 403 });
      }
    }

    // 4. Update status to 'read'
    const { data: updated, error } = await supabase
      .from("notifications")
      .update({
        status: "read",
        read_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Erro ao atualizar notificação." }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: updated });
  } catch (err) {
    console.error("Notifications Read PATCH exception:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
