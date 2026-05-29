"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  QrCode,
  Loader2,
  Search,
  ExternalLink,
  Edit3,
  CheckCircle2,
  XCircle,

} from "lucide-react";

interface QRWithBusiness {
  id: string;
  short_code: string;
  title: string | null;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  business_id: string;
  business_name: string;
  business_slug: string;
}

export default function AllQRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadQRCodes();
  }, []);

  async function loadQRCodes() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("owner_id", user.id);

      if (!businesses?.length) {
        setLoading(false);
        return;
      }

      const bizIds = businesses.map((b) => b.id);
      const bizMap = new Map(businesses.map((b) => [b.id, b]));

      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("*")
        .in("business_id", bizIds)
        .order("created_at", { ascending: false });

      const enriched: QRWithBusiness[] = (qrs || []).map((qr) => {
        const biz = bizMap.get(qr.business_id);
        return {
          id: qr.id,
          short_code: qr.short_code,
          title: qr.title,
          is_active: qr.is_active,
          scan_count: qr.scan_count,
          created_at: qr.created_at,
          business_id: qr.business_id,
          business_name: biz?.name || "Desconhecido",
          business_slug: biz?.slug || "",
        };
      });

      setQrCodes(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(qrId: string, current: boolean) {
    await supabase.from("qr_codes").update({ is_active: !current }).eq("id", qrId);
    setQrCodes(qrCodes.map((qr) => (qr.id === qrId ? { ...qr, is_active: !current } : qr)));
  }

  const filtered = qrCodes.filter(
    (qr) =>
      (qr.title || qr.short_code).toLowerCase().includes(search.toLowerCase()) ||
      qr.business_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">QR Codes</h1>
        <p className="text-gray-500 mt-1">
          {qrCodes.length} QR code(s) no total
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, código ou negócio..."
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {search ? "Nenhum QR code encontrado" : "Nenhum QR code gerado"}
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? "Tente alterar sua busca."
                : "Crie uma página para gerar QR codes automaticamente."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((qr) => (
            <div
              key={qr.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#111827]">
                      {qr.title || qr.short_code}
                    </p>
                    <Badge
                      variant={qr.is_active ? "accent" : "outline"}
                      className="text-[10px]"
                    >
                      {qr.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <StoreIcon />
                      {qr.business_name}
                    </span>
                    <span>/q/{qr.short_code}</span>
                    <span className="flex items-center gap-1">
                      <EyeIcon />
                      {qr.scan_count} scans
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(qr.id, qr.is_active)}
                  className="p-2 text-gray-400 hover:text-[#111827] transition-colors"
                  title={qr.is_active ? "Desativar" : "Ativar"}
                >
                  {qr.is_active ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                </button>
                <Link href={`/dashboard/business/${qr.business_id}/qr/${qr.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/q/${qr.short_code}`} target="_blank">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="w-4 h-4" />
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

function StoreIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4v2H3V7zM3 9v9a2 2 0 002 2h14a2 2 0 002-2V9M9 21V13h6v8" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
