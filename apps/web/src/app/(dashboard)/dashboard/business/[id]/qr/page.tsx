"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, QrCode, Plus, ExternalLink } from "lucide-react";

export default function BusinessQRListPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRs();
  }, [businessId]);

  async function loadQRs() {
    try {
      const { data } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setQrCodes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-[#111827] mb-2">QR Codes</h1>
      <p className="text-gray-500 mb-8">
        {qrCodes.length} QR code(s) gerados
      </p>

      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              Nenhum QR code ainda
            </h3>
            <p className="text-sm text-gray-500">
              Crie uma página primeiro para gerar um QR code automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#111827]/5 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-[#111827]" />
                </div>
                <div>
                  <p className="font-medium text-[#111827]">
                    {qr.title || qr.short_code}
                  </p>
                  <p className="text-xs text-gray-400">
                    /q/{qr.short_code} · {qr.scan_count} scans
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/business/${businessId}/qr/${qr.id}`}>
                  <Button variant="default" size="sm">
                    Personalizar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
