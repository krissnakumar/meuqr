"use client";

import { useEffect, useState } from "react";
import { GlassCard, GlassCardContent, Badge, Button } from "@meuqr/ui";
import { Users, Search, Filter, Shield, MoreVertical, CheckCircle2, XCircle, Trash2, Mail, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

interface BusinessAdminView {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  is_active: boolean;
  subscription_tier: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<BusinessAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select(`
          id, 
          name, 
          slug, 
          owner_id, 
          created_at, 
          is_active,
          subscription_tier,
          profiles(email, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) throw error;
      if (data) {
        // Suppress TS errors regarding joining response format
        setBusinesses(data as unknown as BusinessAdminView[]);
      }
    } catch (err) {
      console.error("Error loading businesses:", err);
      toast.error("Erro ao carregar usuários/negócios");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBusinessStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setActiveMenu(null);
    
    // Optimistic UI update
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_active: newStatus } : b));
    
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ is_active: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      toast.success(`Negócio ${newStatus ? 'ativado' : 'suspenso'} com sucesso.`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar o status do negócio.");
      // Revert UI
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_active: currentStatus } : b));
    }
  }

  async function handleDelete(id: string) {
    setActiveMenu(null);
    if (!confirm("Tem certeza que deseja excluir permanentemente este negócio? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      setBusinesses(prev => prev.filter(b => b.id !== id));
      toast.success("Negócio excluído com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir o negócio.");
    }
  }

  const filteredBusinesses = businesses.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      (b.profiles?.email && b.profiles.email.toLowerCase().includes(q)) ||
      (b.profiles?.full_name && b.profiles.full_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-emerald-600 w-7 h-7" />
            Gerenciamento de Negócios / Usuários
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualização dos negócios cadastrados na plataforma.
          </p>
        </div>
      </div>

      <GlassCard>
        <GlassCardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, slug, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl bg-white shadow-sm transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                  <th className="py-4 px-6">Negócio</th>
                  <th className="py-4 px-6">Proprietário</th>
                  <th className="py-4 px-6 text-center">Plano</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        {t('business.loading_data')}
                      </div>
                    </td>
                  </tr>
                ) : filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400">
                      Nenhum negócio ou usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{biz.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">/{biz.slug}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {biz.profiles?.full_name ? biz.profiles.full_name.charAt(0).toUpperCase() : biz.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {biz.profiles?.full_name || "Usuário"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {biz.profiles?.email || biz.owner_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge 
                          variant={
                            biz.subscription_tier === 'pro' ? 'indigo' : 
                            biz.subscription_tier === 'business' ? 'amber' : 'muted'
                          } 
                          className="capitalize text-xs"
                        >
                          {biz.subscription_tier}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          biz.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {biz.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {biz.is_active ? "Ativo" : "Suspenso"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === biz.id ? null : biz.id)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeMenu === biz.id && (
                          <div className="absolute right-6 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95">
                            <Link href={`/dashboard/business/${biz.id}`} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                              Acessar Painel
                            </Link>
                            <button 
                              onClick={() => toggleBusinessStatus(biz.id, biz.is_active)}
                              className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              {biz.is_active ? "Suspender Negócio" : "Reativar Negócio"}
                            </button>
                            <button 
                              onClick={() => handleDelete(biz.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir Permanentemente
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
