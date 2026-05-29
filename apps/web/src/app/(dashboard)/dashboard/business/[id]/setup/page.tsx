"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { TEMPLATES } from "@meuqr/shared";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Store,
  Layout,
} from "lucide-react";
import Link from "next/link";

export default function BusinessSetupPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [step, setStep] = useState<"templates" | "done">("templates");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: existingPages } = await supabase
        .from("pages")
        .select("id, title, slug, is_published")
        .eq("business_id", businessId);

      setBusiness(biz);
      setPages(existingPages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const recommendedTemplates = TEMPLATES.filter(
    (t) => t.category === business?.category
  );

  const otherTemplates = TEMPLATES.filter(
    (t) => t.category !== business?.category
  );

  async function cloneTemplate(template: (typeof TEMPLATES)[0]) {
    setCloning(true);
    try {
      // 1. Create the page
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: template.name,
          slug: template.slug,
          is_published: true,
          seo_title: `${business?.name} - ${template.name}`,
          seo_description: template.description,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // 2. Create sections and items for each section
      for (let i = 0; i < template.sections.length; i++) {
        const section = template.sections[i];

        const { data: newSection, error: secError } = await supabase
          .from("sections")
          .insert({
            page_id: page.id,
            name: section.name,
            slug: section.slug,
            section_type: section.sectionType || null,
            sort_order: i,
          })
          .select()
          .single();

        if (secError) throw secError;

        // 3. Create items for this section
        if (section.items.length > 0) {
          const itemsToInsert = section.items.map((item, idx) => ({
            section_id: newSection.id,
            name: item.name,
            description: item.description || null,
            price: item.price || null,
            sort_order: idx,
          }));

          const { error: itemsError } = await supabase
            .from("items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      // 4. Generate a QR code for this page
      const shortCode = generateShortCode();
      await supabase.from("qr_codes").insert({
        business_id: businessId,
        page_id: page.id,
        short_code: shortCode,
        title: `${business?.name} - ${template.name}`,
      });

      setStep("done");
    } catch (err: any) {
      console.error("Error cloning template:", err);
      alert("Erro ao criar página. Tente novamente.");
    } finally {
      setCloning(false);
    }
  }

  function generateShortCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#111827]/5 flex items-center justify-center">
          <Store className="w-6 h-6 text-[#111827]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{business?.name}</h1>
          <p className="text-sm text-gray-500">Configuração inicial</p>
        </div>
      </div>

      {step === "templates" && (
        <>
          <h2 className="text-lg font-semibold text-[#111827] mb-4">
            Escolha um modelo para sua página
          </h2>

          {pages.length > 0 && (
            <Card className="mb-6 border-[#00C853]/30 bg-[#00C853]/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                <p className="text-sm text-gray-700">
                  Você já tem {pages.length} página(s) criada(s).
                </p>
                <Link href={`/dashboard/business/${businessId}`}>
                  <Button variant="ghost" size="sm">
                    Ver páginas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {recommendedTemplates.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Recomendado para seu negócio
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendedTemplates.map((template) => (
                    <Card
                      key={template.slug}
                      className="hover:shadow-lg transition-all cursor-pointer group border-2 border-[#00C853]/30 hover:border-[#00C853]/60 bg-[#00C853]/5"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#00C853]/15 flex items-center justify-center">
                              <Layout className="w-5 h-5 text-[#00C853]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-[#111827]">
                                {template.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {template.sections.length} seções
                              </p>
                            </div>
                          </div>
                          <Badge variant="accent" className="bg-[#00C853] text-white">Recomendado</Badge>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          {template.description}
                        </p>

                        <div className="space-y-1 mb-4">
                          {template.sections.slice(0, 3).map((sec) => (
                            <div
                              key={sec.slug}
                              className="text-xs text-gray-400 flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00C853]/40" />
                              {sec.name}
                              {sec.items.length > 0 && (
                                <span className="text-gray-300">
                                  ({sec.items.length} itens)
                                </span>
                              )}
                            </div>
                          ))}
                          {template.sections.length > 3 && (
                            <div className="text-xs text-gray-300 pl-3.5">
                              +{template.sections.length - 3} seções
                            </div>
                          )}
                        </div>

                        <Button
                          variant="accent"
                          className="w-full bg-[#00C853] hover:bg-[#00B34A]"
                          onClick={() => cloneTemplate(template)}
                          disabled={cloning}
                        >
                          {cloning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Usar este modelo
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                {recommendedTemplates.length > 0 ? "Outros modelos disponíveis" : "Modelos disponíveis"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {otherTemplates.map((template) => (
                  <Card
                    key={template.slug}
                    className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-gray-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Layout className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111827]">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {template.sections.length} seções
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        {template.description}
                      </p>

                      <div className="space-y-1 mb-4">
                        {template.sections.slice(0, 3).map((sec) => (
                          <div
                            key={sec.slug}
                            className="text-xs text-gray-400 flex items-center gap-2"
                          >
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            {sec.name}
                            {sec.items.length > 0 && (
                              <span className="text-gray-300">
                                ({sec.items.length} itens)
                              </span>
                            )}
                          </div>
                        ))}
                        {template.sections.length > 3 && (
                          <div className="text-xs text-gray-300 pl-3">
                            +{template.sections.length - 3} seções
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full hover:bg-gray-50"
                        onClick={() => cloneTemplate(template)}
                        disabled={cloning}
                      >
                        {cloning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Usar este modelo
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Option to skip template */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setStep("done");
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Pular esta etapa (criar manualmente depois)
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">
              Negócio configurado!
            </h2>
            <p className="text-gray-500 mb-8">
              Sua página está pronta. Agora personalize, edite itens e compartilhe seu QR code.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/dashboard/business/${businessId}`}>
                <Button variant="default" size="lg">
                  Gerenciar Negócio
                </Button>
              </Link>
              <Link href={`/dashboard/business/${businessId}/qr`}>
                <Button variant="accent" size="lg">
                  <QrCode className="w-5 h-5 mr-2" />
                  Ver QR Code
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
