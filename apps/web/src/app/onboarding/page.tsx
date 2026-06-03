"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Button } from "@meuqr/ui";
import { QrCode, Loader2, Check, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { VerticalSelector } from "@/components/onboarding/VerticalSelector";
import { BusinessSetupForm } from "@/components/onboarding/BusinessSetupForm";
import { SeedingPreview } from "@/components/onboarding/SeedingPreview";
import { VERTICALS_CONFIG, SampleProduct } from "@meuqr/shared";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatWhatsApp(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (!digits.startsWith("55") && digits.length >= 10) {
    digits = "55" + digits;
  }
  return digits;
}

function displayWhatsApp(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [verticalSlug, setVerticalSlug] = useState("");
  const [bizName, setBizName] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Seeding preview state — editable copy of the vertical's sample items
  const [seedItems, setSeedItems] = useState<SampleProduct[]>([]);

  // Provisioned Business Info
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [createdBusinessSlug, setCreatedBusinessSlug] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Check if user already has a business
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (businesses && businesses.length > 0) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  }

  const handleWhatsAppChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setBizWhatsapp(displayWhatsApp(cleaned));
  };

  const handleCreateBusiness = async () => {
    setSubmitting(true);
    setStep(3); // Go to provisioning screen

    try {
      const bizSlug = slugify(bizName);
      const formattedPhone = formatWhatsApp(bizWhatsapp);

      const res = await fetch("/api/onboarding/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bizName,
          slug: bizSlug,
          whatsapp: formattedPhone,
          verticalSlug,
          answers,
          sampleItems: seedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar estabelecimento.");
      }

      setCreatedBusinessId(data.businessId);
      setCreatedBusinessSlug(data.slug);
      toast.success("Seu workspace foi criado e configurado!");
      setStep(4); // Success state
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro. Tente novamente.");
      setStep(2.5); // Go back to seeding preview
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#64748B] animate-pulse">Preparando ambiente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Decorative gradients */}
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl bg-indigo-400 pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl bg-violet-400 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">MeuQR</span>
          <span className="text-[10px] font-bold text-[#94A3B8] bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Business OS</span>
        </div>

        {/* Wizard Steps */}
        {step < 3 && (
          <div className="flex justify-between items-center px-6">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>1</span>
              <span className="text-xs font-semibold text-[#0F172A]">Categoria</span>
            </div>
            <div className="w-10 h-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>2</span>
              <span className={`text-xs font-semibold ${step >= 2 ? "text-[#0F172A]" : "text-[#64748B]"}`}>Detalhes</span>
            </div>
            <div className="w-10 h-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2.5 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>3</span>
              <span className={`text-xs font-semibold ${step >= 2.5 ? "text-[#0F172A]" : "text-[#64748B]"}`}>Catálogo</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <GlassCard className="animate-fade-in-up">
            <GlassCardHeader className="text-center pb-2">
              <GlassCardTitle className="text-xl font-bold">Qual é a categoria do seu negócio?</GlassCardTitle>
              <p className="text-sm text-[#64748B] mt-1">
                Escolha a melhor categoria para ativarmos as ferramentas ideais para você.
              </p>
            </GlassCardHeader>
            <GlassCardContent>
              <VerticalSelector
                selectedVertical={verticalSlug}
                onSelect={(slug) => {
                  setVerticalSlug(slug);
                  // Pre-load seed items from the vertical defaults
                  const config = VERTICALS_CONFIG[slug];
                  if (config) setSeedItems(config.sampleProducts.map((p) => ({ ...p })));
                  setStep(2);
                }}
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="animate-fade-in-up">
            <GlassCardHeader className="text-center pb-2">
              <GlassCardTitle className="text-xl font-bold">Conte-nos sobre sua empresa</GlassCardTitle>
              <p className="text-sm text-[#64748B] mt-1">
                Complete as informações básicas para criarmos a página da sua empresa.
              </p>
            </GlassCardHeader>
            <GlassCardContent>
              <BusinessSetupForm
                verticalSlug={verticalSlug}
                bizName={bizName}
                setBizName={setBizName}
                bizWhatsapp={bizWhatsapp}
                onWhatsappChange={handleWhatsAppChange}
                answers={answers}
                setAnswers={setAnswers}
                onBack={() => setStep(1)}
                onSubmit={() => setStep(2.5)}
                submitting={submitting}
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {step === 2.5 && (
          <GlassCard className="animate-fade-in-up">
            <GlassCardHeader className="text-center pb-2">
              <GlassCardTitle className="text-xl font-bold">Pré-visualize seu catálogo</GlassCardTitle>
              <p className="text-sm text-[#64748B] mt-1">
                Estes itens serão criados automaticamente. Personalize antes de confirmar!
              </p>
            </GlassCardHeader>
            <GlassCardContent>
              <SeedingPreview
                vertical={verticalSlug}
                items={seedItems}
                onChange={setSeedItems}
                onBack={() => setStep(2)}
                onConfirm={handleCreateBusiness}
                submitting={submitting}
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard className="text-center py-12 animate-fade-in-up">
            <GlassCardContent className="space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
              <h2 className="text-lg font-bold text-[#0F172A]">Criando seu Sistema MeuQR...</h2>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                Estamos configurando seus módulos, gerando o QR Code e preparando dados demonstrativos sob medida.
              </p>
            </GlassCardContent>
          </GlassCard>
        )}

        {step === 4 && (
          <GlassCard className="text-center py-8 animate-fade-in-up">
            <GlassCardContent className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#0F172A]">Tudo Pronto!</h2>
                <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                  Parabéns! Seu sistema <strong>{bizName}</strong> foi inicializado com sucesso.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs text-[#64748B] space-y-2">
                <p className="font-bold text-[#0F172A] text-center mb-1">O que criamos para você:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Módulos de negócio configurados sob medida</li>
                  <li>Sua primeira página web pública baseada em template</li>
                  <li>Produtos e serviços fictícios inseridos para demonstração</li>
                  <li>Código QR gerado e pronto para impressão</li>
                </ul>
              </div>

              <Button
                onClick={() => router.push(`/dashboard/business/${createdBusinessId}`)}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 justify-center"
              >
                <LayoutDashboard className="w-5 h-5" />
                Acessar meu Painel
              </Button>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
