"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, Check, X, FileText, ShoppingCart, MessageSquare, QrCode, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  business_id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "unread" | "read" | "archived";
  created_at: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch current business ID
  useEffect(() => {
    async function fetchBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (businesses && businesses.length > 0) {
        setBusinessId(businesses[0].id);
      }
    }
    fetchBusiness();
  }, []);

  // 2. Fetch notifications once business ID is available
  useEffect(() => {
    if (!businessId) return;

    async function loadNotifications() {
      try {
        const res = await fetch(`/api/notifications?businessId=${businessId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }

    loadNotifications();

    // 3. Setup Supabase Realtime listener
    const channel = supabase
      .channel(`realtime-notifications-${businessId}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);

          // Display a gorgeous realtime toast
          toast.success(newNotif.title, {
            description: newNotif.message,
            duration: 5000,
            action: {
              label: "Visualizar",
              onClick: () => {
                router.push("/dashboard/notifications");
                markAsRead(newNotif.id);
              }
            }
          });

          // Play subtle micro-interaction sound
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
            audio.volume = 0.4;
            audio.play();
          } catch (_) {}
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, router]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, status: "read" as const } : n)
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }

  async function markAllAsRead() {
    if (!businessId) return;
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: "read" as const }))
        );
        toast.success("Todas as notificações foram marcadas como lidas.");
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }

  function getIcon(type: string, priority: string) {
    const cls = `w-4 h-4 ${priority === "urgent" ? "text-red-500" : priority === "high" ? "text-orange-500" : "text-[#1877F2]"}`;
    if (type.includes("order")) return <ShoppingCart className={cls} />;
    if (type.includes("quote")) return <FileText className={cls} />;
    if (type.includes("lead")) return <MessageSquare className={cls} />;
    if (type.includes("qr")) return <QrCode className={cls} />;
    return <AlertTriangle className={cls} />;
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "urgent": return "bg-red-50 text-red-700 border-red-100";
      case "high": return "bg-orange-50 text-orange-700 border-orange-100";
      case "normal": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer focus:outline-none"
      >
        <Bell className="w-5.5 h-5.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <h3 className="font-bold text-sm text-[#050505] flex items-center gap-1.5">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                  {unreadCount} novas
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-[#1877F2] hover:text-[#1877F2]/80 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100 scrollbar-none">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">Nenhuma notificação ainda</p>
                <p className="text-xs text-gray-400 mt-0.5">As atividades dos seus catálogos aparecerão aqui.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    router.push("/dashboard/notifications");
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex gap-3 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                    notif.status === "unread" ? "bg-blue-50/20" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${getPriorityColor(notif.priority)}`}>
                    {getIcon(notif.type, notif.priority)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <p className={`text-xs truncate ${notif.status === "unread" ? "font-bold text-[#050505]" : "font-semibold text-gray-700"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {notif.status === "unread" && (
                    <div className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer View All link */}
          <div className="border-t border-gray-100 p-2.5 bg-gray-50/50 text-center">
            <button
              onClick={() => {
                router.push("/dashboard/notifications");
                setIsOpen(false);
              }}
              className="text-xs font-bold text-[#1877F2] hover:text-[#1877F2]/80 transition-colors w-full py-1 cursor-pointer"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
