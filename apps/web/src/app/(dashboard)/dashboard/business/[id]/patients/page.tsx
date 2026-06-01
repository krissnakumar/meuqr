"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  HeartPulse,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  User,
} from "lucide-react";

interface Patient {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  notes: string | null;
  created_at: string;
}

export default function PatientsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [patients, setPatients] = useState<Patient[]>([]);
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
        .from("patients")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Failed to load patients:", err);
      toast.error("Erro ao carregar pacientes.");
    } finally {
      setLoading(false);
    }
  }

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
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              Pacientes
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie registros e históricos de pacientes de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {patients.length} pacientes registrados
          </div>
        </div>
      </div>

      {patients.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <HeartPulse className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum paciente cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre pacientes para gerenciar seus registros e históricos.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((patient, idx) => (
            <Link
              key={patient.id}
              href={`/dashboard/business/${businessId}/patients/${patient.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {patient.name.substring(0, 2).toUpperCase()}
                      </div>
                      {patient.gender && (
                        <Badge variant="indigo">{patient.gender === "male" ? "Masculino" : "Feminino"}</Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {patient.name}
                      </h4>

                      <div className="space-y-1 mt-2 text-xs text-gray-500">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {patient.phone}
                        </p>
                        {patient.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 truncate" />
                            {patient.email}
                          </p>
                        )}
                        {patient.birth_date && (
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(patient.birth_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {patient.notes && (
                    <p className="text-xs text-gray-400 line-clamp-2 italic border-t border-slate-100 pt-3">
                      {patient.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Cadastro: {new Date(patient.created_at).toLocaleDateString()}
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
