"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@meuqr/ui";
import { Bell, BellOff, Clock, Globe } from "lucide-react";

interface NotificationSettingsProps {
  settings: any;
  onSave: (settings: any) => Promise<void>;
}

export default function NotificationSettings({ settings, onSave }: NotificationSettingsProps) {
  if (!settings) return null;

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-indigo-600" />
          </div>
          <GlassCardTitle>Alertas</GlassCardTitle>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Push toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${settings.push_enabled ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600" : "bg-slate-100 text-gray-400"}`}>
              {settings.push_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Notificações Push</p>
              <p className="text-xs text-gray-400">Alertas no app mobile</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.push_enabled}
            onChange={(checked) => onSave({ ...settings, push_enabled: checked })}
          />
        </div>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Bell className="w-3 h-3" />
            Eventos
          </p>
          <div className="space-y-2.5">
            <EventCheckbox
              label="Novos Pedidos"
              checked={settings.notify_new_order}
              onChange={(checked) => onSave({ ...settings, notify_new_order: checked })}
            />
            <EventCheckbox
              label="Orçamentos"
              checked={settings.notify_quote_request}
              onChange={(checked) => onSave({ ...settings, notify_quote_request: checked })}
            />
            <EventCheckbox
              label="Leads"
              checked={settings.notify_lead}
              onChange={(checked) => onSave({ ...settings, notify_lead: checked })}
            />
            <EventCheckbox
              label="QR Code Scan"
              checked={settings.notify_qr_scan}
              onChange={(checked) => onSave({ ...settings, notify_qr_scan: checked })}
            />
            <EventCheckbox
              label="Cliques WhatsApp"
              checked={settings.notify_whatsapp_click}
              onChange={(checked) => onSave({ ...settings, notify_whatsapp_click: checked })}
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Horário de Silêncio</p>
                <p className="text-xs text-gray-400">Pausar notificações</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.quiet_hours_enabled}
              onChange={(checked) => onSave({ ...settings, quiet_hours_enabled: checked })}
            />
          </div>
          {settings.quiet_hours_enabled && (
            <div className="flex items-center gap-2 mt-3 animate-fade-in-up">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Início</label>
                <input
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) => onSave({ ...settings, quiet_hours_start: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Fim</label>
                <input
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) => onSave({ ...settings, quiet_hours_end: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Idioma dos Alertas</span>
          </div>
          <select
            value={settings.notification_language}
            onChange={(e) => onSave({ ...settings, notification_language: e.target.value })}
            className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white cursor-pointer"
          >
            <option value="pt-BR">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function EventCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group px-1">
      <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </label>
  );
}
