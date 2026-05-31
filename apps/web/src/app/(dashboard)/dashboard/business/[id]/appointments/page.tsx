"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  const params = useParams();
  const businessId = params.id as string;
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
  }, [businessId]);

  async function loadAppointments() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          appointment_services (name, duration_minutes, price),
          staff_members (name)
        `)
        .eq("business_id", businessId)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(t('errors.generic'));
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
      case "pending": return <Badge variant="amber">Pendente</Badge>;
      case "confirmed": return <Badge variant="emerald">Confirmado</Badge>;
      case "completed": return <Badge variant="indigo">Concluído</Badge>;
      case "cancelled": return <Badge variant="rose">Cancelado</Badge>;
      case "no_show": return <Badge variant="muted">Não Compareceu</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return { bg: "bg-amber-500", color: "text-amber-500" };
      case "confirmed": return { bg: "bg-emerald-500", color: "text-emerald-500" };
      case "completed": return { bg: "bg-indigo-500", color: "text-indigo-500" };
      case "cancelled": return { bg: "bg-rose-500", color: "text-rose-500" };
      case "no_show": return { bg: "bg-slate-500", color: "text-slate-500" };
      default: return { bg: "bg-gray-500", color: "text-gray-500" };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            {t('business.appointments_title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('business.appointments_desc')}</p>
        </div>
        <Button 
          onClick={() => setShowNewModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          {t('business.new_appointment')}
        </Button>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>{t('business.appointments_upcoming')}</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {loading ? (
            <div className="py-10 text-center text-gray-400">{t('common.loading')}</div>
          ) : appointments.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">{t('business.appointment_none')}</h3>
              <p className="text-sm text-gray-400">Quando os clientes agendarem horários, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const statusColor = getStatusColor(apt.status);
                
                return (
                  <GlassCard key={apt.id} className="overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-1 h-full ${statusColor.bg}`} />
                    <GlassCardContent className="p-6 ml-3">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                              <Clock className="w-4 h-4 text-indigo-600" />
                              <span className="font-bold text-indigo-700">
                                {new Date(apt.appointment_date).toLocaleDateString('pt-BR')} às {apt.start_time.slice(0,5)}
                              </span>
                            </div>
                            {getStatusBadge(apt.status)}
                          </div>

                          <div className="mt-4">
                            <h3 className="text-lg font-bold text-slate-800">
                              {apt.customer_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                              <button
                                onClick={() => openWhatsApp(apt.customer_phone, apt.customer_name, new Date(apt.appointment_date).toLocaleDateString('pt-BR'), apt.start_time.slice(0,5))}
                                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium transition-colors bg-emerald-50 px-2 py-1 rounded-md"
                              >
                                <MessageCircle className="w-4 h-4" />
                                {apt.customer_phone}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[200px]">
                          <div className="flex items-center gap-2 justify-end text-slate-600 mb-1">
                            <CalendarCheck className="w-4 h-4" />
                            <span className="font-medium text-sm">{apt.appointment_services?.name || "Serviço Removido"}</span>
                          </div>
                          <div className="flex items-center gap-2 justify-end text-slate-500 mt-2">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-xs">{apt.staff_members?.name || "Sem Profissional"}</span>
                          </div>
                        </div>
                      </div>

                      {apt.notes && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-lg flex gap-2 items-start">
                          <span className="font-bold shrink-0">Observação:</span>
                          <p>{apt.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {apt.status !== "cancelled" && apt.status !== "completed" && apt.status !== "no_show" && (
                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                          {apt.status === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatus(apt.id, "confirmed")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar Agendamento
                            </Button>
                          )}
                          {apt.status === "confirmed" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatus(apt.id, "completed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Concluído
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(apt.id, "no_show")}
                            className="text-slate-600 border-slate-200 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Não Compareceu
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(apt.id, "cancelled")}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </GlassCardContent>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Modal for Manual Booking */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{t('business.new_appointment_manual')}</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateReservation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('business.appointment_customer_name')}</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder={t('business.appointment_customer_name_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('common.phone')} *</label>
                <input 
                  type="tel" 
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder={t('business.appointment_phone_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('business.appointment_date_label')}</label>
                  <input 
                    type="date" 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('business.appointment_time_label')}</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('business.appointment_notes_label')}</label>
                <textarea 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none resize-none"
                  placeholder={t('business.appointment_notes_placeholder')}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {creating ? t('business.appointment_creating') : t('business.appointment_confirm_btn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
