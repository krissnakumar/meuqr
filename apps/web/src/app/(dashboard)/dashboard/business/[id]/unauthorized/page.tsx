"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Button } from "@meuqr/ui";

export default function UnauthorizedModulePage() {
  const params = useParams();
  const businessId = params?.id as string;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <GlassCard className="border-red-100/50 shadow-red-50/50">
          <GlassCardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <GlassCardTitle className="text-xl font-bold text-[#0F172A]">
              Módulo Não Disponível
            </GlassCardTitle>
            <p className="text-sm text-[#64748B] mt-2">
              Este recurso não está ativado ou não é compatível com o tipo de negócio configurado para sua empresa.
            </p>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4 pt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-[#64748B] leading-relaxed">
              Dica: Você pode acessar as configurações da empresa ou entrar em contato com o suporte caso precise alterar a categoria principal do seu negócio.
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/dashboard/business/${businessId}`}>
                <Button className="w-full justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <LayoutDashboard className="w-4 h-4" />
                  Ir para Painel Geral
                </Button>
              </Link>
              <Link href={`/dashboard/business/${businessId}/setup`}>
                <Button variant="outline" className="w-full justify-center gap-2 border-slate-200 hover:bg-slate-50">
                  <ArrowLeft className="w-4 h-4" />
                  Configurações da Empresa
                </Button>
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
