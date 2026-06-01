"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  UserCheck,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Professional {
  id: string;
  business_id: string;
  name: string;
  specialty: string | null;
  description: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ProfessionalsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

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

      const { data: professionalsData, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      if (error) throw error;
      setProfessionals(professionalsData || []);
    } catch (err) {
      console.error("Failed to load professionals:", err);
      toast.error("Erro ao carregar profissionais.");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = professionals.filter((p) => p.is_active).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando profissionais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Back + Header */}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              Profissionais
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Cadastre os profissionais que atendem no seu negócio{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {professionals.length} profissionais
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{professionals.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ativos</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Professionals List */}
      {professionals.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum profissional cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre os profissionais que realizam atendimentos no seu negócio.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professionals.map((prof, idx) => (
            <div
              key={prof.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300 ${
                    prof.is_active
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-100"
                      : "bg-gradient-to-r from-slate-400 to-slate-300 opacity-50"
                  }`}
                />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      {prof.photo_url ? (
                        <img
                          src={prof.photo_url}
                          alt={prof.name}
                          className="w-10 h-10 rounded-full object-cover shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                          {prof.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <Badge variant={prof.is_active ? "emerald" : "muted"}>
                        {prof.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {prof.name}
                      </h4>
                      {prof.specialty && (
                        <p className="text-sm font-medium text-indigo-600 mt-0.5">
                          {prof.specialty}
                        </p>
                      )}
                      {prof.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {prof.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  {(prof.phone || prof.email) && (
                    <div className="space-y-1.5 text-xs text-gray-500">
                      {prof.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {prof.phone}
                        </p>
                      )}
                      {prof.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400 truncate" />
                          {prof.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-2 border-t border-slate-100 text-xs text-gray-400">
                    Cadastrado em {new Date(prof.created_at).toLocaleDateString()}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
