"use client";

import { useState, type ReactNode } from "react";
import { Button, GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, ImageUpload } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Edit3,
  Store,
  Phone,
  Instagram,
  Facebook,
  Hash,
  Globe,
  ExternalLink,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  subscription_tier: string;
  is_active: boolean;
  default_language?: string;
}

interface EditBusinessInfoProps {
  businessId: string;
  business: BusinessData;
  onRefresh?: () => Promise<void>;
}

export default function EditBusinessInfo({ businessId, business, onRefresh }: EditBusinessInfoProps) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLang, setEditLang] = useState("pt-BR");
  
  // Media states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>(business.logo_url || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(business.cover_url || "");
  
  const [savingInfo, setSavingInfo] = useState(false);

  const startEditInfo = () => {
    setEditName(business.name);
    setEditWhatsapp(business.whatsapp || "");
    setEditInstagram(business.instagram || "");
    setEditFacebook(business.facebook || "");
    setEditSlug(business.slug);
    setEditDescription(business.description || "");
    setEditLang(business.default_language || "pt-BR");
    setLogoUrl(business.logo_url || "");
    setCoverUrl(business.cover_url || "");
    setLogoFile(null);
    setCoverFile(null);
    setEditingInfo(true);
  };

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function handleSaveInfo() {
    if (!editName || !editSlug) {
      toast.error("Nome e Link são obrigatórios!");
      return;
    }
    setSavingInfo(true);
    try {
      let finalLogoUrl = logoUrl;
      let finalCoverUrl = coverUrl;

      if (logoFile) {
        const uploaded = await uploadFile(logoFile);
        if (uploaded) finalLogoUrl = uploaded;
      }

      if (coverFile) {
        const uploaded = await uploadFile(coverFile);
        if (uploaded) finalCoverUrl = uploaded;
      }

      const { error } = await supabase
        .from("businesses")
        .update({
          name: editName,
          whatsapp: editWhatsapp || null,
          instagram: editInstagram || null,
          facebook: editFacebook || null,
          slug: editSlug,
          description: editDescription || null,
          default_language: editLang,
          logo_url: finalLogoUrl || null,
          cover_url: finalCoverUrl || null,
        })
        .eq("id", businessId);

      if (error) {
        toast.error("Erro ao atualizar informações: " + error.message);
        return;
      }

      toast.success("Informações do negócio atualizadas!");
      setEditingInfo(false);
      await onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setSavingInfo(false);
    }
  }

  return (
    <GlassCard>
      <GlassCardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <GlassCardTitle>Informações</GlassCardTitle>
        </div>
        {!editingInfo && (
          <button
            onClick={startEditInfo}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-gray-400 hover:text-slate-500 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </GlassCardHeader>
      <GlassCardContent>
        {editingInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 block">Logo</label>
                <ImageUpload
                  value={logoUrl}
                  onChange={setLogoFile}
                  onRemove={() => { setLogoUrl(""); setLogoFile(null); }}
                  shape="circle"
                  aspectRatio="square"
                  label="Upload Logo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 block">Capa</label>
                <ImageUpload
                  value={coverUrl}
                  onChange={setCoverFile}
                  onRemove={() => { setCoverUrl(""); setCoverFile(null); }}
                  shape="rounded"
                  aspectRatio="video"
                  label="Upload Capa"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Nome do Negócio *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Link personalizado *</label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200 shrink-0">
                  meuqr.com.br/
                </span>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                  placeholder="5511999999999"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                  placeholder="@meunegocio"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Facebook</label>
              <div className="relative">
                <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editFacebook}
                  onChange={(e) => setEditFacebook(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                  placeholder="@meunegocio"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Idioma</label>
              <select
                value={editLang}
                onChange={(e) => setEditLang(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white cursor-pointer"
              >
                <option value="pt-BR">🇧🇷 Português (pt-BR)</option>
                <option value="en">🇺🇸 English (en)</option>
                <option value="es">🇪🇸 Español (es)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Descrição</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white resize-none"
                placeholder="Fale um pouco sobre sua empresa..."
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setEditingInfo(false)} className="flex-1 h-10 text-xs">
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="flex-1 h-10 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{business.name}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{business.category.replace(/_/g, " ")}</p>
              </div>
            </div>

            <InfoRow
              icon={<Phone className="w-4 h-4 text-gray-400" />}
              label="WhatsApp"
              value={business.whatsapp || "—"}
            />
            <InfoRow
              icon={<Instagram className="w-4 h-4 text-gray-400" />}
              label="Instagram"
              value={business.instagram || "—"}
            />
            <InfoRow
              icon={<Facebook className="w-4 h-4 text-gray-400" />}
              label="Facebook"
              value={business.facebook || "—"}
            />
            <InfoRow
              icon={<Hash className="w-4 h-4 text-gray-400" />}
              label="Link de Acesso"
              value={
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-medium">
                  <ExternalLink className="w-3 h-3" />
                  /{business.slug}
                </span>
              }
            />
            <InfoRow
              icon={<Globe className="w-4 h-4 text-gray-400" />}
              label="Idioma"
              value={business.default_language || "pt-BR"}
            />
            {business.description && (
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Descrição</span>
                <p className="text-sm text-slate-700 leading-relaxed">{business.description}</p>
              </div>
            )}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value: string | ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="w-5 h-5 mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{label}</span>
        <div className="text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}
