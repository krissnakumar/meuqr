import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { ERR } from "@meuqr/shared";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    // Verify authentication using client-side credentials
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // Not setting cookies in API route
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERR.NOT_AUTHENTICATED }, { status: 401 });
    }

    // Verify the user owns this business
    const { data: business } = await supabaseClient
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: ERR.BUSINESS_NOT_FOUND_OR_NO_PERMISSION },
        { status: 403 }
      );
    }

    // Use service role to bypass RLS and the new trigger preventing client updates
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ subscription_tier: "free" })
      .eq("id", businessId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Downgrade Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
