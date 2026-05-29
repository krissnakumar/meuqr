"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
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

      // Fetch profiles for each member
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
      // First, find the user by email
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.trim())
        .single();

      if (!profiles) {
        alert("Usuário não encontrado. Certifique-se de que o email está correto.");
        return;
      }

      const { error } = await supabase.from("business_members").insert({
        business_id: businessId,
        user_id: profiles.id,
        role: inviteRole,
      });

      if (error) {
        if (error.code === "23505") {
          alert("Este usuário já é membro deste negócio.");
        } else {
          alert("Erro ao convidar membro.");
        }
        return;
      }

      setInviteEmail("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    await supabase.from("business_members").delete().eq("id", memberId);
    setMembers(members.filter((m) => m.id !== memberId));
  }

  async function changeRole(memberId: string, newRole: string) {
    await supabase.from("business_members").update({ role: newRole }).eq("id", memberId);
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
  }

  const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
    owner: { label: "Proprietário", icon: Crown, color: "text-yellow-500" },
    admin: { label: "Admin", icon: ShieldCheck, color: "text-blue-500" },
    staff: { label: "Staff", icon: Shield, color: "text-gray-500" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      <h1 className="text-2xl font-bold text-[#111827] mb-2">Equipe</h1>
      <p className="text-gray-500 mb-8">Gerencie os membros da sua equipe</p>

      {/* Invite form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Convidar Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="inviteEmail">Email do usuário</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "staff")}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              variant="accent"
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
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
        </CardContent>
      </Card>

      {/* Members list */}
      <div className="space-y-3">
        {/* Owner */}
        {business && (
          <Card className="border-2 border-yellow-100 bg-yellow-50/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#111827]">Proprietário</p>
                    <p className="text-xs text-gray-400">ID: {business.owner_id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Owner
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members */}
        {members.map((member) => {
          const role = roleConfig[member.role] || roleConfig.staff;
          const RoleIcon = role.icon;

          return (
            <Card key={member.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">
                        {member.profile?.full_name || "Sem nome"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {member.profile?.email || "Email desconhecido"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Role selector (for non-owner members) */}
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member.id, e.target.value)}
                      className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {members.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Nenhum membro na equipe
              </h3>
              <p className="text-sm text-gray-500">
                Convide pessoas para ajudar a gerenciar este negócio.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
