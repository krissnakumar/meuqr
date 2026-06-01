"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  UserRound,
  ArrowLeft,
  Loader2,
  Sparkles,
  ChevronRight,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";

interface Teacher {
  id: string;
  business_id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export default function TeachersPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
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

      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      toast.error("Erro ao carregar professores.");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = teachers.filter((t) => t.is_active).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
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
                <UserRound className="w-5 h-5 text-white" />
              </div>
              Professores
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie perfis de professores e instrutores de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {teachers.length} professores · {activeCount} ativos
          </div>
        </div>
      </div>

      {teachers.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserRound className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum professor cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre professores e instrutores para sua instituição.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher, idx) => (
            <Link
              key={teacher.id}
              href={`/dashboard/business/${businessId}/teachers/${teacher.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {teacher.name.substring(0, 2).toUpperCase()}
                      </div>
                      <Badge variant={teacher.is_active ? "emerald" : "muted"}>
                        {teacher.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {teacher.name}
                      </h4>

                      {teacher.specialty && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-indigo-500 font-medium">
                          <BookOpen className="w-3.5 h-3.5" />
                          {teacher.specialty}
                        </p>
                      )}

                      {teacher.bio && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {teacher.bio}
                        </p>
                      )}

                      <div className="space-y-1 mt-2 text-xs text-gray-500">
                        {teacher.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {teacher.email}
                          </p>
                        )}
                        {teacher.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {teacher.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-slate-100">
                    <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center ml-auto">
                      Perfil completo
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
