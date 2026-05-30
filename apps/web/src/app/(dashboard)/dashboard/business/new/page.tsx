"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, GlassCard } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { BUSINESS_CATEGORIES } from "@meuqr/shared";
import {
  ArrowLeft,
  Check,
  Search,
  Store,
  UtensilsCrossed,
  Pizza,
  Utensils,
  Cookie,
  Coffee,
  IceCream,
  Wine,
  Truck,
  Building2,
  Wrench,
  PaintBucket,
  Zap,
  Droplet,
  Sofa,
  Shirt,
  Footprints,
  Sparkles,
  ShoppingCart,
  Dog,
  Stethoscope,
  Scissors,
  Hand,
  Flower2,
  Activity,
  Dumbbell,
  Hotel,
  Home,
  Car,
  Bike,
  SprayCan,
  Calendar,
  PartyPopper,
  BookOpen,
  Baby,
  Church,
  Briefcase,
  Camera,
  Monitor,
  Smartphone,
  Printer,
  Pill,
  Plane,
  Package,
  MoreHorizontal,
  Loader2,
  Crown,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSubscriptionLimits, checkActionLimit } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";

// ===== Category icon mapping =====
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Pizza,
  Sandwich: Utensils,
  Cookie,
  Bread: Cookie,
  Coffee,
  IceCream,
  Wine,
  Truck,
  Building2,
  Wrench,
  PaintBucket,
  Zap,
  Droplets: Droplet,
  Sofa,
  Shirt,
  Footprints,
  Sparkles,
  ShoppingCart,
  Dog,
  Stethoscope,
  Scissors,
  Beard: Scissors,
  Hand,
  Flower2,
  Tooth: Activity,
  Dumbbell,
  Hotel,
  Home,
  Car,
  Bike,
  SprayCan,
  Calendar,
  PartyPopper,
  BookOpen,
  Baby,
  Church,
  Briefcase,
  Camera,
  Monitor,
  Smartphone,
  Printer,
  Pill,
  Plane,
  Package,
  MoreHorizontal,
};

function getCategoryIcon(iconName: string) {
  return CATEGORY_ICONS[iconName] || Store;
}

// ===== Category groups for better UX =====
const CATEGORY_GROUPS = [
  {
    label: "Alimentação & Bebidas",
    emoji: "🍽️",
    values: ["restaurant", "pizzeria", "burger_shop", "bakery", "coffee_shop", "acai_sorveteria", "bar_pub", "food_truck"],
  },
  {
    label: "Construção & Reforma",
    emoji: "🏗️",
    values: ["construction_materials", "hardware_store", "paint_store", "electrical_supplies", "plumbing_supplies"],
  },
  {
    label: "Varejo & Lojas",
    emoji: "🛍️",
    values: ["furniture_store", "clothing_store", "shoe_store", "cosmetics_store", "supermarket"],
  },
  {
    label: "Beleza & Bem-Estar",
    emoji: "💇",
    values: ["salon", "barber_shop", "nail_studio", "spa", "dental_clinic", "medical_clinic", "physiotherapy", "gym"],
  },
  {
    label: "Pets",
    emoji: "🐾",
    values: ["pet_shop", "veterinary"],
  },
  {
    label: "Serviços & Profissionais",
    emoji: "💼",
    values: ["freelancer", "photographer", "cleaning_services", "laundry", "event", "party_rental", "school", "daycare", "church"],
  },
  {
    label: "Automotivo",
    emoji: "🚗",
    values: ["car_dealership", "auto_repair", "motorcycle_repair", "car_wash"],
  },
  {
    label: "Imóveis & Hotelaria",
    emoji: "🏠",
    values: ["real_estate", "hotel"],
  },
  {
    label: "Tecnologia & Outros",
    emoji: "📱",
    values: ["electronics_repair", "cellphone_store", "print_shop", "florist", "pharmacy", "travel_agency", "delivery_business", "product_shelf", "other"],
  },
];

// ===== Step definitions =====
const STEPS = [
  { number: 1, label: "Categoria" },
  { number: 2, label: "Detalhes" },
];

// ===== Helpers =====
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function formatWhatsApp(value: string): string {
  // Remove everything except digits
  let digits = value.replace(/\D/g, "");
  // Auto-add +55 if international code not detected
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

export default function NewBusinessPage() {
  const router = useRouter();

  // ===== Wizard state =====
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappDisplay, setWhatsappDisplay] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Subscription limits =====
  const { tier, canCreateBusiness, usage, limits, isLoading: limitsLoading } = useSubscriptionLimits();

  // ===== Filtered & grouped categories =====
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return CATEGORY_GROUPS;

    const q = searchQuery.toLowerCase();
    return CATEGORY_GROUPS.map((group) => ({
      ...group,
      values: group.values.filter((v) => {
        const cat = BUSINESS_CATEGORIES.find((c) => c.value === v);
        if (!cat) return false;
        return (
          cat.label.toLowerCase().includes(q) ||
          cat.value.toLowerCase().includes(q)
        );
      }),
    })).filter((g) => g.values.length > 0);
  }, [searchQuery]);

  const selectedCategoryLabel = useMemo(() => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.value === category);
    return cat?.label || "";
  }, [category]);

  // ===== Handlers =====
  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  function handleWhatsAppChange(value: string) {
    // Remove format characters for display
    const cleaned = value.replace(/\D/g, "");
    setWhatsappDisplay(displayWhatsApp(cleaned));
    setWhatsapp(formatWhatsApp(cleaned));
  }

  function selectCategory(value: string) {
    setCategory(value);
    setStep(2);
  }

  function resetStep() {
    setCategory("");
    setStep(1);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (limitsLoading) {
      setError("Verificando limites do seu plano...");
      return;
    }

    const limitCheck = checkActionLimit(
      tier,
      "businesses",
      usage.businesses
    );
    if (!limitCheck.allowed) {
      setError(limitCheck.message || "Limite de negócios atingido");
      return;
    }

    if (!name.trim()) {
      setError("Nome do negócio é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          slug: slug || slugify(name),
          category,
          description: description.trim() || null,
          whatsapp: whatsapp || null,
        })
        .select()
        .single();

      if (bizError) throw bizError;

      toast.success("Negócio criado com sucesso!");
      router.push(`/dashboard/business/${business.id}/setup`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar negócio");
      toast.error("Erro ao criar negócio");
    } finally {
      setLoading(false);
    }
  }

  // ===== Plan limit banner =====
  const showPlanLimit = !limitsLoading && !canCreateBusiness;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Voltar ao Dashboard
      </Link>

      {/* ===== Header ===== */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
          Criar Novo Negócio
        </h1>
        <p className="text-sm text-[#64748B] max-w-lg">
          Crie um perfil digital para seu negócio. Em poucos minutos você terá uma página pronta com QR Code.
        </p>
      </div>

      {/* ===== Plan limit banner (glass style) ===== */}
      {showPlanLimit && (
        <div className="mb-6 relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 text-sm">Limite do plano atingido</p>
              <p className="text-amber-600 text-xs mt-1 leading-relaxed">
                Você já possui {usage.businesses} negócio(s) no plano {tier === "free" ? "Grátis" : "atual"}. 
                Faça upgrade para criar mais negócios.
              </p>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm" className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 bg-white/50 backdrop-blur-sm text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 mr-1" />
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ===== Step Indicator ===== */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500
                  ${step === s.number
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                    : step > s.number
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-[#F1F5F9] text-[#94A3B8]"
                  }
                `}
              >
                {step > s.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`
                  text-[11px] font-semibold mt-1.5 transition-colors
                  ${step === s.number ? "text-indigo-600" : "text-[#94A3B8]"}
                `}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 mt-[-1.25rem] rounded-full overflow-hidden bg-[#E2E8F0]">
                <div
                  className={`h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 ${
                    step > s.number ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== STEP 1: Category Selection ===== */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in-up">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Qual o tipo do seu negócio?</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Escolha a categoria que melhor descreve seu negócio.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category groups */}
          <div className="space-y-8">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{group.emoji}</span>
                  <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    {group.label}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.values.map((value) => {
                    const cat = BUSINESS_CATEGORIES.find((c) => c.value === value);
                    if (!cat) return null;
                    const Icon = getCategoryIcon(cat.icon);
                    const isSelected = category === value;

                    return (
                      <button
                        key={value}
                        onClick={() => selectCategory(value)}
                        className={`
                          group relative p-4 rounded-xl text-center transition-all duration-300
                          ${isSelected
                            ? "ring-2 ring-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                            : "bg-white border border-[#E2E8F0] hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5"
                          }
                        `}
                      >
                        {/* Selection checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={`
                            w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center transition-all duration-300
                            ${isSelected
                              ? "bg-indigo-100 text-indigo-600 scale-110"
                              : "bg-[#F8FAFC] text-[#64748B] group-hover:bg-indigo-50 group-hover:text-indigo-500"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Label */}
                        <span
                          className={`
                            block text-xs font-semibold leading-tight transition-colors
                            ${isSelected ? "text-indigo-700" : "text-[#0F172A] group-hover:text-indigo-600"}
                          `}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Empty search state */}
          {filteredGroups.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-medium text-[#64748B]">
                Nenhuma categoria encontrada para &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== STEP 2: Business Details ===== */}
      {step === 2 && (
        <div className="animate-fade-in-up">
          {/* Selected category pill */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={resetStep}
              className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Alterar
            </button>
            <span className="text-[#94A3B8]">/</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              {(() => {
                const Icon = getCategoryIcon(
                  BUSINESS_CATEGORIES.find((c) => c.value === category)?.icon || ""
                );
                return <Icon className="w-3.5 h-3.5" />;
              })()}
              {selectedCategoryLabel}
            </div>
          </div>

          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">
              Informações do Negócio
            </h2>
            <p className="text-sm text-[#64748B] mb-6">
              Preencha os dados básicos para começar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-semibold text-[#0F172A]">
                  Nome do negócio <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Store className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Restaurante do João"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Slug (auto-generated, preview only) */}
              {name && (
                <div className="space-y-1.5">
                  <label htmlFor="slug" className="block text-sm font-semibold text-[#0F172A]">
                    Link personalizado
                  </label>
                  <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm">
                    <span className="text-[#94A3B8] font-medium">meuqr.com.br/q/</span>
                    <span className="text-[#0F172A] font-bold">{slug}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Este será o link da sua página. Gerado automaticamente.
                  </p>
                </div>
              )}

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-[#0F172A]">
                  WhatsApp <span className="text-[#94A3B8] font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#64748B] border-r border-[#E2E8F0] pr-3 mr-1">
                      <span className="text-emerald-500">📞</span>
                      <span>+55</span>
                    </div>
                  </div>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsappDisplay}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full h-11 pl-[5.5rem] pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                  />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Clientes vão usar este número para falar com você pelo WhatsApp.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-sm font-semibold text-[#0F172A]">
                  Descrição <span className="text-[#94A3B8] font-normal">(opcional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fale sobre seu negócio em poucas palavras..."
                  rows={3}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm resize-none"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9] pt-4" />

              {/* Template preview */}
              <div className="rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                    <span className="text-base">📄</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      Página gerada automaticamente
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Após criar, você escolherá um modelo de página compatível com &ldquo;{selectedCategoryLabel}&rdquo; 
                      e seu QR Code será gerado automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={resetStep}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all px-6"
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar Negócio
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Trust info */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Cancele quando quiser
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Suporte via WhatsApp
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
