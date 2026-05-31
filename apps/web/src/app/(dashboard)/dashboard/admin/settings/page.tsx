"use client";

import { useState, useEffect } from "react";
import { GlassCard, GlassCardContent, Button, Input } from "@meuqr/ui";
import { Settings, Save, Server, Shield, Globe, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    trialDays: "14",
    maxUploadSize: "50",
    maxBusinessesPerUser: "1",
    allowedDomains: "*",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", "global")
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Failed to load settings:", error);
          toast.error("Erro ao carregar configurações do sistema");
        } else if (data) {
          setSettings({
            maintenanceMode: data.maintenance_mode ?? false,
            allowSignups: data.allow_signups ?? true,
            trialDays: String(data.trial_days ?? 14),
            maxUploadSize: String(data.max_upload_size_mb ?? 50),
            maxBusinessesPerUser: String(data.max_businesses_per_user ?? 1),
            allowedDomains: data.allowed_domains ?? "*",
          });
        }
      } catch (err) {
        console.error("Unexpected error loading settings:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          id: "global",
          maintenance_mode: settings.maintenanceMode,
          allow_signups: settings.allowSignups,
          trial_days: parseInt(settings.trialDays) || 14,
          max_upload_size_mb: parseInt(settings.maxUploadSize) || 50,
          max_businesses_per_user: parseInt(settings.maxBusinessesPerUser) || 1,
          allowed_domains: settings.allowedDomains,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-amber-600 w-7 h-7" />
            Configurações do Sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ajuste de variáveis globais e políticas de acesso do MeuQR.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="w-4 h-4 mr-2" /> Salvar Alterações
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Server className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Geral</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">Modo de Manutenção</p>
                  <p className="text-xs text-gray-500">Bloqueia acesso ao painel para usuários não-admin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">Permitir Novos Registros</p>
                  <p className="text-xs text-gray-500">Habilita a criação de novas contas via /register</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.allowSignups} onChange={(e) => setSettings({...settings, allowSignups: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Políticas de Conta (Default)</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Trial (Novo Cadastro)</label>
                <Input 
                  type="number" 
                  value={settings.trialDays} 
                  onChange={(e) => setSettings({...settings, trialDays: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Negócios por Usuário Grátis</label>
                <Input 
                  type="number" 
                  value={settings.maxBusinessesPerUser} 
                  onChange={(e) => setSettings({...settings, maxBusinessesPerUser: e.target.value})} 
                />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <HardDrive className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Limites de Armazenamento</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho Máximo Upload (MB)</label>
                <Input 
                  type="number" 
                  value={settings.maxUploadSize} 
                  onChange={(e) => setSettings({...settings, maxUploadSize: e.target.value})} 
                />
                <p className="text-xs text-gray-500 mt-1">Afeta upload de logos, banners e produtos.</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Integração e CORS</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domínios Permitidos (CORS)</label>
                <Input 
                  value={settings.allowedDomains} 
                  onChange={(e) => setSettings({...settings, allowedDomains: e.target.value})} 
                />
                <p className="text-xs text-gray-500 mt-1">Separe por vírgula. Use * para permitir todos.</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
