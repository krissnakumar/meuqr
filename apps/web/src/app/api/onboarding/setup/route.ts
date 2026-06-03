import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createDefaultBusiness } from "@/lib/onboarding/createDefaultBusiness";

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado. Por favor faça login." }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, whatsapp, verticalSlug, answers, sampleItems } = body;

    if (!name || !slug || !whatsapp || !verticalSlug) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const result = await createDefaultBusiness({
      ownerId: user.id,
      name,
      slug,
      whatsapp,
      verticalSlug,
      answers: answers || {},
      sampleItems: Array.isArray(sampleItems) && sampleItems.length > 0 ? sampleItems : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Onboarding API error:", err);
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 });
  }
}
