"use client";

import { GlassCard, GlassCardContent, Button } from "@meuqr/ui";
import { ShieldAlert, Download, Search, Filter } from "lucide-react";
import { toast } from "sonner";

const mockLogs = [
  { id: 1, timestamp: "2026-05-30 14:23:45", event: "USER_LOGIN", user: "admin@meuqr.com.br", ip: "192.168.1.1", status: "success" },
  { id: 2, timestamp: "2026-05-30 14:15:12", event: "SETTINGS_UPDATED", user: "admin@meuqr.com.br", ip: "192.168.1.1", status: "success" },
  { id: 3, timestamp: "2026-05-30 13:45:00", event: "FAILED_LOGIN", user: "unknown", ip: "45.22.19.102", status: "warning" },
  { id: 4, timestamp: "2026-05-30 11:30:22", event: "BUSINESS_DELETED", user: "user@example.com", ip: "177.34.12.90", status: "danger" },
  { id: 5, timestamp: "2026-05-30 10:15:05", event: "USER_REGISTER", user: "newuser@test.com", ip: "189.55.22.1", status: "success" },
];

export default function AdminLogsPage() {
  const handleExport = () => {
    toast.success("Download do CSV iniciado.");
  };

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
                {mockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{log.event}</td>
                    <td className="px-6 py-4 text-gray-600">{log.user}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.ip}</td>
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
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Mostrando {mockLogs.length} logs recentes</span>
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
