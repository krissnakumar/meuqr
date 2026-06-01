"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
}

export default function ReviewsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(reviewsData || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Erro ao carregar avaliações.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar avaliação");
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(status === "approved" ? "Avaliação aprovada!" : "Avaliação rejeitada.");
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
      />
    ));
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pendente", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
    approved: { label: "Aprovado", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    rejected: { label: "Rejeitado", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
  };

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0,
    approved: reviews.filter((r) => r.status === "approved").length,
    pending: reviews.filter((r) => r.status === "pending").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando avaliações...</p>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Star className="w-5 h-5 text-white" />
              </div>
              Avaliações
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie avaliações e depoimentos dos seus clientes{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            {stats.total} avaliação(ões)
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Média", value: stats.average.toFixed(1), icon: Star, color: "text-amber-600", bg: "bg-amber-50", suffix: <div className="flex ml-1">{renderStars(Math.round(stats.average))}</div> },
          { label: "Aprovadas", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rejeitadas", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center">
                  <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                  {(stat as any).suffix}
                </div>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todas", count: stats.total },
          { key: "pending", label: "Pendentes", count: stats.pending },
          { key: "approved", label: "Aprovadas", count: stats.approved },
          { key: "rejected", label: "Rejeitadas", count: stats.rejected },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === s.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma avaliação recebida ainda</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As avaliações feitas pelos clientes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const status = statusConfig[review.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <GlassCard key={review.id}>
                <GlassCardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-sm font-bold text-amber-700 shadow-sm">
                          {review.customer_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{review.customer_name}</p>
                          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                          {review.comment}
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <Badge className={`${status.color} border`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>

                      {review.status === "pending" && (
                        <div className="flex gap-1.5 mt-1">
                          <button
                            onClick={() => updateStatus(review.id, "approved")}
                            className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium transition-all flex items-center gap-1 border border-emerald-200"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => updateStatus(review.id, "rejected")}
                            className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-all flex items-center gap-1 border border-red-200"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
