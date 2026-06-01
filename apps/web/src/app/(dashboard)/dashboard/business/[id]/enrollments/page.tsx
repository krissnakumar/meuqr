"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  GraduationCap,
  ArrowLeft,
  Loader2,
  Sparkles,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  BookOpen,
} from "lucide-react";

interface Enrollment {
  id: string;
  business_id: string;
  course_id: string;
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  status: "active" | "completed" | "cancelled";
  enrolled_at: string;
  created_at: string;
}

const statusLabel: Record<string, string> = {
  active: "Ativa",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const statusVariant: Record<string, string> = {
  active: "emerald",
  completed: "indigo",
  cancelled: "rose",
};

export default function EnrollmentsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, string>>({});
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

      const { data: enrollData, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnrollments(enrollData || []);

      const courseIds = [...new Set((enrollData || []).map((e) => e.course_id))];
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        const courseMap: Record<string, string> = {};
        (coursesData || []).forEach((c) => {
          courseMap[c.id] = c.title;
        });
        setCourses(courseMap);
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      toast.error("Erro ao carregar matrículas.");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = enrollments.filter((e) => e.status === "active").length;

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
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              Matrículas
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie matrículas e inscrições em cursos de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {enrollments.length} matrículas · {activeCount} ativas
          </div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma matrícula realizada</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As matrículas dos alunos aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enrollment, idx) => (
            <Link
              key={enrollment.id}
              href={`/dashboard/business/${businessId}/enrollments/${enrollment.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {enrollment.student_name.substring(0, 2).toUpperCase()}
                      </div>
                      <Badge variant={statusVariant[enrollment.status] as any || "slate"}>
                        {statusLabel[enrollment.status] || enrollment.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {enrollment.student_name}
                      </h4>

                      <div className="space-y-1 mt-2 text-xs text-gray-500">
                        {enrollment.student_email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {enrollment.student_email}
                          </p>
                        )}
                        {enrollment.student_phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {enrollment.student_phone}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                          {courses[enrollment.course_id] || "Curso não encontrado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(enrollment.enrolled_at || enrollment.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center">
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
