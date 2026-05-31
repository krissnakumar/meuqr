"use client";

import { useEffect, useState } from "react";
import { GlassCard, GlassCardContent, Button } from "@meuqr/ui";
import { ShieldAlert, Download, Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AuditLog {
  id: number;
  event: string;
  user_email: string | null;
  user_id: string | null;
  ip_address: string | null;
  status: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error("Error loading logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error("Nenhum log para exportar");
      return;
    }
    
    const csvContent = [
      ["Timestamp", "Evento", "Usuário", "IP", "Status"].join(","),
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.event,
        log.user_email || "N/A",
        log.ip_address || "N/A",
        log.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download do CSV concluído.");
  };

  const filteredLogs = logs.filter(log => {
    const query = search.toLowerCase();
    return (
      (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
      log.event.toLowerCase().includes(query) ||
      (log.user_email && log.user_email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-600 w-7 h-7" />
            Auditoria e Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoramento de atividades suspeitas e logs de segurança do sistema.
          </p>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <GlassCard>
        <GlassCardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por IP, Evento ou Usuário..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
              />
            </div>
            <Button className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Evento</th>
                  <th className="px-6 py-4 font-semibold">Usuário</th>
                  <th className="px-6 py-4 font-semibold">IP</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      Nenhum log encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{log.event}</td>
                      <td className="px-6 py-4 text-gray-600">{log.user_email || "Sistema"}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.ip_address || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Mostrando {filteredLogs.length} logs recentes</span>
            <div className="flex gap-2">
              <Button disabled className="px-3 py-1 bg-gray-100 text-gray-400">Anterior</Button>
              <Button disabled className="px-3 py-1 bg-gray-100 text-gray-400">Próxima</Button>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
