"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  UsersRound,
  ArrowLeft,
  Loader2,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "viewer";
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function StaffPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, owner_id")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      const { data: membersData } = await supabase
        .from("business_members")
        .select("*")
        .eq("business_id", businessId);

      const membersList = membersData || [];

      const enriched = await Promise.all(
        membersList.map(async (m) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", m.user_id)
            .single();

          return { ...m, profile };
        })
      );

      setMembers(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar equipe.");
    } finally {
      setLoading(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    const { error } = await supabase.from("business_members").delete().eq("id", memberId);
    if (error) {
      toast.error("Erro ao remover membro");
      return;
    }
    setMembers(members.filter((m) => m.id !== memberId));
    toast.success("Membro removido");
  }

  const admins = members.filter((m) => m.role === "admin").length;
  const staffCount = members.filter((m) => m.role === "staff").length;

  const roleConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    admin: { label: "Admin", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    staff: { label: "Staff", icon: Shield, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
    viewer: { label: "Visualizador", icon: Shield, color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando equipe...</p>
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
                <UsersRound className="w-5 h-5 text-white" />
              </div>
              Equipe
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie sua equipe e permissões{" "}
              <span className="font-semibold text-slate-600">{business?.name}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {members.length} membros
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{members.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{admins}</p>
            <p className="text-xs text-gray-400 mt-0.5">Admins</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{staffCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Staff</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {/* Owner */}
        {business && (
          <GlassCard className="border-2 border-amber-100 bg-gradient-to-br from-amber-50/20 to-amber-50/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            <GlassCardContent className="p-5 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Proprietário</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {business.owner_id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <Badge variant="amber">
                  <Crown className="w-3 h-3 mr-1" />
                  Owner
                </Badge>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Members */}
        {members.map((member) => {
          const role = roleConfig[member.role] || roleConfig.viewer;
          const RoleIcon = role.icon;

          return (
            <GlassCard key={member.id}>
              <GlassCardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${role.bg} flex items-center justify-center shadow-sm`}
                    >
                      <RoleIcon className={`w-5 h-5 ${role.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {member.profile?.full_name || "Sem nome"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {member.profile?.email || "Email desconhecido"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        member.role === "admin"
                          ? "indigo"
                          : member.role === "staff"
                          ? "secondary"
                          : "muted"
                      }
                    >
                      <RoleIcon className={`w-3 h-3 mr-1 ${role.color}`} />
                      {role.label}
                    </Badge>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          );
        })}

        {members.length === 0 && (
          <GlassCard>
            <GlassCardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <UsersRound className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum membro na equipe</h3>
              <p className="text-sm text-gray-400">
            Adicione membros para ajudar a gerenciar este negócio.
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
