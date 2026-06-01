"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  Briefcase,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  Sparkles,
  Search,
} from "lucide-react";

interface Service {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  item_type: string;
  is_available: boolean;
  sort_order: number;
  metadata: any;
  created_at: string;
  section_name?: string;
  page_title?: string;
}

export default function ServicesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [services, setServices] = useState<Service[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data: pages } = await supabase
        .from("pages")
        .select("id, title")
        .eq("business_id", businessId);

      const pageIds = pages?.map((p) => p.id) || [];

      let serviceItems: Service[] = [];

      if (pageIds.length > 0) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, page_id")
          .in("page_id", pageIds);

        const sectionIds = sections?.map((s) => s.id) || [];

        if (sectionIds.length > 0) {
          const { data: items } = await supabase
            .from("items")
            .select("*")
            .in("section_id", sectionIds)
            .eq("item_type", "service")
            .order("name");

          const pageMap = new Map(pages!.map((p) => [p.id, p.title]));
          const sectionMap = new Map(sections!.map((s) => [s.id, { name: s.name, page_id: s.page_id }]));

          serviceItems = (items || []).map((item) => {
            const section = sectionMap.get(item.section_id);
            const pageTitle = section ? pageMap.get(section.page_id) : undefined;
            return {
              ...item,
              section_name: section?.name || "Sem categoria",
              page_title: pageTitle || "Sem página",
            } as Service;
          });
        }
      }

      setServices(serviceItems);
    } catch (err) {
      console.error("Failed to load services:", err);
      toast.error("Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from("items").update({ is_available: !current }).eq("id", id);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_available: !current } : s))
    );
    toast.success(!current ? "Serviço ativado" : "Serviço desativado");
  }

  const stats = {
    total: services.length,
    active: services.filter((s) => s.is_available).length,
  };

  const filtered = services.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in-up">
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Serviços
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie os serviços oferecidos pelo seu negócio{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            {stats.total} serviço(s)
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total de Serviços", value: stats.total, icon: Briefcase, bg: "from-blue-50 to-indigo-50", color: "text-blue-600" },
          { label: "Ativos", value: stats.active, icon: Eye, bg: "from-emerald-50 to-green-50", color: "text-emerald-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Search */}
      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Services list */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {search ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {search
                ? "Tente alterar os termos de pesquisa."
                : "Crie um serviço em uma página do seu negócio para aparecer aqui."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((service) => (
            <GlassCard key={service.id} className="overflow-hidden">
              <GlassCardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-800">{service.name}</h3>
                      <Badge variant={service.is_available ? "emerald" : "muted"} className="text-[10px]">
                        {service.is_available ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    {service.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {service.section_name && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {service.section_name}
                        </span>
                      )}
                      {service.page_title && (
                        <span className="text-gray-300">• {service.page_title}</span>
                      )}
                      <span className="text-gray-300">
                        Criado em {new Date(service.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {service.price !== null && (
                      <p className="text-lg font-bold text-slate-800">
                        R$ {service.price.toFixed(2)}
                      </p>
                    )}
                    <button
                      onClick={() => toggleAvailability(service.id, service.is_available)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                        service.is_available
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                      title={service.is_available ? "Desativar" : "Ativar"}
                    >
                      {service.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
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
