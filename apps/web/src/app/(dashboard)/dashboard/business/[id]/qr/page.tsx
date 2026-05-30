"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, QrCode, Plus, ExternalLink, Scan } from "lucide-react";

interface QRCode {
  id: string;
  short_code: string;
  title: string | null;
  scan_count: number;
  created_at: string;
  page_id: string | null;
}

export default function BusinessQRListPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando QR codes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">QR Codes</h1>
          <p className="text-sm text-gray-400">{qrCodes.length} QR code(s) gerados</p>
        </div>
      </div>

      {qrCodes.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum QR code ainda</h3>
            <p className="text-sm text-gray-400">Crie uma página primeiro para gerar um QR code automaticamente.</p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {qrCodes.map((qr) => (
            <GlassCard key={qr.id} className="group-hover:shadow-md transition-all">
              <GlassCardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {qr.title || qr.short_code}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="font-mono">/q/{qr.short_code}</span>
                        <span className="flex items-center gap-1">
                          <Scan className="w-3 h-3" />
                          {qr.scan_count} scans
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/business/${businessId}/qr/${qr.id}`}>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Personalizar
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
