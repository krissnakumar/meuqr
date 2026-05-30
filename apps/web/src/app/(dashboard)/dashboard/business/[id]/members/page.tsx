"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Label, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  Mail,
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function MembersPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
  const [inviting, setInviting] = useState(false);

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

      setBusiness(biz);
      setMembers(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail.trim()) return;
    setInviting(true);

    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.trim())
        .single();

      if (!profiles) {
        toast.error("Usuário não encontrado. Certifique-se de que o email está correto.");
        return;
      }

      const { error } = await supabase.from("business_members").insert({
        business_id: businessId,
        user_id: profiles.id,
        role: inviteRole,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este usuário já é membro deste negócio.");
        } else {
          toast.error("Erro ao convidar membro.");
        }
        return;
      }

      setInviteEmail("");
      toast.success("Membro convidado!");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
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

  async function changeRole(memberId: string, newRole: string) {
    const { error } = await supabase.from("business_members").update({ role: newRole }).eq("id", memberId);
    if (error) {
      toast.error("Erro ao alterar cargo");
      return;
    }
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    toast.success("Cargo atualizado");
  }

  const roleConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    owner: { label: "Proprietário", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    admin: { label: "Admin", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    staff: { label: "Staff", icon: Shield, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipe</h1>
          <p className="text-sm text-gray-400">Gerencie os membros da sua equipe</p>
        </div>
      </div>

      {/* Invite Form */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-500" />
            Convidar Membro
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="inviteEmail">Email do usuário</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "staff")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              variant="default"
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar
                </>
              )}
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>

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
          const role = roleConfig[member.role] || roleConfig.staff;
          const RoleIcon = role.icon;

          return (
            <GlassCard key={member.id}>
              <GlassCardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${role.bg} flex items-center justify-center shadow-sm`}>
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
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member.id, e.target.value)}
                      className="text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
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
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum membro na equipe</h3>
              <p className="text-sm text-gray-400">Convide pessoas para ajudar a gerenciar este negócio.</p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
