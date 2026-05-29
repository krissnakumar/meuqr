"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { BUSINESS_CATEGORIES } from "@meuqr/shared";
import {
  ArrowLeft,
  Loader2,
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
  Store,
  Package,
  MoreHorizontal,
  AlertCircle,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { useSubscriptionLimits, checkActionLimit } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";

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

  // Subscription limits check
  const { tier, canCreateBusiness, usage, limits, isLoading: limitsLoading } = useSubscriptionLimits();

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

    // If limits are still loading, wait
    if (limitsLoading) {
      setError("Verificando limites do seu plano...");
      return;
    }

    // Check plan limit before creating
    const limitCheck = checkActionLimit(
      tier,
      "businesses",
      usage.businesses
    );
    if (!limitCheck.allowed) {
      setError(limitCheck.message || "Limite de negócios atingido");
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
          name,
          slug,
          category,
          description: description || null,
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

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Plan limit banner */}
      {!limitsLoading && !canCreateBusiness && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 text-sm">Limite do plano atingido</p>
              <p className="text-amber-600 text-xs mt-1">
                Você já possui {usage.businesses} negócio(s). Faça upgrade para o plano Profissional ou Empresarial para cadastrar mais.
              </p>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <Crown className="w-3.5 h-3.5 mr-1" />
                Fazer Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
        Criar Negócio
      </h1>
      <p className="text-gray-500 mb-8">
        Escolha a categoria e configure seu negócio.
      </p>

      {step === "category" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUSINESS_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] || Store;
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
