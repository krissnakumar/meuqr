"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Power,
  PowerOff,
  Plus,
  Edit3,
  Save,
  Trash2,
  Mail,
  Phone,
  User,
} from "lucide-react";

interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AppointmentsStaffPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      const { data: staffData } = await supabase
        .from("staff_members")
        .select("*")
        .eq("business_id", businessId)
        .order("name");

      setStaff(staffData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error("Digite o nome do profissional");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("staff_members")
        .insert({
          business_id: businessId,
          name: newName.trim(),
          role: newRole.trim() || null,
          email: newEmail.trim() || null,
          phone: newPhone.trim() || null,
          is_active: newActive,
        })
        .select()
        .single();

      if (error) throw error;

      setStaff((prev) => [data as StaffMember, ...prev]);
      toast.success("Profissional cadastrado!");
      setShowNewForm(false);
      setNewName("");
      setNewRole("");
      setNewEmail("");
      setNewPhone("");
      setNewActive(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar profissional");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(memberId: string) {
    const updates: any = {};
    if (editName.trim()) updates.name = editName.trim();
    if (editRole !== undefined) updates.role = editRole.trim() || null;
    if (editEmail !== undefined) updates.email = editEmail.trim() || null;
    if (editPhone !== undefined) updates.phone = editPhone.trim() || null;

    const { error } = await supabase.from("staff_members").update(updates).eq("id", memberId);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }

    setStaff((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              name: editName.trim() || m.name,
              role: editRole.trim() || m.role,
              email: editEmail.trim() || m.email,
              phone: editPhone.trim() || m.phone,
            }
          : m
      )
    );
    setEditingId(null);
    toast.success("Profissional atualizado");
  }

  async function toggleActive(memberId: string, current: boolean) {
    await supabase.from("staff_members").update({ is_active: !current }).eq("id", memberId);
    setStaff((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, is_active: !current } : m))
    );
    toast.success(!current ? "Profissional ativado" : "Profissional desativado");
  }

  async function handleDelete(memberId: string) {
    if (!confirm("Excluir este profissional permanentemente?")) return;
    await supabase.from("staff_members").delete().eq("id", memberId);
    setStaff((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Profissional excluído");
  }

  const stats = {
    total: staff.length,
    active: staff.filter((m) => m.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando profissionais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Profissionais</h1>
            <p className="text-sm text-gray-400">Gerencie os profissionais que realizam os serviços</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowNewForm(!showNewForm);
            setEditingId(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          {showNewForm ? "Cancelar" : "Novo Profissional"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users, bg: "from-blue-50 to-indigo-50", color: "text-blue-600" },
          { label: "Ativos", value: stats.active, icon: Power, bg: "from-emerald-50 to-green-50", color: "text-emerald-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {showNewForm && (
        <GlassCard className="ring-2 ring-indigo-200 ring-offset-1">
          <GlassCardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Novo Profissional
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Especialidade</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Ex: Cabelereira"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="maria@exemplo.com"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-600">Profissional ativo</span>
              </label>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
              </button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {staff.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Cadastre os profissionais que irão atender os agendamentos.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((m) => {
            const isEditing = editingId === m.id;
            const initial = m.name.charAt(0).toUpperCase();

            return (
              <GlassCard
                key={m.id}
                className={`relative overflow-hidden transition-all ${
                  !m.is_active ? "opacity-60" : "hover:shadow-md"
                } ${isEditing ? "ring-2 ring-indigo-200" : ""}`}
              >
                <GlassCardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0 ${
                      m.is_active
                        ? "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      ) : (
                        <>
                          <h3 className="text-sm font-bold text-slate-800 truncate">{m.name}</h3>
                          {m.role && (
                            <p className="text-xs text-gray-500 truncate">{m.role}</p>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleActive(m.id, m.is_active)}
                      className={`shrink-0 p-2 rounded-lg transition-all ${
                        m.is_active
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      title={m.is_active ? "Desativar" : "Ativar"}
                    >
                      {m.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isEditing && (
                    <div className="space-y-1.5 text-xs text-gray-500">
                      {m.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </div>
                      )}
                      {m.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{m.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          placeholder="Especialidade"
                          className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Telefone"
                          className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="flex-1 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all px-3"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                      <Badge variant={m.is_active ? "emerald" : "muted"}>
                        {m.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      <div className="flex-1" />
                      <button
                        onClick={() => {
                          setEditingId(m.id);
                          setEditName(m.name);
                          setEditRole(m.role || "");
                          setEditEmail(m.email || "");
                          setEditPhone(m.phone || "");
                          setShowNewForm(false);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
