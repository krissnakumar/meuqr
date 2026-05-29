"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  QrCode,
  FileText,
  Plus,
  Eye,
  ExternalLink,
  Edit3,
  Trash2,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

interface BusinessFull {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  subscription_tier: string;
  is_active: boolean;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessFull | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalQuoteRequests, setTotalQuoteRequests] = useState(0);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: bizPages } = await supabase
        .from("pages")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      const { data: bizQrs } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      // Load counts for management nav
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: membersCount } = await supabase
        .from("business_members")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: quotesCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      setBusiness(biz);
      setPages(bizPages || []);
      setQrCodes(bizQrs || []);
      setTotalOrders(ordersCount || 0);
      setTotalLeads(leadsCount || 0);
      setTotalMembers(membersCount || 0);
      setTotalQuoteRequests(quotesCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness() {
    if (!confirm("Tem certeza que deseja excluir este negócio?")) return;
    const { error } = await supabase.from("businesses").delete().eq("id", businessId);
    if (error) {
      toast.error("Erro ao excluir negócio");
      return;
    }
    toast.success("Negócio excluído");
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Negócio não encontrado</p>
        <Link href="/dashboard" className="text-[#00C853] hover:underline mt-2 block">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Painel
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#111827]/5 flex items-center justify-center overflow-hidden">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl font-bold text-[#111827]">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{business.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="muted">{business.category.replace("_", " ")}</Badge>
              <Badge variant={business.subscription_tier === "free" ? "outline" : "accent"}>
                {business.subscription_tier}
              </Badge>
              <Link
                href={`/${business.slug}`}
                target="_blank"
                className="text-xs text-gray-400 hover:text-[#00C853] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver página
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/business/${businessId}/setup`}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nova Página
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={deleteBusiness} className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Pages */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas</CardTitle>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">
                    Nenhuma página criada ainda
                  </p>
                  <Link href={`/dashboard/business/${businessId}/setup`}>
                    <Button variant="accent" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Criar Página
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${page.is_published ? "bg-[#00C853]" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-sm font-medium text-[#111827]">
                            {page.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            /{page.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/business/${businessId}/pages/${page.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/${business.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCodes.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Gere um QR code após criar uma página
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {qrCodes.map((qr) => (
                    <div
                      key={qr.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {qr.title || qr.short_code}
                        </p>
                        <p className="text-xs text-gray-400">
                          /q/{qr.short_code} · {qr.scan_count} scans
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/business/${businessId}/qr/${qr.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Business Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">WhatsApp:</span>
                <p className="text-[#111827]">{business.whatsapp || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400">Instagram:</span>
                <p className="text-[#111827]">{business.instagram || "—"}</p>
              </div>
              <div>
                <span className="text-gray-400">Slug:</span>
                <p className="text-[#111827]">/{business.slug}</p>
              </div>
              {business.description && (
                <div>
                  <span className="text-gray-400">Descrição:</span>
                  <p className="text-[#111827]">{business.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                <Link
                  href={`/dashboard/business/${businessId}/analytics`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Analytics</p>
                      <p className="text-xs text-gray-400">Scans, cliques e métricas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/orders`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Pedidos</p>
                      <p className="text-xs text-gray-400">Gerenciar pedidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalOrders > 0 && (
                      <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        {totalOrders}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/leads`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Leads</p>
                      <p className="text-xs text-gray-400">Contatos recebidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalLeads > 0 && (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {totalLeads}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/members`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Equipe</p>
                      <p className="text-xs text-gray-400">Membros e permissões</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalMembers > 0 && (
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {totalMembers}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/quote-requests`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Orçamentos</p>
                      <p className="text-xs text-gray-400">Solicitações de clientes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalQuoteRequests > 0 && (
                      <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        {totalQuoteRequests}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Link href={`/dashboard/business/${businessId}/setup`}>
                <Button variant="default" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Página usando Modelo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
