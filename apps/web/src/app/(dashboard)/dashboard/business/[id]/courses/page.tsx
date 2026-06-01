"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  BookOpen,
  ArrowLeft,
  Loader2,
  Sparkles,
  ChevronRight,
  DollarSign,
  Calendar,
  Users,
  Monitor,
} from "lucide-react";

interface Course {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  course_type: "online" | "presential";
  status: "active" | "inactive";
  max_students: number | null;
  start_date: string | null;
  created_at: string;
}

export default function CoursesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [courses, setCourses] = useState<Course[]>([]);
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
        .from("courses")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Erro ao carregar cursos.");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = courses.filter((c) => c.status === "active").length;

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
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Cursos
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie seus cursos e turmas de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {courses.length} cursos · {activeCount} ativos
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum curso cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre cursos e turmas para sua instituição.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, idx) => (
            <Link
              key={course.id}
              href={`/dashboard/business/${businessId}/courses/${course.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {course.title.substring(0, 2).toUpperCase()}
                      </div>
                      <Badge variant={course.status === "active" ? "emerald" : "muted"}>
                        {course.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {course.title}
                      </h4>

                      {course.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        {course.price !== null && (
                          <span className="flex items-center gap-1 font-semibold text-indigo-600">
                            <DollarSign className="w-3.5 h-3.5" />
                            R$ {course.price.toFixed(2)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-gray-400" />
                          {course.course_type === "online" ? "Online" : "Presencial"}
                        </span>
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {course.duration}
                          </span>
                        )}
                        {course.max_students && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            {course.max_students} vagas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-slate-100">
                    {course.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Início: {new Date(course.start_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center ml-auto">
                      Detalhes
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
