"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Stethoscope,
  Clock,
  DollarSign,
  Power,
  PowerOff,
  Plus,
  Edit3,
  Save,
  Trash2,
} from "lucide-react";

interface AppointmentService {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export default function AppointmentsServicesPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [services, setServices] = useState<AppointmentService[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newPrice, setNewPrice] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      const { data: servicesData } = await supabase
        .from("appointment_services")
        .select("*")
        .eq("business_id", businessId)
        .order("name");

      setServices(servicesData || []);
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
      toast.error("Digite o nome do serviço");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("appointment_services")
        .insert({
          business_id: businessId,
          name: newName.trim(),
          description: newDescription.trim() || null,
          duration_minutes: parseInt(newDuration) || 30,
          price: newPrice ? parseFloat(newPrice) : null,
          is_active: newActive,
        })
        .select()
        .single();

      if (error) throw error;

      setServices((prev) => [data as AppointmentService, ...prev]);
      toast.success("Serviço criado!");
      setShowNewForm(false);
      setNewName("");
      setNewDescription("");
      setNewDuration("30");
      setNewPrice("");
      setNewActive(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar serviço");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(serviceId: string) {
    const updates: any = {};
    if (editName.trim()) updates.name = editName.trim();
    if (editDescription !== undefined) updates.description = editDescription.trim() || null;
    if (editDuration) updates.duration_minutes = parseInt(editDuration);
    if (editPrice) updates.price = parseFloat(editPrice);
    else updates.price = null;

    const { error } = await supabase.from("appointment_services").update(updates).eq("id", serviceId);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }

    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              name: editName.trim() || s.name,
              description: editDescription.trim() || s.description,
              duration_minutes: editDuration ? parseInt(editDuration) : s.duration_minutes,
              price: editPrice ? parseFloat(editPrice) : s.price,
            }
          : s
      )
    );
    setEditingId(null);
    toast.success("Serviço atualizado");
  }

  async function toggleActive(serviceId: string, current: boolean) {
    await supabase.from("appointment_services").update({ is_active: !current }).eq("id", serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, is_active: !current } : s))
    );
    toast.success(!current ? "Serviço ativado" : "Serviço desativado");
  }

  async function handleDelete(serviceId: string) {
    if (!confirm("Excluir este serviço permanentemente?")) return;
    await supabase.from("appointment_services").delete().eq("id", serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    toast.success("Serviço excluído");
  }

  const stats = {
    total: services.length,
    active: services.filter((s) => s.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Serviços de Agendamento</h1>
            <p className="text-sm text-gray-400">Gerencie os serviços oferecidos para agendamento</p>
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
          {showNewForm ? "Cancelar" : "Novo Serviço"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Stethoscope, bg: "from-blue-50 to-indigo-50", color: "text-blue-600" },
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
              Novo Serviço
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Corte de Cabelo"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Duração (minutos)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="30"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Preço (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Descrição</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição do serviço..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
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
                <span className="text-xs font-medium text-slate-600">Serviço ativo</span>
              </label>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Serviço"}
              </button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {services.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum serviço de agendamento</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Crie seu primeiro serviço para que os clientes possam agendar.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const isEditing = editingId === s.id;

            return (
              <GlassCard
                key={s.id}
                className={`relative overflow-hidden transition-all ${
                  !s.is_active ? "opacity-60" : "hover:shadow-md"
                } ${isEditing ? "ring-2 ring-indigo-200" : ""}`}
              >
                <GlassCardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
                        {s.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => toggleActive(s.id, s.is_active)}
                      className={`shrink-0 p-2 rounded-lg transition-all ${
                        s.is_active
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      title={s.is_active ? "Desativar" : "Ativar"}
                    >
                      {s.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {isEditing && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(s.id)}
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
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{s.duration_minutes} min</span>
                        {s.price !== null && (
                          <>
                            <span className="text-slate-200">|</span>
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <span>R$ {Number(s.price).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                        <Badge variant={s.is_active ? "emerald" : "muted"}>
                          {s.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <div className="flex-1" />
                        <button
                          onClick={() => {
                            setEditingId(s.id);
                            setEditName(s.name);
                            setEditDescription(s.description || "");
                            setEditDuration(s.duration_minutes.toString());
                            setEditPrice(s.price?.toString() || "");
                            setShowNewForm(false);
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
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
