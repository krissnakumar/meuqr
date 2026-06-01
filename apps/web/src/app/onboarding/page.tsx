"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Button, Badge } from "@meuqr/ui";
import { VERTICAL_CONFIGS } from "@meuqr/shared";
import {
  QrCode,
  Loader2,
  Building,
  Store,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  User,
  Check,
  Globe,
  Download,
  ExternalLink,
  HeartPulse,
  Sparkles as SparklesIcon,
  UtensilsCrossed,
  Building2,
  ShoppingBag,
  Car,
  Home,
  Hotel,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  X,
  Plus,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";

// ===== Vertical icon mapping =====
const VERTICAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  heartpulse: HeartPulse,
  sparkles: SparklesIcon,
  utensilscrossed: UtensilsCrossed,
  building2: Building2,
  shoppingbag: ShoppingBag,
  car: Car,
  home: Home,
  hotel: Hotel,
  bookopen: BookOpen,
  briefcase: Briefcase,
  calendar: Calendar,
};

function getVerticalIcon(iconName: string) {
  const key = iconName.toLowerCase();
  return VERTICAL_ICONS[key] || Store;
}

// ===== CNPJ/CPF types =====
interface BrasilAPICNPJ {
  razao_social: string;
  nome_fantasia: string;
  ddd_telefone_1: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cnae_fiscal_descricao: string;
}

// CPF Validation
function validateCPF(cpf: string) {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0, rem;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean[i - 1]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean[i - 1]) * (12 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(clean[10])) return false;
  return true;
}

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
  if (!digits.startsWith("55") && digits.length >= 10) digits = "55" + digits;
  return digits;
}

function displayWhatsApp(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55")) digits = digits.slice(2);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// ===== Steps definition =====
const STEPS = [
  { key: 1, label: "Vertical", icon: Store },
  { key: 2, label: "Type", icon: Building },
  { key: 3, label: "Details", icon: User },
  { key: 4, label: "Preview", icon: QrCode },
  { key: 5, label: "Create", icon: Sparkles },
  { key: 6, label: "Done", icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [createdBusinessSlug, setCreatedBusinessSlug] = useState<string | null>(null);

  // Step 1: Vertical
  const [verticalSlug, setVerticalSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2: Subvertical
  const [subverticalSlug, setSubverticalSlug] = useState("");

  // Step 3: Business Info
  const [bizName, setBizName] = useState("");
  const [bizSlug, setBizSlug] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizWhatsappDisplay, setBizWhatsappDisplay] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizCep, setBizCep] = useState("");
  const [bizCity, setBizCity] = useState("");
  const [bizState, setBizState] = useState("");
  const [bizBrandColor, setBizBrandColor] = useState("#4F46E5");
  const [bizLogo, setBizLogo] = useState("");
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});

  // CNPJ/CPF
  const [docType, setDocType] = useState<"cnpj" | "cpf">("cnpj");
  const [cnpj, setCnpj] = useState("");
  const [cpf, setCpf] = useState("");
  const [searchingDoc, setSearchingDoc] = useState(false);

  // ===== Derived data =====
  const verticalKeys = useMemo(() => Object.keys(VERTICAL_CONFIGS), []);

  const filteredVerticals = useMemo(() => {
    if (!searchQuery) return verticalKeys;
    const q = searchQuery.toLowerCase();
    return verticalKeys.filter((key) => {
      const v = VERTICAL_CONFIGS[key];
      return (
        v.label.toLowerCase().includes(q) ||
        key.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, verticalKeys]);

  const currentVertical = verticalSlug ? VERTICAL_CONFIGS[verticalSlug] : null;
  const subverticalEntries = useMemo(() => {
    if (!currentVertical) return [];
    return Object.entries(currentVertical.subverticals);
  }, [currentVertical]);

  // ===== Workspace preview =====
  const workspacePreview = useMemo(() => {
    if (!verticalSlug) return null;

    const v = VERTICAL_CONFIGS[verticalSlug];
    const subName = subverticalSlug && v ? v.subverticals[subverticalSlug] : null;

    const pages = ["Home", "Contact"];
    const modules = ["Pages", "QR Codes", "Inbox", "Analytics"];

    switch (verticalSlug) {
      case "health":
      case "beauty_wellness":
        pages.splice(1, 0, "Book Appointment", "Services");
        modules.push("Appointments", "Services");
        break;
      case "food_beverage":
        pages.splice(1, 0, "Menu");
        modules.push("Menu", "Orders");
        break;
      case "construction":
      case "automotive":
        pages.splice(1, 0, "Products", "Request Quote");
        modules.push("Products", "Quote Requests");
        break;
      case "retail":
        pages.splice(1, 0, "Products");
        modules.push("Products", "Orders");
        break;
      case "real_estate":
        pages.splice(1, 0, "Properties");
        modules.push("Properties", "Leads");
        break;
      case "hotels_tourism":
        pages.splice(1, 0, "Rooms", "Services");
        modules.push("Bookings", "Reviews");
        break;
      case "education":
        pages.splice(1, 0, "Courses");
        modules.push("Courses", "Enrollments");
        break;
      case "professional_services":
        pages.splice(1, 0, "Book Consultation");
        modules.push("Appointments", "Services");
        break;
      case "events":
        pages.splice(1, 0, "Portfolio", "Packages");
        modules.push("Packages", "Portfolio", "Bookings");
        break;
    }

    return { pages, modules, displayName: subName || v.label };
  }, [verticalSlug, subverticalSlug]);

  // ===== Initial check =====
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

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

  // ===== Handlers =====
  function handleNameChange(val: string) {
    setBizName(val);
    setBizSlug(slugify(val));
  }

  function handleWhatsAppChange(val: string) {
    const cleaned = val.replace(/\D/g, "");
    setBizWhatsappDisplay(displayWhatsApp(cleaned));
    setBizWhatsapp(formatWhatsApp(cleaned));
  }

  // CNPJ formatting
  const handleCnpjChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 2) formatted = `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length > 5) formatted = `${formatted.slice(0, 6)}.${clean.slice(5)}`;
    if (clean.length > 8) formatted = `${formatted.slice(0, 10)}/${clean.slice(8)}`;
    if (clean.length > 12) formatted = `${formatted.slice(0, 15)}-${clean.slice(12, 14)}`;
    setCnpj(formatted.slice(0, 18));
  };

  // CPF formatting
  const handleCpfChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 3) formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length > 6) formatted = `${formatted.slice(0, 7)}.${clean.slice(6)}`;
    if (clean.length > 9) formatted = `${formatted.slice(0, 11)}-${clean.slice(9, 11)}`;
    setCpf(formatted.slice(0, 14));
  };

  // CNPJ Lookup via BrasilAPI
  async function handleCnpjLookup() {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      toast.error("CNPJ inválido. Digite 14 dígitos.");
      return;
    }

    setSearchingDoc(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) throw new Error("CNPJ não encontrado.");

      const data: BrasilAPICNPJ = await res.json();
      const name = data.nome_fantasia || data.razao_social || "";
      handleNameChange(name);

      const phone = data.ddd_telefone_1
        ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2, 6)}-${data.ddd_telefone_1.slice(6)}`
        : "";
      handleWhatsAppChange(phone);

      setBizAddress(`${data.logradouro}, ${data.numero}${data.bairro ? ` - ${data.bairro}` : ""}`);
      setBizCep(data.cep || "");
      setBizCity(data.municipio || "");
      setBizState(data.uf || "");

      toast.success("CNPJ encontrado! Dados preenchidos automaticamente.");
      setSearchingDoc(false);
      
      // Try to auto-select vertical based on CNAE
      const desc = data.cnae_fiscal_descricao?.toLowerCase() || "";
      const autoVertical = 
        desc.includes("restaurante") || desc.includes("alimento") || desc.includes("lanchonete") ? "food_beverage" :
        desc.includes("construção") || desc.includes("material") || desc.includes("ferragem") ? "construction" :
        desc.includes("vestuário") || desc.includes("roupa") || desc.includes("moda") ? "retail" :
        desc.includes("beleza") || desc.includes("cabelo") || desc.includes("salão") ? "beauty_wellness" :
        desc.includes("oficina") || desc.includes("mecânica") || desc.includes("automotivo") ? "automotive" :
        desc.includes("imobiliária") || desc.includes("imóvel") ? "real_estate" :
        desc.includes("hotel") || desc.includes("pousada") || desc.includes("hospedagem") ? "hotels_tourism" :
        desc.includes("escola") || desc.includes("curso") || desc.includes("ensino") ? "education" :
        desc.includes("advocacia") || desc.includes("contábil") || desc.includes("consultoria") ? "professional_services" :
        desc.includes("evento") || desc.includes("fotografia") || desc.includes("buffet") ? "events" :
        desc.includes("hospital") || desc.includes("clínica") || desc.includes("médico") || desc.includes("dentista") ? "health" :
        null;

      if (autoVertical) {
        setVerticalSlug(autoVertical);
        setStep(2); // Go to subvertical selection so user can confirm
      } else {
        setStep(3); // No auto-detect, go directly to details
      }
    } catch (err) {
      toast.error("CNPJ não encontrado. Preencha manualmente.");
      setSearchingDoc(false);
      setStep(3);
    }
  }

  // CEP Auto-fill via ViaCEP
  const handleCepChange = async (val: string) => {
    const cleanCep = val.replace(/\D/g, "");
    let formatted = cleanCep;
    if (cleanCep.length > 5) formatted = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
    setBizCep(formatted.slice(0, 9));

    if (cleanCep.length === 8) {
      const toastId = toast.loading("Buscando CEP...");
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.erro) { toast.error("CEP não encontrado.", { id: toastId }); return; }
        setBizAddress(`${data.logradouro || ""}${data.bairro ? ` - ${data.bairro}` : ""}`);
        setBizCity(data.localidade || "");
        setBizState(data.uf || "");
        toast.success("Endereço preenchido automaticamente!", { id: toastId });
      } catch (err) {
        toast.error("Erro ao buscar CEP.", { id: toastId });
      }
    }
  };

  // Opening hours helpers
  const weekdays = [
    { key: "segunda", label: "Segunda" },
    { key: "terca", label: "Terça" },
    { key: "quarta", label: "Quarta" },
    { key: "quinta", label: "Quinta" },
    { key: "sexta", label: "Sexta" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
  ];

  function handleHourChange(day: string, value: string) {
    setOpeningHours((prev) => ({ ...prev, [day]: value }));
  }

  function handleAddHoursPreset() {
    const preset: Record<string, string> = {
      segunda: "08:00 - 18:00",
      terca: "08:00 - 18:00",
      quarta: "08:00 - 18:00",
      quinta: "08:00 - 18:00",
      sexta: "08:00 - 18:00",
      sabado: "08:00 - 12:00",
      domingo: "Fechado",
    };
    setOpeningHours(preset);
  }

  // ===== Create workspace (Step 5) =====
  async function handleCreateWorkspace() {
    if (!bizName || !bizSlug || !verticalSlug) {
      toast.error("Preencha o nome do negócio.");
      return;
    }

    setSubmitting(true);
    setStep(5); // Show creating state

    try {
      // 1. Create business
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .insert({
          owner_id: userId!,
          name: bizName.trim(),
          slug: bizSlug,
          category: subverticalSlug || verticalSlug,
          description: bizName.trim(),
          whatsapp: bizWhatsapp || null,
          address: bizAddress || null,
          city: bizCity || null,
          state: bizState || null,
          brand_color: bizBrandColor,
          opening_hours: Object.keys(openingHours).length > 0 ? openingHours : null,
          subscription_tier: "free",
          is_active: true,
          onboarding_completed: false,
          setup_step: 0,
        })
        .select()
        .single();

      if (bizError) {
        if (bizError.code === "23505") {
          toast.error("Este link já está em uso. Escolha outro nome.");
        } else {
          toast.error("Erro ao criar negócio: " + bizError.message);
        }
        setSubmitting(false);
        return;
      }

      const businessId = business.id;
      setCreatedBusinessId(businessId);
      setCreatedBusinessSlug(business.slug);

      // 2. Try to look up vertical_id from our verticals table
      let verticalId: string | null = null;
      const { data: verticals } = await supabase
        .from("business_verticals")
        .select("id")
        .eq("slug", verticalSlug)
        .limit(1);
      if (verticals && verticals.length > 0) {
        verticalId = verticals[0].id;
      }

      // 3. Create default pages based on vertical
      const pagesToCreate = workspacePreview?.pages || ["Home", "Contact"];
      for (let i = 0; i < pagesToCreate.length; i++) {
        const pageTitle = pagesToCreate[i];
        const pageSlug = slugify(pageTitle);
        const { data: page } = await supabase
          .from("pages")
          .insert({
            business_id: businessId,
            title: pageTitle,
            slug: pageSlug,
            page_type: "custom",
            status: "published",
            is_published: true,
            show_in_navigation: i < 4,
            sort_order: i,
          })
          .select()
          .single();

        // Create a hero section for each page
        if (page) {
          await supabase.from("page_sections").insert({
            page_id: page.id,
            section_type: "hero",
            title: `Bem-vindo ao ${bizName}`,
            content: `Conheça nossos ${pageTitle.toLowerCase()} e entre em contato pelo WhatsApp.`,
            sort_order: 0,
          });
        }
      }

      // 4. Create QR code for the business
      const qrCodeSlug = bizSlug.slice(0, 10);
      await supabase.from("qr_codes").insert({
        business_id: businessId,
        short_code: qrCodeSlug,
        title: `QR Principal - ${bizName}`,
        qr_type: "main",
        is_active: true,
      });

      // 5. Update vertical_id on the business
      if (verticalId) {
        await supabase
          .from("businesses")
          .update({ vertical_id: verticalId, onboarding_completed: true, setup_step: 6 })
          .eq("id", businessId);
      }

      toast.success("Workspace criado com sucesso!");
      setStep(6);
      setSubmitting(false);

    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar workspace. Tente novamente.");
      setSubmitting(false);
    }
  }

  // ===== Loading state =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#64748B] animate-pulse">{t("common.preparing")}</p>
      </div>
    );
  }

  // ===== Step indicator =====
  function StepIndicator() {
    return (
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          {STEPS.filter((s) => s.key <= 5).map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s.key
                      ? "bg-emerald-100 text-emerald-700"
                      : step === s.key
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-100 text-[#94A3B8]"
                  }`}
                >
                  {step > s.key ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors ${
                  step >= s.key ? "text-[#0F172A]" : "text-[#94A3B8]"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 4 && (
                <div className="w-8 sm:w-12 h-px mx-2 relative">
                  <div className="absolute inset-0 bg-slate-200 rounded-full" />
                  <div className={`absolute inset-0 bg-indigo-500 rounded-full transition-all duration-500 ${
                    step > s.key ? "w-full" : "w-0"
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Gradient background accents */}
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-indigo-400 pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl bg-violet-400 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-6 animate-fade-in-up">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight">MeuQR</span>
          <span className="text-[10px] font-bold text-[#94A3B8] bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Business OS</span>
        </div>

        {/* Subtitle */}
        <p className="text-center text-sm text-[#64748B] mb-8 -mt-2 animate-fade-in-up delay-1">
          Choose your business type and get a ready-to-use digital workspace in 5 minutes.
        </p>

        {/* Step indicator (hide on success) */}
        {step < 6 && <StepIndicator />}

        {/* ================================================================ */}
        {/* STEP 1: Choose Vertical */}
        {/* ================================================================ */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Store className="w-6 h-6 text-indigo-500" />
                </div>
                <GlassCardTitle className="text-xl font-bold">What's your business type?</GlassCardTitle>
                <p className="text-sm text-[#64748B] mt-1.5">
                  Choose your industry and we'll create a tailored workspace with the tools you need.
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search business types..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Vertical Cards */}
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 -mx-1 px-1">
                  {filteredVerticals.map((key) => {
                    const v = VERTICAL_CONFIGS[key];
                    const Icon = getVerticalIcon(v.icon);
                    const isSelected = verticalSlug === key;

                    return (
                      <button
                        key={key}
                        onClick={() => { setVerticalSlug(key); setStep(2); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                            : "border-[#E2E8F0] bg-white hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-100 text-indigo-600 scale-110"
                            : "bg-gradient-to-br from-slate-50 to-slate-100 text-[#64748B] border border-[#E2E8F0]"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-[#0F172A]"}`}>
                            {v.emoji} {v.label}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{v.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? "text-indigo-500" : "text-[#CBD5E1]"}`} />
                      </button>
                    );
                  })}

                  {filteredVerticals.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
                      <p className="text-sm text-[#64748B]">No business types found for "{searchQuery}"</p>
                      <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-indigo-600 font-semibold">
                        Clear search
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick document entry */}
                <div className="pt-3 border-t border-[#F1F5F9]">
                  <p className="text-xs text-[#94A3B8] text-center mb-3">Or enter your document to auto-fill</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setDocType("cnpj"); setStep(1.5); }}
                      className="p-3 rounded-xl border border-[#E2E8F0] text-center text-xs font-semibold text-[#64748B] hover:border-indigo-200 hover:text-indigo-600 transition-all bg-white"
                    >
                      <Building className="w-4 h-4 mx-auto mb-1" />
                      CNPJ Lookup
                    </button>
                    <button
                      onClick={() => { setDocType("cpf"); setStep(1.5); }}
                      className="p-3 rounded-xl border border-[#E2E8F0] text-center text-xs font-semibold text-[#64748B] hover:border-indigo-200 hover:text-indigo-600 transition-all bg-white"
                    >
                      <User className="w-4 h-4 mx-auto mb-1" />
                      CPF
                    </button>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 1.5: Document entry (CNPJ/CPF) inside step 1 */}
        {/* ================================================================ */}
        {step === 1.5 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setStep(1)} className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <GlassCardTitle className="text-lg">
                    {docType === "cnpj" ? "Buscar por CNPJ" : "Validar CPF"}
                  </GlassCardTitle>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  {docType === "cnpj"
                    ? "Preencha os dados automaticamente buscando pelo CNPJ."
                    : "Valide seu CPF para continuar."}
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {docType === "cnpj" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CNPJ</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => handleCnpjChange(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <Button
                      onClick={handleCnpjLookup}
                      disabled={searchingDoc}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl"
                    >
                      {searchingDoc ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Buscar CNPJ
                    </Button>
                    <button
                      onClick={() => setStep(3)}
                      className="w-full text-center text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                    >
                      Pular e preencher manualmente
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CPF</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const cleanCpf = cpf.replace(/\D/g, "");
                        if (!validateCPF(cleanCpf)) {
                          toast.error("CPF inválido. Verifique os dígitos.");
                          return;
                        }
                        toast.success("CPF válido!");
                        setStep(3);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl"
                    >
                      Validar e Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <button
                      onClick={() => setStep(3)}
                      className="w-full text-center text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                    >
                      Pular
                    </button>
                  </>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: Choose Subvertical */}
        {/* ================================================================ */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setStep(1)} className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <GlassCardTitle className="text-lg">What type of business?</GlassCardTitle>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  {currentVertical?.emoji} {currentVertical?.label} — {currentVertical?.description}
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-2">
                {subverticalEntries.map(([slug, name]) => {
                  const isSelected = subverticalSlug === slug;
                  return (
                    <button
                      key={slug}
                      onClick={() => { setSubverticalSlug(slug); setStep(3); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-indigo-200 hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-indigo-100 text-indigo-600" : "bg-slate-50 text-[#64748B]"
                      }`}>
                        {isSelected ? <Check className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-[#0F172A]"}`}>
                        {name}
                      </span>
                    </button>
                  );
                })}

                {/* "Other" option */}
                <button
                  onClick={() => { setSubverticalSlug(""); setStep(3); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed text-left transition-all ${
                    subverticalSlug === ""
                      ? "border-indigo-300 bg-indigo-50/30"
                      : "border-[#E2E8F0] bg-white hover:border-indigo-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <MoreHorizontal className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#64748B]">Other / Not listed</span>
                    <p className="text-xs text-[#94A3B8]">I'll customize my workspace</p>
                  </div>
                </button>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 3: Business Info */}
        {/* ================================================================ */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setStep(2)} className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <GlassCardTitle className="text-lg">Tell us about your business</GlassCardTitle>
                </div>
                <p className="text-sm text-[#64748B] mt-1">We'll use this info to create your digital workspace.</p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {/* Vertical badge */}
                {currentVertical && (
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="indigo" className="text-xs">
                      {currentVertical.emoji} {currentVertical.label}
                      {subverticalSlug && ` / ${currentVertical.subverticals[subverticalSlug]}`}
                    </Badge>
                  </div>
                )}

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bella Vista Restaurant"
                    value={bizName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    autoFocus
                  />
                </div>

                {/* Slug preview */}
                {bizName && (
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Your public link</label>
                    <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm">
                      <Globe className="w-4 h-4 text-[#94A3B8]" />
                      <span className="text-[#94A3B8] font-medium">meuqr.com/b/</span>
                      <span className="text-[#0F172A] font-bold">{bizSlug}</span>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="text-sm font-semibold text-[#64748B] border-r border-[#E2E8F0] pr-3 mr-1">+55</span>
                    </div>
                    <input
                      type="tel"
                      value={bizWhatsappDisplay}
                      onChange={(e) => handleWhatsAppChange(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full h-11 pl-[3.8rem] pr-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                {/* CEP + Address */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={bizCep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Address</label>
                    <input
                      type="text"
                      placeholder="Street, number - neighborhood"
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                {/* City + State */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={bizCity}
                      onChange={(e) => setBizCity(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">State</label>
                    <input
                      type="text"
                      placeholder="SP"
                      maxLength={2}
                      value={bizState}
                      onChange={(e) => setBizState(e.target.value.toUpperCase())}
                      className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bizBrandColor}
                      onChange={(e) => setBizBrandColor(e.target.value)}
                      className="w-11 h-11 rounded-xl border border-[#E2E8F0] cursor-pointer"
                    />
                    <span className="text-sm text-[#64748B] font-mono">{bizBrandColor}</span>
                    <div className="flex gap-1.5 ml-auto">
                      {["#4F46E5", "#059669", "#DC2626", "#D97706", "#7C3AED", "#0891B2"].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBizBrandColor(color)}
                          className={`w-7 h-7 rounded-lg border-2 transition-all ${
                            bizBrandColor === color ? "border-[#0F172A] scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-[#0F172A]">Opening Hours</label>
                    <button
                      onClick={handleAddHoursPreset}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      + Use preset
                    </button>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {weekdays.map((day) => (
                      <div key={day.key} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#64748B] w-14 shrink-0">{day.label}</span>
                        <input
                          type="text"
                          placeholder="Fechado"
                          value={openingHours[day.key] || ""}
                          onChange={(e) => handleHourChange(day.key, e.target.value)}
                          className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => {
                      setSubverticalSlug("");
                      if (currentVertical) {
                        const keys = Object.keys(currentVertical.subverticals);
                        setStep(keys.length > 0 ? 2 : 1);
                      } else {
                        setStep(1);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-slate-200 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!bizName || !bizSlug}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Preview Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 4: Workspace Preview */}
        {/* ================================================================ */}
        {step === 4 && workspacePreview && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <GlassCardTitle className="text-xl font-bold">Your digital workspace</GlassCardTitle>
                <p className="text-sm text-[#64748B] mt-1.5">
                  We'll create a tailored workspace for your business:
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {/* Business summary */}
                <div className="rounded-xl bg-gradient-to-br from-indigo-50/70 to-purple-50/30 border border-indigo-100/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A]">{bizName}</p>
                      <p className="text-xs text-[#64748B]">{workspacePreview.displayName} workspace</p>
                    </div>
                  </div>
                </div>

                {/* Pages to create */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-indigo-600">{workspacePreview.pages.length}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Pages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workspacePreview.pages.map((page, i) => (
                      <div key={page} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-sm">
                        <Check className="w-3 h-3 text-emerald-500" />
                        {page}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modules to enable */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-600">{workspacePreview.modules.length}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Features</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workspacePreview.modules.map((mod) => (
                      <div key={mod} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-sm">
                        <Check className="w-3 h-3 text-emerald-500" />
                        {mod}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code */}
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-[#E2E8F0] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                    <QrCode className="w-5 h-5 text-[#0F172A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">Main QR Code</p>
                    <p className="text-xs text-[#64748B]">meuqr.com/b/{bizSlug}</p>
                  </div>
                  <Download className="w-4 h-4 text-[#94A3B8]" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-slate-200 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Edit Info
                  </button>
                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Workspace
                      </>
                    )}
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 5: Creating (intermediate state) */}
        {/* ================================================================ */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-2">Creating your workspace</h2>
                <p className="text-sm text-[#64748B] mb-6">Setting up pages, QR codes, and features...</p>
                <div className="flex justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 6: Success! */}
        {/* ================================================================ */}
        {step === 6 && (
          <div className="animate-fade-in-up">
            <GlassCard className="border-emerald-200/50">
              <GlassCardContent className="py-10 text-center">
                {/* Success animation */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                  <Check className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Your workspace is ready!</h2>
                <p className="text-sm text-[#64748B] mb-8 max-w-sm mx-auto">
                  Your digital workspace for <strong>{bizName}</strong> is set up. Start adding content and sharing with your customers.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <FileText className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-[#0F172A]">{workspacePreview?.pages.length || 0}</p>
                    <p className="text-[10px] font-medium text-[#64748B]">Pages</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <LayoutDashboard className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-[#0F172A]">{workspacePreview?.modules.length || 0}</p>
                    <p className="text-[10px] font-medium text-[#64748B]">Features</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <QrCode className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-[#0F172A]">1</p>
                    <p className="text-[10px] font-medium text-[#64748B]">QR Code</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Link href={createdBusinessId ? `/dashboard/business/${createdBusinessId}` : "/dashboard"}>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 text-base">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Open Dashboard
                    </Button>
                  </Link>

                  {createdBusinessSlug && (
                    <Link href={`/b/${createdBusinessSlug}`} target="_blank">
                      <Button variant="outline" className="w-full py-4 rounded-xl text-base">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Preview Public Page
                      </Button>
                    </Link>
                  )}

                  {createdBusinessId && (
                    <Link href={createdBusinessId ? `/dashboard/business/${createdBusinessId}/pages` : "#"}>
                      <Button variant="ghost" className="w-full py-4 rounded-xl text-base text-[#64748B]">
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Product / Service
                      </Button>
                    </Link>
                  )}
                </div>

                {/* WhatsApp share */}
                {bizWhatsapp && (
                  <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
                    <p className="text-xs text-[#94A3B8] mb-3">Share with your customers</p>
                    <a
                      href={`https://wa.me/${bizWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Confira meu novo workspace digital: meuqr.com/b/${createdBusinessSlug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Share on WhatsApp
                    </a>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* Back to login link (only on first steps) */}
        {step < 4 && (
          <div className="text-center mt-6 animate-fade-in-up delay-3">
            <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
