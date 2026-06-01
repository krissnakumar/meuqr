"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  Trash2,
  File,
  FileImage,
  FileType,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessDocument {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: "pdf" | "doc" | "image";
  file_size: number | null;
  category: string | null;
  created_at: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

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

      const { data: documentsData, error } = await supabase
        .from("business_documents")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(documentsData || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Erro ao carregar documentos.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;
    try {
      const { error } = await supabase.from("business_documents").delete().eq("id", id);
      if (error) throw error;
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success("Documento excluído.");
    } catch (err) {
      toast.error("Erro ao excluir documento.");
    }
  }

  function getFileIcon(type: string) {
    switch (type) {
      case "pdf":
        return <FileType className="w-5 h-5 text-rose-500" />;
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "image":
        return <FileImage className="w-5 h-5 text-emerald-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "pdf":
        return <Badge variant="rose">PDF</Badge>;
      case "doc":
        return <Badge variant="indigo">Documento</Badge>;
      case "image":
        return <Badge variant="emerald">Imagem</Badge>;
      default:
        return <Badge variant="muted">{type}</Badge>;
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const categories = [...new Set(documents.map((d) => d.category).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando documentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Back + Header */}
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
                <FileText className="w-5 h-5 text-white" />
              </div>
              Documentos
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie documentos, PDFs, contratos e arquivos{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {documents.length} documentos
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{documents.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{categories.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Categorias</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum documento adicionado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Adicione documentos, contratos e arquivos ao seu negócio.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc, idx) => (
            <div
              key={doc.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0 shadow-sm">
                        {getFileIcon(doc.file_type)}
                      </div>
                      {getTypeBadge(doc.file_type)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {doc.name}
                      </h4>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                      {doc.category || "Sem categoria"}
                    </p>
                    <p className="text-gray-400">
                      {formatSize(doc.file_size)} ·{" "}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 flex-1 border-slate-200"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
