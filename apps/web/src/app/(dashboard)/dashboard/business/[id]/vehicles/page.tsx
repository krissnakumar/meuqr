"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Car,
  ArrowLeft,
  Loader2,
  Sparkles,
  User,
  Phone,
  Calendar,
  Palette,
  Hash,
  FileText,
} from "lucide-react";

interface VehicleRecord {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  plate: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  vin: string | null;
  notes: string | null;
  created_at: string;
}

export default function VehiclesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
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
        .from("vehicle_records")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      toast.error("Erro ao carregar veículos.");
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
                <Car className="w-5 h-5 text-white" />
              </div>
              Veículos
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie registros de veículos para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {vehicles.length} veículos cadastrados
          </div>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum veículo cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Os registros de veículos dos seus clientes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle, idx) => (
            <div
              key={vehicle.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="indigo">{vehicle.plate}</Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {vehicle.customer_name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {vehicle.customer_phone}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs">
                    {vehicle.year && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {vehicle.year}
                      </p>
                    )}
                    {vehicle.color && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Palette className="w-3.5 h-3.5 text-gray-400" />
                        {vehicle.color}
                      </p>
                    )}
                    {vehicle.vin && (
                      <p className="flex items-center gap-1 text-slate-600 col-span-2 truncate">
                        <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        VIN: {vehicle.vin}
                      </p>
                    )}
                  </div>

                  {vehicle.notes && (
                    <p className="text-xs text-gray-400 italic line-clamp-2 flex items-start gap-1">
                      <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                      {vehicle.notes}
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
