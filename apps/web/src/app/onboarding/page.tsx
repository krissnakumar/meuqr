"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Button } from "@meuqr/ui";
import { BUSINESS_CATEGORIES } from "@meuqr/shared";
import { QrCode, Loader2, Building, MapPin, Store, ArrowRight, ArrowLeft, Search, Sparkles, User, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";

interface BrasilAPICNPJ {
  cnpj: string;
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

// CPF Checksum Validation Algorithm
function validateCPF(cpf: string) {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return false;
  
  // Reject identical digits
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  
  return true;
}

const steps = [
  { key: 1, keyName: "step_doc", icon: Building },
  { key: 2, keyName: "step_id", icon: Store },
  { key: 3, keyName: "step_address", icon: MapPin },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Document states
  const [docType, setDocType] = useState<"cnpj" | "cpf">("cnpj");
  const [cnpj, setCnpj] = useState("");
  const [cpf, setCpf] = useState("");
  const [searchingCnpj, setSearchingCnpj] = useState(false);

  // Business states
  const [bizName, setBizName] = useState("");
  const [bizSlug, setBizSlug] = useState("");
  const [bizCategory, setBizCategory] = useState("restaurant");
  const [bizPhone, setBizPhone] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");

  // Address states
  const [bizAddress, setBizAddress] = useState("");
  const [bizCep, setBizCep] = useState("");
  const [bizCity, setBizCity] = useState("");
  const [bizState, setBizState] = useState("");

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

  // Real-time CNPJ formatting
  const handleCnpjChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 2) formatted = `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length > 5) formatted = `${formatted.slice(0, 6)}.${clean.slice(5)}`;
    if (clean.length > 8) formatted = `${formatted.slice(0, 10)}/${clean.slice(8)}`;
    if (clean.length > 12) formatted = `${formatted.slice(0, 15)}-${clean.slice(12, 14)}`;
    setCnpj(formatted.slice(0, 18));
  };

  // Real-time CPF formatting
  const handleCpfChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 3) formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length > 6) formatted = `${formatted.slice(0, 7)}.${clean.slice(6)}`;
    if (clean.length > 9) formatted = `${formatted.slice(0, 11)}-${clean.slice(9, 11)}`;
    setCpf(formatted.slice(0, 14));
  };

  // Auto-slug generation when typing business name
  const handleNameChange = (val: string) => {
    setBizName(val);
    const slugified = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setBizSlug(slugified);
  };

  // CNPJ Lookup using free BrasilAPI
  async function handleCnpjLookup() {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      toast.error(t("onboarding.cnpj_invalid"));
      return;
    }

    setSearchingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) {
        throw new Error("Empresa não encontrada.");
      }

      const data: BrasilAPICNPJ = await res.json();
      
      const name = data.nome_fantasia || data.razao_social || "";
      handleNameChange(name);

      const phone = data.ddd_telefone_1 
        ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2, 6)}-${data.ddd_telefone_1.slice(6)}`
        : "";
      setBizPhone(phone);
      setBizWhatsapp(phone);

      setBizAddress(`${data.logradouro}, ${data.numero}${data.bairro ? ` - ${data.bairro}` : ""}`);
      setBizCep(data.cep || "");
      setBizCity(data.municipio || "");
      setBizState(data.uf || "");

      const desc = data.cnae_fiscal_descricao.toLowerCase();
      if (desc.includes("restaurante") || desc.includes("lanchonete") || desc.includes("pizza") || desc.includes("alimento") || desc.includes("refeição")) {
        setBizCategory("restaurant");
      } else if (desc.includes("vestuário") || desc.includes("moda") || desc.includes("roupa") || desc.includes("calçado")) {
        setBizCategory("clothing_store");
      } else if (desc.includes("beleza") || desc.includes("cabelo") || desc.includes("estética") || desc.includes("salão")) {
        setBizCategory("salon");
      } else if (desc.includes("hotel") || desc.includes("pousada") || desc.includes("hospedagem")) {
        setBizCategory("hotel");
      } else if (desc.includes("construção") || desc.includes("material") || desc.includes("ferragem") || desc.includes("tinta")) {
        setBizCategory("construction_materials");
      } else if (desc.includes("mercado") || desc.includes("supermercado") || desc.includes("mercearia")) {
        setBizCategory("supermarket");
      } else if (desc.includes("farmácia") || desc.includes("drogaria") || desc.includes("farmacêutico")) {
        setBizCategory("pharmacy");
      } else if (desc.includes("pet") || desc.includes("animal") || desc.includes("veterinário")) {
        setBizCategory("pet_shop");
      } else if (desc.includes("oficina") || desc.includes("mecânica") || desc.includes("automotivo") || desc.includes("auto peças")) {
        setBizCategory("auto_repair");
      } else if (desc.includes("hospital") || desc.includes("clínica") || desc.includes("médico") || desc.includes("odontológico")) {
        setBizCategory("medical_clinic");
      } else if (desc.includes("academia") || desc.includes("ginástica") || desc.includes("esportes")) {
        setBizCategory("gym");
      } else if (desc.includes("imobiliária") || desc.includes("imóvel") || desc.includes("corretor")) {
        setBizCategory("real_estate");
      } else {
        setBizCategory("other");
      }

      toast.success(t("onboarding.cnpj_found"));
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(t("onboarding.cnpj_not_found"));
      setStep(2);
    } finally {
      setSearchingCnpj(false);
    }
  }

  // CPF Check before moving to Step 2
  function handleCpfNext() {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!validateCPF(cleanCpf)) {
      toast.error(t("onboarding.cpf_invalid"));
      return;
    }
    toast.success(t("onboarding.cpf_valid"));
    setStep(2);
  }

  // Reactive CEP Auto-fill via ViaCEP API
  const handleCepChange = async (val: string) => {
    const cleanCep = val.replace(/\D/g, "");
    let formatted = cleanCep;
    if (cleanCep.length > 5) {
      formatted = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
    }
    setBizCep(formatted.slice(0, 9));

    if (cleanCep.length === 8) {
      const toastId = toast.loading(t("onboarding.cep_searching"));
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        if (data.erro) {
          toast.error(t("onboarding.cep_not_found"), { id: toastId });
          return;
        }

        const street = data.logradouro || "";
        const neighborhood = data.bairro || "";
        const fullAddr = street + (neighborhood ? ` - ${neighborhood}` : "");
        
        setBizAddress(fullAddr);
        setBizCity(data.localidade || "");
        setBizState(data.uf || "");
        
        toast.success(t("onboarding.cep_filled"), { id: toastId });
      } catch (err) {
        toast.error(t("onboarding.cep_error"), { id: toastId });
      }
    }
  };

  async function handleOnboardingComplete() {
    if (!bizName || !bizSlug || !bizCategory) {
      toast.error(t("business.fill_required"));
      return;
    }

    setSubmitting(true);
    try {
      const docLabel = docType === "cnpj" ? `CNPJ: ${cnpj}` : `CPF: ${cpf}`;
      const finalDescription = `${docLabel} - Estabelecimento criado no onboarding do MeuQR.`;

      const { error } = await supabase.from("businesses").insert({
        owner_id: userId!,
        name: bizName,
        slug: bizSlug,
        category: bizCategory,
        phone: bizPhone || null,
        whatsapp: bizWhatsapp || null,
        address: bizAddress || null,
        city: bizCity || null,
        state: bizState || null,
        description: finalDescription,
        pix_key: null,
        subscription_tier: "free",
        is_active: true,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error(t("business.slug_taken"));
        } else {
          toast.error(t("errors.generic") + " " + error.message);
        }
        return;
      }

      toast.success(t("onboarding.setup_success"));
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Gradient background accents */}
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-indigo-400 pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl bg-violet-400 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight">MeuQR</span>
        </div>

        {/* Step Progress */}
        <div className="mb-8 animate-fade-in-up delay-1">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
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
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors ${
                      step >= s.key ? "text-[#0F172A]" : "text-[#94A3B8]"
                    }`}
                  >
                    {t(`onboarding.${s.keyName}`)}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 sm:w-12 h-px mx-2 relative">
                    <div className="absolute inset-0 bg-slate-200 rounded-full" />
                    <div
                      className={`absolute inset-0 bg-indigo-500 rounded-full transition-all duration-500 ${
                        step > s.key ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== STEP 1: Documentação ===== */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Building className="w-6 h-6 text-indigo-500" />
                </div>
                <GlassCardTitle className="text-xl font-bold">{t("onboarding.step_doc_title")}</GlassCardTitle>
                <p className="text-sm text-[#64748B] mt-1.5">
                  {t("onboarding.step_doc_desc")}
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {/* Document Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType("cnpj")}
                    className={`relative p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                      docType === "cnpj"
                        ? "border-indigo-500 bg-indigo-50/50 text-[#0F172A] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-[#64748B] bg-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                      docType === "cnpj" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-[#94A3B8]"
                    }`}>
                      <Building className="w-4 h-4" />
                    </div>
                    {t("onboarding.cnpj_option")}
                    <span className="block text-xs font-normal text-[#94A3B8] mt-0.5">CNPJ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType("cpf")}
                    className={`relative p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                      docType === "cpf"
                        ? "border-indigo-500 bg-indigo-50/50 text-[#0F172A] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-[#64748B] bg-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                      docType === "cpf" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-[#94A3B8]"
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    {t("onboarding.cpf_option")}
                    <span className="block text-xs font-normal text-[#94A3B8] mt-0.5">CPF</span>
                  </button>
                </div>

                {docType === "cnpj" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        {t("onboarding.cnpj_label")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("onboarding.cnpj_placeholder")}
                          value={cnpj}
                          onChange={(e) => handleCnpjChange(e.target.value)}
                          className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                          <Building className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1.5">
                        {t("onboarding.cnpj_hint")}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleCnpjLookup}
                        disabled={searchingCnpj}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl shadow-md shadow-indigo-200"
                      >
                        {searchingCnpj ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        {t("onboarding.cnpj_search_btn")}
                      </Button>

                      <button
                        onClick={() => setStep(2)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-slate-200 transition-all"
                      >
                        {t("onboarding.cnpj_skip")}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        {t("onboarding.cpf_label")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("onboarding.cpf_placeholder")}
                          value={cpf}
                          onChange={(e) => handleCpfChange(e.target.value)}
                          className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1.5">
                        {t("onboarding.cpf_hint")}
                      </p>
                    </div>

                    <Button
                      onClick={handleCpfNext}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl shadow-md shadow-indigo-200"
                    >
                      {t("onboarding.cpf_validate_btn")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ===== STEP 2: Identificação ===== */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader className="pb-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
                    <Store className="w-4 h-4 text-indigo-500" />
                  </div>
                  <GlassCardTitle className="text-lg">{t("business.about_title")}</GlassCardTitle>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  {t("business.about_desc")}
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    {t("business.name_label")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("business.name_placeholder")}
                    value={bizName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    {t("business.slug_label")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <span className="inline-flex items-center px-3.5 bg-slate-50 text-[#64748B] text-sm border-r border-slate-200">
                      meuqr.com.br/
                    </span>
                    <input
                      type="text"
                      placeholder={t("business.slug_placeholder")}
                      value={bizSlug}
                      onChange={(e) => setBizSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                      className="flex-1 h-11 px-3.5 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("common.category")} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("business.phone_label")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("business.phone_placeholder")}
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    {t("business.whatsapp_label")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("business.whatsapp_placeholder")}
                    value={bizWhatsapp}
                    onChange={(e) => setBizWhatsapp(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-slate-200 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("common.back")}
                  </button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!bizName || !bizSlug}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.next")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* ===== STEP 3: Endereço ===== */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <GlassCard>
              <GlassCardHeader className="pb-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                  </div>
                  <GlassCardTitle className="text-lg">{t("onboarding.where_title")}</GlassCardTitle>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  {t("onboarding.where_desc")}
                </p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("onboarding.cep_label")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("onboarding.cep_placeholder")}
                      value={bizCep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("onboarding.address_label")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("onboarding.address_placeholder")}
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("common.city")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("common.city_placeholder")}
                      value={bizCity}
                      onChange={(e) => setBizCity(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      {t("common.state")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("common.state_placeholder")}
                      value={bizState}
                      maxLength={2}
                      onChange={(e) => setBizState(e.target.value.toUpperCase())}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("common.back")}
                  </button>
                  <Button
                    onClick={handleOnboardingComplete}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {t("onboarding.complete_setup")}
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* Back to login link */}
        <div className="text-center mt-6 animate-fade-in-up delay-3">
          <Link
            href="/login"
            className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            {t("auth.back_to_login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
