import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { UPLOAD_LIMITS } from "@meuqr/shared";
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { validateUpload, sanitizeFileName, generateStoragePath } from "@/lib/upload";
import { ERR, API_SUCCESS } from "@meuqr/shared";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Rate limit check (strict for uploads)
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`upload:${ip}`, RATE_LIMIT_CONFIGS.fileUpload);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: ERR.TOO_MANY_REQUESTS },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Verify authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Not setting cookies in API route
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERR.NOT_AUTHENTICATED }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const businessId = formData.get("businessId") as string | null;

    if (!file) {
      return NextResponse.json({ error: ERR.NO_FILE }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: ERR.MISSING_BUSINESS_ID }, { status: 400 });
    }

    // Verify the user owns this business
    const { data: business } = await supabase
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

    // Validate file type and size
    const validation = validateUpload({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate safe file path
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${businessId}/${user.id}/${Date.now()}-${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("business-assets")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: ERR.UPLOAD_ERROR }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("business-assets")
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl || "";

    // Record file metadata in database
    const { data: record, error: recordError } = await supabase
      .from("storage_files")
      .insert({
        business_id: businessId,
        file_name: safeName,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        public_url: publicUrl,
        uploaded_by: user.id,
      })
      .select("id, public_url, file_name, file_type")
      .single();

    if (recordError) {
      console.error("Error recording file metadata:", recordError);
      // File uploaded but metadata not saved — still return the URL
      return NextResponse.json({
        url: publicUrl,
        warning: API_SUCCESS.UPLOAD_WARNING,
      });
    }

    return NextResponse.json({
      id: record.id,
      url: record.public_url,
      fileName: record.file_name,
      fileType: record.file_type,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: ERR.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
