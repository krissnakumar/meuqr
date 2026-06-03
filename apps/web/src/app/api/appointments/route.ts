import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ERR } from "@meuqr/shared";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
          setAll() {
            // Not setting cookies
          },
        },
      }
    );

    const {
      businessId,
      serviceId,
      staffId,
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate,
      appointmentTime,
      notes,
      customFields,
    } = await req.json();

    if (!businessId || !customerName || !customerPhone || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: ERR.MISSING_APPOINTMENT_DATA },
        { status: 400 }
      );
    }

    // Calcular end_time (simplesmente +30 mins se não houver lógica complexa de serviços)
    // Uma implementação real buscaria a duration_minutes do serviço no BD
    let endTime = appointmentTime;
    if (serviceId) {
      const { data: svc } = await supabase
        .from("appointment_services")
        .select("duration_minutes")
        .eq("id", serviceId)
        .single();
        
      if (svc?.duration_minutes) {
        const [hours, mins] = appointmentTime.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(mins));
        date.setMinutes(date.getMinutes() + svc.duration_minutes);
        endTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
      }
    }

    // Insert appointment using admin client to bypass select RLS constraint for anonymous guest
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        business_id: businessId,
        service_id: serviceId || null,
        staff_id: staffId || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        appointment_date: appointmentDate,
        start_time: appointmentTime,
        end_time: endTime,
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
      { error: ERR.INTERNAL_SERVER_ERROR_EN },
      { status: 500 }
    );
  }
}
