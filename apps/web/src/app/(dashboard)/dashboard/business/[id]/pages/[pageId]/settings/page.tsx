"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Label } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Save,
  Settings,
  Search,
  Eye,
  Code,
  Globe,
} from "lucide-react";

export default function PageSettingsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;
  const pageId = params.pageId as string;

  const [page, setPage] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoImageUrl, setSeoImageUrl] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    try {
      const { data: pg } = await supabase
        .from("pages")
        .select("*, businesses!inner(name, slug)")
        .eq("id", pageId)
        .single();

      setPage(pg);
      setBusiness(pg?.businesses);

      if (pg) {
        setTitle(pg.title || "");
        setSlug(pg.slug || "");
        setSeoTitle(pg.seo_title || "");
        setSeoDescription(pg.seo_description || "");
        setSeoImageUrl(pg.seo_image_url || "");
        setCustomCss(pg.custom_css || "");
        setCustomJs(pg.custom_js || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await supabase
        .from("pages")
        .update({
          title,
          slug,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          seo_image_url: seoImageUrl || null,
          custom_css: customCss || null,
          custom_js: customJs || null,
        })
        .eq("id", pageId);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_settings')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}/pages/${pageId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {page?.title || "Editor"}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Configurações da Página</h1>
            <p className="text-sm text-gray-400">{business?.name} / {page?.title}</p>
          </div>
        </div>
        <Link href={`/${business?.slug}`} target="_blank">
          <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-200">
            <Eye className="w-4 h-4 mr-1" />
            Visualizar
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Informações básicas
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da página</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-400 font-mono bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200">
                  {business?.slug}/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  required
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* SEO */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              SEO (Otimização para buscadores)
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Título SEO</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Título que aparece no Google"
                className="h-11 rounded-xl border-slate-200"
              />
              <p className="text-xs text-gray-400">
                Recomendado: 50-60 caracteres. Atual: {seoTitle.length}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Descrição SEO</Label>
              <textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all"
                placeholder="Descrição que aparece nos resultados de busca"
              />
              <p className="text-xs text-gray-400">
                Recomendado: 150-160 caracteres. Atual: {seoDescription.length}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoImage">Imagem SEO (URL)</Label>
              <Input
                id="seoImage"
                value={seoImageUrl}
                onChange={(e) => setSeoImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="h-11 rounded-xl border-slate-200"
              />
              <p className="text-xs text-gray-400">Imagem exibida ao compartilhar link (OG Image)</p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Custom CSS/JS */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              Personalização avançada
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customCss">CSS personalizado</Label>
              <textarea
                id="customCss"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all"
                placeholder="/* Adicione CSS personalizado aqui */"
                spellCheck={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customJs">JavaScript personalizado</Label>
              <textarea
                id="customJs"
                value={customJs}
                onChange={(e) => setCustomJs(e.target.value)}
                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all"
                placeholder="// Adicione JavaScript personalizado aqui"
                spellCheck={false}
              />
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/business/${businessId}/pages/${pageId}`}>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            variant="default"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? "Salvo!" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
