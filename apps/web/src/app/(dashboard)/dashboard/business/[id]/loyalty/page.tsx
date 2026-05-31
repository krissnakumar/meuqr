"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Gift,
  Search,
  PlusCircle,
  Trophy,
  History,
  Phone,
  User,
  Users,
  Settings,
  Star
} from "lucide-react";

export default function LoyaltyPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);

  // Action States
  const [phoneSearch, setPhoneSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      
      setBusiness(biz);

      // Fetch active program
      const { data: prog } = await supabase
        .from("loyalty_programs")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .single();

      if (prog) {
        setProgram(prog);
        // Fetch top cards
        const { data: cardsData } = await supabase
          .from("loyalty_cards")
          .select("*")
          .eq("program_id", prog.id)
          .order("current_points", { ascending: false })
          .limit(50);
        
        setCards(cardsData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !phoneSearch) return;

    setActionLoading(true);
    const cleanPhone = phoneSearch.replace(/\D/g, "");

    try {
      // 1. Find or create card
      let { data: card } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("program_id", program.id)
        .eq("customer_phone", cleanPhone)
        .single();

      if (!card) {
        const { data: newCard, error: createError } = await supabase
          .from("loyalty_cards")
          .insert({
            program_id: program.id,
            customer_phone: cleanPhone,
            current_points: 0,
            total_points_earned: 0
          })
          .select()
          .single();
          
        if (createError) throw createError;
        card = newCard;
      }

      // 2. Add point logic
      let newPoints = card.current_points + 1;
      let newTotal = card.total_points_earned + 1;
      let newRedeemed = card.rewards_redeemed;
      
      let message = "Ponto adicionado com sucesso!";
      
      if (newPoints >= program.points_required) {
        // Trigger reward
        message = "🎉 RECOMPENSA ALCANÇADA! O cliente ganhou: " + program.reward_description;
        newPoints = 0; // Reset points after reward
        newRedeemed += 1;
      }

      // 3. Update card
      const { error: updateError } = await supabase
        .from("loyalty_cards")
        .update({
          current_points: newPoints,
          total_points_earned: newTotal,
          rewards_redeemed: newRedeemed,
          last_activity_at: new Date().toISOString()
        })
        .eq("id", card.id);

      if (updateError) throw updateError;

      // 4. Log transaction
      await supabase.from("loyalty_transactions").insert({
        card_id: card.id,
        points_change: 1,
        transaction_type: "earn"
      });

      toast.success(message, { duration: 5000 });
      setPhoneSearch("");
      loadData(); // Refresh list

    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar ponto.");
    } finally {
      setActionLoading(false);
    }
  }

  async function createInitialProgram() {
    try {
      setActionLoading(true);
      const { error } = await supabase.from("loyalty_programs").insert({
        business_id: businessId,
        name: "Cartão Fidelidade",
        points_required: 10,
        reward_description: "1 Produto Grátis",
        is_active: true
      });
      if (error) throw error;
      toast.success("Programa de fidelidade ativado!");
      loadData();
    } catch (err) {
      toast.error("Erro ao ativar programa.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando fidelidade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Fidelidade</h1>
            <p className="text-sm text-gray-400">Gerencie cartões fidelidade digitais de seus clientes</p>
          </div>
        </div>
      </div>

      {!program ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Star className="w-10 h-10 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Ativar Programa de Fidelidade</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Fidelize seus clientes oferecendo recompensas. A cada compra, você adiciona um ponto digital através do número do WhatsApp do cliente.
            </p>
            <Button 
              onClick={createInitialProgram} 
              disabled={actionLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 rounded-xl text-lg shadow-xl shadow-pink-200/50"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Gift className="w-5 h-5 mr-2" />}
              Ativar Fidelidade
            </Button>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Add Point & Program Info */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* ADD POINT WIDGET */}
            <GlassCard className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2 text-pink-700">
                  <PlusCircle className="w-5 h-5" />
                  Marcar Ponto
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <form onSubmit={handleAddPoint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp do Cliente</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel"
                        required
                        value={phoneSearch}
                        onChange={e => setPhoneSearch(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all font-medium text-slate-700"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={actionLoading || !phoneSearch}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 rounded-xl shadow-md"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Star className="w-5 h-5 mr-2" />}
                    Adicionar 1 Ponto
                  </Button>
                </form>
              </GlassCardContent>
            </GlassCard>

            {/* PROGRAM CONFIG */}
            <GlassCard>
              <GlassCardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <GlassCardTitle className="text-sm text-slate-500">Regras do Programa</GlassCardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {program.points_required}
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      Pontos para completar a cartela
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-0.5">Recompensa:</div>
                      <div className="text-sm font-bold text-slate-800">{program.reward_description}</div>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* RIGHT COLUMN: Customer Cards */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full">
              <GlassCardHeader className="border-b border-slate-50 pb-4">
                <div className="flex items-center justify-between">
                  <GlassCardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Cartões Ativos
                  </GlassCardTitle>
                  <Badge variant="indigo" className="px-2 py-0.5">{cards.length} clientes</Badge>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                {cards.length === 0 ? (
                  <div className="py-20 text-center">
                    <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <h3 className="text-slate-600 font-medium mb-1">Nenhum cliente fidelizado ainda</h3>
                    <p className="text-sm text-slate-400">Use o painel ao lado para registrar o primeiro ponto!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {cards.map(card => {
                      const percentage = Math.min(100, Math.round((card.current_points / program.points_required) * 100));
                      
                      return (
                        <div key={card.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                {card.customer_name || card.customer_phone}
                                {card.rewards_redeemed > 0 && (
                                  <Badge variant="emerald" className="text-[10px] py-0.5 px-1.5 flex items-center gap-1">
                                    <Trophy className="w-3 h-3" /> {card.rewards_redeemed}
                                  </Badge>
                                )}
                              </div>
                              {card.customer_name && (
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {card.customer_phone}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                <History className="w-3 h-3" /> Último ponto: {new Date(card.last_activity_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full sm:w-48">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                              <span className="text-pink-600">{card.current_points} pontos</span>
                              <span className="text-slate-400">{program.points_required} meta</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
