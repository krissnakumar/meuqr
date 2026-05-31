"use client";

import { useState, useEffect } from "react";
import { 
  GlassCard, 
  GlassCardContent, 
  GlassCardHeader, 
  GlassCardTitle,
  Button,
  Badge
} from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  CalendarCheck,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Booking States
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

      if (!businesses || businesses.length === 0) return;

      const businessIds = businesses.map(b => b.id);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          appointment_services (name, duration_minutes, price),
          staff_members (name)
        `)
        .in("business_id", businessIds)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
        
      if (error) throw error;
      
      setAppointments(appointments.map(a => 
        a.id === id ? { ...a, status } : a
      ));
      toast.success("Status atualizado com sucesso");
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  }

  async function handleCreateReservation(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone || !newDate || !newTime) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Pegar o primeiro negócio do usuário logado (simplificado)
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (!businesses || businesses.length === 0) throw new Error("Negócio não encontrado");
      const businessId = businesses[0].id;

      const payload = {
        businessId,
        customerName: newCustomerName,
        customerPhone: newCustomerPhone,
        appointmentDate: newDate,
        appointmentTime: newTime + ":00",
        notes: newNotes
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Falha ao criar reserva");
      
      toast.success("Reserva criada com sucesso!");
      setShowNewModal(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewDate("");
      setNewTime("");
      setNewNotes("");
      loadAppointments(); // Recarrega a lista
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar reserva manual");
    } finally {
      setCreating(false);
    }
  }

  function openWhatsApp(phone: string, name: string, date: string, time: string) {
    const msg = `Olá ${name}! Tudo bem? Gostaria de confirmar seu agendamento para o dia ${date} às ${time}.`;
    const url = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="yellow">Pendente</Badge>;
      case "confirmed": return <Badge variant="emerald">Confirmado</Badge>;
      case "completed": return <Badge variant="indigo">Concluído</Badge>;
      case "cancelled": return <Badge variant="red">Cancelado</Badge>;
      case "no_show": return <Badge variant="gray">Não Compareceu</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Agendamentos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas reservas, horários e equipe.</p>
        </div>
        <Button 
          onClick={() => setShowNewModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Próximos Agendamentos</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {loading ? (
            <div className="py-10 text-center text-gray-400">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Serviço & Equipe</th>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{apt.customer_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          {apt.customer_phone}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-slate-700">{apt.appointment_services?.name || "Serviço Removido"}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" /> {apt.staff_members?.name || "Sem Profissional"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(apt.appointment_date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {apt.start_time.slice(0,5)} - {apt.end_time.slice(0,5)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openWhatsApp(apt.customer_phone, apt.customer_name, new Date(apt.appointment_date).toLocaleDateString('pt-BR'), apt.start_time.slice(0,5))}
                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Confirmar via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          
                          {apt.status === "pending" && (
                            <button 
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Confirmar Agendamento"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {(apt.status === "pending" || apt.status === "confirmed") && (
                            <button 
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Cancelar Agendamento"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Modal for Manual Booking */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Nova Reserva Manual</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateReservation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Cliente *</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                <input 
                  type="tel" 
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data *</label>
                  <input 
                    type="date" 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Horário *</label>
                  <input 
                    type="time" 
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none resize-none"
                  placeholder="Adicione alguma nota..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {creating ? "Criando..." : "Confirmar Reserva"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
