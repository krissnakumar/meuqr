"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Home,
  ArrowLeft,
  Loader2,
  Sparkles,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
} from "lucide-react";

interface Property {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  price: number | null;
  property_type: "house" | "apartment" | "land" | "commercial";
  status: "available" | "sold" | "rented";
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
}

const propertyTypeLabel: Record<string, string> = {
  house: "Casa",
  apartment: "Apartamento",
  land: "Terreno",
  commercial: "Comercial",
};

const propertyTypeColor: Record<string, string> = {
  house: "bg-blue-50 text-blue-700 border-blue-200",
  apartment: "bg-purple-50 text-purple-700 border-purple-200",
  land: "bg-emerald-50 text-emerald-700 border-emerald-200",
  commercial: "bg-amber-50 text-amber-700 border-amber-200",
};

const statusLabel: Record<string, string> = {
  available: "Disponível",
  sold: "Vendido",
  rented: "Alugado",
};

const statusVariant: Record<string, string> = {
  available: "emerald",
  sold: "rose",
  rented: "indigo",
};

export default function PropertiesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [properties, setProperties] = useState<Property[]>([]);
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
        .from("properties")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
      toast.error("Erro ao carregar imóveis.");
    } finally {
      setLoading(false);
    }
  }

  const availableCount = properties.filter((p) => p.status === "available").length;

  function formatPrice(price: number | null) {
    if (price === null) return "Sob consulta";
    return `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
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
                <Home className="w-5 h-5 text-white" />
              </div>
              Imóveis
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie seu catálogo de imóveis de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {properties.length} imóveis · {availableCount} disponíveis
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum imóvel cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre imóveis para gerenciar seu catálogo.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property, idx) => (
            <Link
              key={property.id}
              href={`/dashboard/business/${businessId}/properties/${property.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${propertyTypeColor[property.property_type] || "bg-slate-50 text-slate-600"}`}>
                        {propertyTypeLabel[property.property_type] || property.property_type}
                      </span>
                      <Badge variant={statusVariant[property.status] as any || "slate"}>
                        {statusLabel[property.status] || property.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {property.title}
                      </h4>

                      <p className="text-lg font-bold text-indigo-600 mt-1">
                        {formatPrice(property.price)}
                      </p>

                      {property.location && (
                        <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {property.location}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        {property.bedrooms !== null && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-gray-400" />
                            {property.bedrooms} quartos
                          </span>
                        )}
                        {property.bathrooms !== null && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5 text-gray-400" />
                            {property.bathrooms} banheiros
                          </span>
                        )}
                        {property.area !== null && (
                          <span className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5 text-gray-400" />
                            {property.area} m²
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-slate-100">
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
