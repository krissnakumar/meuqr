export const dynamic = "force-dynamic";

import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@meuqr/ui";
import { Users, FileText, Settings, ShieldAlert, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
export default function AdminDashboardPage() {

  const adminLinks = [
    {
      title: "Modelos de Negócio",
      description: "Gerencie, audite e ative os templates do sistema.",
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      href: "/dashboard/admin/templates",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Usuários",
      description: "Gerenciamento de contas, acessos e permissões.",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      href: "/dashboard/admin/users",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Configurações do Sistema",
      description: "Parâmetros globais, limites e integrações.",
      icon: <Settings className="w-6 h-6 text-amber-500" />,
      href: "/dashboard/admin/settings",
      bgColor: "bg-amber-50",
    },
    {
      title: "Auditoria e Logs",
      description: "Monitoramento de segurança e ações do sistema.",
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      href: "/dashboard/admin/logs",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Administração</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Área restrita para gerenciamento global da plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="animate-fade-in-up">
          <GlassCardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">1,248</p>
            </div>
          </GlassCardContent>
        </GlassCard>
        <GlassCard className="animate-fade-in-up delay-1">
          <GlassCardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Negócios Ativos</p>
              <p className="text-2xl font-bold text-gray-900">856</p>
            </div>
          </GlassCardContent>
        </GlassCard>
        <GlassCard className="animate-fade-in-up delay-2">
          <GlassCardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Modelos de Negócio</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in-up delay-3">
        {adminLinks.map((link) => (
          <Link href={link.href} key={link.href} className="block group">
            <GlassCard className="h-full transition-all duration-200 hover:border-indigo-200 hover:shadow-md cursor-pointer">
              <GlassCardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${link.bgColor}`}>
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCardContent>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
