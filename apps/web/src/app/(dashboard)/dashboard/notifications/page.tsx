"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import {
  Bell,
  Check,
  Archive,
  Filter,
  RefreshCw,
  ShoppingCart,
  FileText,
  MessageSquare,
  QrCode,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Trash2,
  Calendar,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  business_id: string;
  user_id: string | null;
  client_id: string | null;
  order_id: string | null;
  quote_request_id: string | null;
  lead_id: string | null;
  qr_code_id: string | null;
  item_id: string | null;
  type: string;
  title: string;
  message: string;
  data: any;
  channel: string;
  status: "unread" | "read" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  read_at: string | null;
  created_at: string;
  businesses?: {
    name: string;
  };
}

interface Business {
  id: string;
  name: string;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user's businesses
      const { data: bizData } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_id", user.id);
      
      const bizList = bizData || [];
      setBusinesses(bizList);

      if (bizList.length > 0) {
        const bizIds = bizList.map(b => b.id);
        
        // Fetch notifications for all owned businesses
        const { data: notifData, error } = await supabase
          .from("notifications")
          .select("*, businesses(name)")
          .in("business_id", bizIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(notifData || []);
      }
    } catch (err) {
      console.error("Failed to load notifications page data:", err);
      toast.error("Erro ao carregar notificações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (businesses.length > 0) {
        const bizIds = businesses.map(b => b.id);
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*, businesses(name)")
          .in("business_id", bizIds)
          .order("created_at", { ascending: false });
        
        setNotifications(notifData || []);
        toast.success("Notificações atualizadas!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, status: "read" as const, read_at: new Date().toISOString() } : n)
        );
        toast.success("Notificação marcada como lida.");
      } else {
        toast.error("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function archiveNotification(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}/archive`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, status: "archived" as const } : n)
        );
        toast.success("Notificação arquivada.");
      } else {
        toast.error("Erro ao arquivar.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllAsRead() {
    if (businesses.length === 0) return;
    try {
      // Mark all read for all businesses currently loaded
      const promises = businesses.map(async (biz) => {
        return fetch("/api/notifications/read-all", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: biz.id })
        });
      });

      await Promise.all(promises);

      setNotifications(prev =>
        prev.map(n => ({ ...n, status: "read" as const, read_at: new Date().toISOString() }))
      );
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch (err) {
      console.error("Mark all as read error:", err);
      toast.error("Erro ao marcar todas como lidas.");
    }
  }

  function getIcon(type: string, priority: string) {
    const cls = `w-5 h-5 ${priority === "urgent" ? "text-red-600 animate-bounce" : priority === "high" ? "text-orange-500" : "text-[#1877F2]"}`;
    if (type.includes("order")) return <ShoppingCart className={cls} />;
    if (type.includes("quote")) return <FileText className={cls} />;
    if (type.includes("lead")) return <MessageSquare className={cls} />;
    if (type.includes("qr")) return <QrCode className={cls} />;
    return <AlertTriangle className={cls} />;
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case "urgent": return <Badge className="bg-red-100 text-red-700 border-red-200">Urgente</Badge>;
      case "high": return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Alta</Badge>;
      case "normal": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Normal</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Baixa</Badge>;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "unread": return <Badge className="bg-indigo-100 text-indigo-700">Não Lida</Badge>;
      case "read": return <Badge variant="outline" className="text-gray-500">Lida</Badge>;
      default: return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Arquivada</Badge>;
    }
  }

  // Handle navigate to deep link
  function handleDeepLink(notif: Notification) {
    const bizId = notif.business_id;
    if (notif.order_id) {
      router.push(`/dashboard/business/${bizId}/orders`);
    } else if (notif.quote_request_id) {
      router.push(`/dashboard/business/${bizId}/quote-requests`);
    } else if (notif.lead_id) {
      router.push(`/dashboard/business/${bizId}/leads`);
    } else if (notif.client_id) {
      router.push(`/dashboard/business/${bizId}/clients/${notif.client_id}`);
    } else if (notif.qr_code_id) {
      router.push(`/dashboard/business/${bizId}/qr`);
    } else {
      router.push(`/dashboard/business/${bizId}`);
    }
  }

  // Filter notifications logic
  const filteredNotifications = notifications.filter(notif => {
    const matchBusiness = selectedBusiness === "all" || notif.business_id === selectedBusiness;
    const matchPriority = selectedPriority === "all" || notif.priority === selectedPriority;
    const matchStatus = selectedStatus === "all" || notif.status === selectedStatus;
    
    let matchType = true;
    if (selectedType !== "all") {
      if (selectedType === "orders") matchType = notif.type.includes("order") || notif.type.includes("checkout") || notif.type.includes("pix");
      else if (selectedType === "quotes") matchType = notif.type.includes("quote");
      else if (selectedType === "leads") matchType = notif.type.includes("lead");
      else if (selectedType === "qrs") matchType = notif.type.includes("qr");
      else if (selectedType === "clients") matchType = notif.client_id !== null;
      else if (selectedType === "system") matchType = notif.type.includes("system") || notif.type.includes("business") || notif.type.includes("product") || notif.type.includes("subscription");
    }

    return matchBusiness && matchPriority && matchStatus && matchType;
  });

  const unreadCount = filteredNotifications.filter(n => n.status === "unread").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_notifications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1877F2]/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5.5 h-5.5 text-[#1877F2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050505] flex items-center gap-2">
                <span>Centro de Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500 text-white font-bold animate-pulse">
                    {unreadCount} pendentes
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400">Gerencie todos os alertas em tempo real e interações de clientes.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-200 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar lidas
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Card className="border border-slate-100 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-4">
            <Filter className="w-4 h-4 text-[#1877F2]" />
            <span>Filtrar Alertas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Filter by Business */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Negócio</label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] bg-white cursor-pointer"
              >
                <option value="all">Todos os Negócios</option>
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>{biz.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Category / Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Tipo de Alerta</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] bg-white cursor-pointer"
              >
                <option value="all">Todos os Tipos</option>
                <option value="orders">Pedidos / Checkout</option>
                <option value="quotes">Orçamentos</option>
                <option value="leads">Contatos / Leads</option>
                <option value="qrs">QR Codes escaneados</option>
                <option value="clients">Clientes ativos</option>
                <option value="system">Alertas de Sistema</option>
              </select>
            </div>

            {/* Filter by Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Prioridade</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] bg-white cursor-pointer"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] bg-white cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="unread">Não Lidas</option>
                <option value="read">Lidas</option>
                <option value="archived">Arquivadas</option>
              </select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Notifications List Container */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="border border-slate-100 shadow-sm">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 bg-[#1877F2]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1877F2]/20">
                <Bell className="w-8 h-8 text-[#1877F2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhuma notificação ainda</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Quando os clientes interagirem com seus menus ou realizarem pedidos, os alertas serão listados aqui instantaneamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative overflow-hidden bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  notif.status === "unread" ? "shadow-sm shadow-[#1877F2]/5 border-l-4 border-l-[#1877F2]" : ""
                }`}
              >
                {/* Notification Left Section */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    notif.priority === "urgent" ? "bg-red-50 border-red-100" : notif.priority === "high" ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"
                  }`}>
                    {getIcon(notif.type, notif.priority)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm ${notif.status === "unread" ? "font-extrabold text-[#050505]" : "font-bold text-slate-700"}`}>
                        {notif.title}
                      </h4>
                      {getPriorityBadge(notif.priority)}
                      {getStatusBadge(notif.status)}
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 font-medium pt-1">
                      {notif.businesses?.name && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          {notif.businesses.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(notif.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Right Section */}
                <div className="flex items-center gap-2.5 sm:self-center shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {notif.status === "unread" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs h-8 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Marcar como lida"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Lida
                    </Button>
                  )}

                  {notif.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveNotification(notif.id)}
                      className="text-xs h-8 border-slate-200 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      title="Arquivar notificação"
                    >
                      <Archive className="w-3.5 h-3.5 mr-1" />
                      Arquivar
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDeepLink(notif)}
                    className="text-xs h-8 bg-slate-50 text-slate-700 hover:bg-slate-100 border-0 hover:text-slate-900 group"
                  >
                    <span>Gerenciar</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
