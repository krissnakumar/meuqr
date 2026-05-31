import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createNotification } from "@/lib/notifications";
import { ERR } from "@meuqr/shared";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    // 2. Resolve business membership scope
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: ERR.MISSING_BUSINESS_ID }, { status: 400 });
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
        return NextResponse.json({ error: ERR.ACCESS_DENIED }, { status: 403 });
      }
    }

    // 3. Fetch notifications
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: ERR.FETCH_NOTIFICATIONS_ERROR }, { status: 500 });
    }

    return NextResponse.json({ success: true, notifications });
  } catch (err) {
    console.error("Notifications GET exception:", err);      return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

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

    // Check user auth - only authenticated business members or admins can create manual alert notifications
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: ERR.UNAUTHORIZED }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, clientId, type, title, message, data, priority, channel } = body;

    if (!businessId || !type || !title || !message) {
      return NextResponse.json({ error: ERR.MISSING_REQUIRED_FIELDS }, { status: 400 });
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
        return NextResponse.json({ error: ERR.ACCESS_DENIED }, { status: 403 });
      }
    }

    const notification = await createNotification({
      businessId,
      userId: user.id,
      clientId,
      type,
      title,
      message,
      data,
      priority,
      channel,
    });

    return NextResponse.json({ success: true, notification });
  } catch (err) {
    console.error("Notifications POST exception:", err);      return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
