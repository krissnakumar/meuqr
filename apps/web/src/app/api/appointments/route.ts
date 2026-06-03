import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ERR, appointmentSchema } from "@meuqr/shared";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const body = await req.json();

    // Validate request body using appointmentSchema
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || ERR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      appointmentDate,
      startTime,
      endTime,
      notes,
      honeypot,
    } = parsed.data;
    const { businessId, staffId, customFields } = body;

    // Spam honeypot detection
    if (honeypot) {
      return NextResponse.json({ error: "Spam detectado." }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: "Faltando o ID da empresa." }, { status: 400 });
    }

    // Check if business exists, is active, and has appointments module enabled
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("is_active")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
    }

    if (!business.is_active) {
      return NextResponse.json({ error: "Este estabelecimento está inativo." }, { status: 403 });
    }

    // Verify appointments module is enabled
    const { data: enabledModules } = await supabaseAdmin
      .from("business_enabled_modules")
      .select("modules(slug)")
      .eq("business_id", businessId)
      .eq("enabled", true);

    const hasModule = enabledModules?.some((m: any) => m.modules?.slug === "appointments");
    if (!hasModule) {
      return NextResponse.json({ error: "O módulo de agendamentos está desativado para esta empresa." }, { status: 403 });
    }

    // Calculate end time
    let calculatedEndTime = endTime || startTime;
    if (serviceId && !endTime) {
      const { data: svc } = await supabase
        .from("appointment_services")
        .select("duration_minutes")
        .eq("id", serviceId)
        .single();
        
      if (svc?.duration_minutes) {
        const [hours, mins] = startTime.split(":");
        const dateObj = new Date();
        dateObj.setHours(parseInt(hours), parseInt(mins));
        dateObj.setMinutes(dateObj.getMinutes() + svc.duration_minutes);
        calculatedEndTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      }
    }

    // Insert appointment
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        business_id: businessId,
        service_id: serviceId === "default" ? null : (serviceId || null),
        staff_id: staffId || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: calculatedEndTime,
        notes: notes || null,
        custom_fields: customFields || {},
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error (Appointments):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error (Appointments):", error);
    return NextResponse.json(
      { error: ERR.INTERNAL_SERVER_ERROR },
      { status: 500 }
    );
  }
}
