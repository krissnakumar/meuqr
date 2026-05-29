"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Store,
  ArrowLeft,
  Loader2,
  Utensils,
  Building2,
  Scissors,
  Dog,
  Hotel,
  Home,
  Calendar,
  Stethoscope,
  Dumbbell,
  Wrench,
  Briefcase,
  Church,
  Package,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "restaurant", label: "Restaurante", icon: Utensils },
  { value: "construction_materials", label: "Material de Construção", icon: Building2 },
  { value: "salon", label: "Salão / Barbearia", icon: Scissors },
  { value: "pet_shop", label: "Pet Shop", icon: Dog },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "real_estate", label: "Imobiliária", icon: Home },
  { value: "event", label: "Evento", icon: Calendar },
  { value: "clinic", label: "Clínica", icon: Stethoscope },
  { value: "gym", label: "Academia", icon: Dumbbell },
  { value: "mechanic", label: "Mecânico", icon: Wrench },
  { value: "freelancer", label: "Freelancer", icon: Briefcase },
  { value: "church", label: "Igreja", icon: Church },
  { value: "product_shelf", label: "Prateleira de Produto", icon: Package },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

export default function NewBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState<"category" | "form">("category");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          name,
          slug,
          category,
          description: description || null,
          whatsapp: whatsapp || null,
        })
        .select()
        .single();

      if (bizError) throw bizError;

      router.push(`/dashboard/business/${business.id}/setup`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar negócio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
        Criar Negócio
      </h1>
      <p className="text-gray-500 mb-8">
        Escolha a categoria e configure seu negócio.
      </p>

      {step === "category" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setStep("form");
                }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? "border-[#00C853] bg-[#00C853]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-[#111827]" />
                <span className="text-sm font-medium text-[#111827]">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome do negócio *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Restaurante do João"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Link personalizado</Label>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-400">meuqr.com.br/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
                  placeholder="Fale sobre seu negócio..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 5511999998888"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("category")}
                >
                  Voltar
                </Button>
                <Button type="submit" variant="accent" disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Negócio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
