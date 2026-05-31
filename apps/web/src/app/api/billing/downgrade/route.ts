import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
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
