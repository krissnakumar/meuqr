"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { BUSINESS_CATEGORIES } from "@meuqr/shared";
import { QrCode, Loader2, Building, MapPin, Store, ArrowRight, ArrowLeft, Search, Sparkles, User } from "lucide-react";
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

export default function OnboardingPage() {
  const router = useRouter();
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
  const [bizCategory, setBizCategory] = useState("restaurante");
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Remove duplicate dashes
      .trim();
    setBizSlug(slugified);
  };

  // CNPJ Lookup using free BrasilAPI
  async function handleCnpjLookup() {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      toast.error("CNPJ deve conter 14 dígitos.");
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

      toast.success("Empresa localizada com sucesso!");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível localizar o CNPJ. Preencha os dados no próximo passo.");
      setStep(2);
    } finally {
      setSearchingCnpj(false);
    }
  }

  // CPF Check before moving to Step 2
  function handleCpfNext() {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!validateCPF(cleanCpf)) {
      toast.error("Insira um CPF válido.");
      return;
    }
    toast.success("CPF validado com sucesso!");
    setStep(2);
  }

  // Reactive CEP Auto-fill via ViaCEP API
  const handleCepChange = async (val: string) => {
    // Keep only numbers and apply simple mask 00000-000
    const cleanCep = val.replace(/\D/g, "");
    let formatted = cleanCep;
    if (cleanCep.length > 5) {
      formatted = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
    }
    setBizCep(formatted.slice(0, 9));

    // When hits exactly 8 digits, fetch address automatically
    if (cleanCep.length === 8) {
      const toastId = toast.loading("Buscando CEP...");
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        if (data.erro) {
          toast.error("CEP não localizado.", { id: toastId });
          return;
        }

        const street = data.logradouro || "";
        const neighborhood = data.bairro || "";
        const fullAddr = street + (neighborhood ? ` - ${neighborhood}` : "");
        
        setBizAddress(fullAddr);
        setBizCity(data.localidade || "");
        setBizState(data.uf || "");
        
        toast.success("Endereço preenchido automaticamente pelo CEP!", { id: toastId });
      } catch (err) {
        toast.error("Erro ao buscar CEP. Preencha manualmente.", { id: toastId });
      }
    }
  };

  async function handleOnboardingComplete() {
    if (!bizName || !bizSlug || !bizCategory) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      // Append CPF or CNPJ details directly into the description
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
          toast.error("Este endereço (URL amigável) já está em uso por outro estabelecimento.");
        } else {
          toast.error("Erro ao cadastrar negócio: " + error.message);
        }
        return;
      }

      toast.success("Setup concluído com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro interno. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
        <p className="text-sm font-medium text-gray-500">Preparando seu setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center shadow-lg shadow-[#1877F2]/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#050505] tracking-tight">MeuQR</span>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-6 flex items-center justify-between px-2 text-xs font-semibold text-gray-400">
          <span className={step >= 1 ? "text-[#1877F2]" : ""}>1. Documentação</span>
          <span className={step >= 2 ? "text-[#1877F2]" : ""}>2. Identificação</span>
          <span className={step >= 3 ? "text-[#1877F2]" : ""}>3. Endereço</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1877F2] to-[#4094F7] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Wizard Cards */}
        {step === 1 && (
          <Card className="animate-slide-up">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mx-auto mb-2">
                <Building className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold">Como deseja se cadastrar?</CardTitle>
              <CardDescription>
                Selecione se você atua como Pessoa Jurídica (CNPJ) ou Autônomo/Pessoa Física (CPF).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Premium Document Type Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setDocType("cnpj")}
                  className={`py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    docType === "cnpj"
                      ? "border-[#1877F2] bg-[#1877F2]/5 text-[#1877F2] shadow-sm shadow-[#1877F2]/5"
                      : "border-[#E4E6EB] hover:border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  <Building className="w-4 h-4 inline mr-1.5" />
                  Pessoa Jurídica (CNPJ)
                </button>
                <button
                  type="button"
                  onClick={() => setDocType("cpf")}
                  className={`py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    docType === "cpf"
                      ? "border-[#1877F2] bg-[#1877F2]/5 text-[#1877F2] shadow-sm shadow-[#1877F2]/5"
                      : "border-[#E4E6EB] hover:border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1.5" />
                  Pessoa Física (CPF)
                </button>
              </div>

              {docType === "cnpj" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ do seu estabelecimento</Label>
                    <div className="relative">
                      <Input
                        id="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => handleCnpjChange(e.target.value)}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">Preenchimento automático via consulta pública BrasilAPI.</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleCnpjLookup}
                      className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-5"
                      disabled={searchingCnpj}
                    >
                      {searchingCnpj ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Buscar dados e Avançar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full border-slate-200 text-gray-600 hover:bg-slate-50 py-5"
                    >
                      Pular auto-preenchimento
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">Seu CPF</Label>
                    <div className="relative">
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">Por privacidade, dados de CPF são validados localmente.</p>
                  </div>

                  <Button
                    onClick={handleCpfNext}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-5"
                  >
                    Validar CPF e Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-[#1877F2]" />
                Sobre o seu Negócio
              </CardTitle>
              <CardDescription>
                Defina o nome comercial, sua categoria de atuação e crie seu endereço amigável na internet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bizName">Nome do Estabelecimento *</Label>
                <Input
                  id="bizName"
                  placeholder="Ex: Pizzaria Bella Italia"
                  value={bizName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizSlug">URL do Estabelecimento *</Label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E4E6EB] bg-gray-50 text-gray-500 text-xs sm:text-sm">
                    meuqr.com.br/
                  </span>
                  <Input
                    id="bizSlug"
                    placeholder="pizzaria-bella-italia"
                    value={bizSlug}
                    onChange={(e) => setBizSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>                    <select
                      id="category"
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E4E6EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all shadow-sm"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizPhone">Telefone Comercial</Label>
                  <Input
                    id="bizPhone"
                    placeholder="(11) 99999-8888"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bizWhatsapp">WhatsApp para Pedidos</Label>
                <Input
                  id="bizWhatsapp"
                  placeholder="(11) 99999-8888"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 py-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white py-5"
                  disabled={!bizName || !bizSlug}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1877F2]" />
                Onde você fica?
              </CardTitle>
              <CardDescription>
                Adicione seu endereço. Insira o CEP para que o endereço seja preenchido automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="bizCep">CEP *</Label>
                  <Input
                    id="bizCep"
                    placeholder="01234-567"
                    value={bizCep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="bizAddress">Endereço (Rua, Número, Bairro)</Label>
                  <Input
                    id="bizAddress"
                    placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bizCity">Cidade</Label>
                  <Input
                    id="bizCity"
                    placeholder="Ex: São Paulo"
                    value={bizCity}
                    onChange={(e) => setBizCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizState">Estado (UF)</Label>
                  <Input
                    id="bizState"
                    placeholder="Ex: SP"
                    value={bizState}
                    maxLength={2}
                    onChange={(e) => setBizState(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 py-5"
                  disabled={submitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleOnboardingComplete}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-5 shadow-lg shadow-emerald-500/10"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Concluir Setup!
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
