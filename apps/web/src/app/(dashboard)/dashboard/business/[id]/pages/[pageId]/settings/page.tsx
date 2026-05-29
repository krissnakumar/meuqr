"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Save,
  Settings,
  Search,
  Eye,
  Code,
} from "lucide-react";

export default function PageSettingsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const pageId = params.pageId as string;

  const [page, setPage] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/dashboard/business/${businessId}/pages/${pageId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {page?.title || "Editor"}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Configurações da Página
          </h1>
          <p className="text-sm text-gray-500">
            {business?.name} / {page?.title}
          </p>
        </div>
        <Link href={`/${business?.slug}`} target="_blank">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Visualizar
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Informações básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da página</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-400">{business?.slug}/</span>
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO (Otimização para buscadores)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Título SEO</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Título que aparece no Google"
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
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
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
              />
              <p className="text-xs text-gray-400">
                Imagem exibida ao compartilhar link (OG Image)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom CSS/JS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="w-4 h-4" />
              Personalização avançada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customCss">CSS personalizado</Label>
              <textarea
                id="customCss"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
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
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
                placeholder="// Adicione JavaScript personalizado aqui"
                spellCheck={false}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/business/${businessId}/pages/${pageId}`}>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="default" disabled={saving}>
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
