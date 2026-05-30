"use client";

import { useEffect, useState } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@meuqr/ui";
import { Users, Search, Filter, Shield, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BusinessAdminView {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [businesses, setBusinesses] = useState<BusinessAdminView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, slug, owner_id, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
          
        if (data) setBusinesses(data);
      } catch (err) {
        console.error("Error loading businesses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, []);

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
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou slug..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl bg-white shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                  <th className="py-4 px-6">Negócio</th>
                  <th className="py-4 px-6">URL / Slug</th>
                  <th className="py-4 px-6">ID do Proprietário</th>
                  <th className="py-4 px-6">Data de Criação</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      Carregando dados...
                    </td>
                  </tr>
                ) : businesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      Nenhum negócio encontrado.
                    </td>
                  </tr>
                ) : (
                  businesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{biz.name}</td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500">{biz.slug}</td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs truncate max-w-[150px]" title={biz.owner_id}>{biz.owner_id}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(biz.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
