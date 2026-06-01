"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  Image,
  FileImage,
  Video,
  FileText,
  ExternalLink,
  Trash2,
  Sparkles,
} from "lucide-react";

interface MediaItem {
  id: string;
  business_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  uploaded_by: string;
  created_at: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMediaType(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

function getIconForType(mime: string) {
  const type = getMediaType(mime);
  switch (type) {
    case "image": return FileImage;
    case "video": return Video;
    default: return FileText;
  }
}

function getBadgeForType(mime: string) {
  const type = getMediaType(mime);
  switch (type) {
    case "image": return <Badge variant="indigo" className="text-[10px]">Imagem</Badge>;
    case "video": return <Badge variant="emerald" className="text-[10px]">Vídeo</Badge>;
    default: return <Badge variant="amber" className="text-[10px]">Documento</Badge>;
  }
}

export default function MediaPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data: mediaData, error } = await supabase
        .from("storage_files")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(mediaData || []);
    } catch (err) {
      console.error("Failed to load media:", err);
      toast.error("Erro ao carregar biblioteca de mídia.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    const { error } = await supabase.from("storage_files").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir arquivo");
      return;
    }
    setMedia((prev) => prev.filter((m) => m.id !== id));
    toast.success("Arquivo excluído");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando mídia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Image className="w-5 h-5 text-white" />
              </div>
              Biblioteca de Mídia
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie imagens, fotos e arquivos de mídia do seu negócio{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {media.length} arquivo(s)
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma mídia adicionada ainda</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Faça upload de imagens, vídeos ou documentos para usar nas páginas do seu negócio.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {media.map((item) => {
            const Icon = getIconForType(item.file_type);
            const isImage = getMediaType(item.file_type) === "image";

            return (
              <GlassCard key={item.id} className="break-inside-avoid overflow-hidden group">
                <GlassCardContent className="p-0">
                  <div className="relative h-44 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={item.public_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Icon className="w-12 h-12 text-slate-300" />
                    )}
                    <div className="absolute top-2 right-2">
                      {getBadgeForType(item.file_type)}
                    </div>
                    {isImage && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <a
                          href={item.public_url}
                          target="_blank"
                          className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.file_name}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{formatFileSize(item.file_size)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full mt-2 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs font-medium transition-all flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
