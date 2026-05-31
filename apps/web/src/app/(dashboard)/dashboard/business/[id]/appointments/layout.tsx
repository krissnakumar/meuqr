"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Stethoscope, Clock, Users } from "lucide-react";

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const businessId = params.id as string;

  const tabs = [
    { name: "Agendamentos", href: `/dashboard/business/${businessId}/appointments`, icon: Calendar },
    { name: "Serviços", href: `/dashboard/business/${businessId}/appointments/services`, icon: Stethoscope },
    { name: "Profissionais", href: `/dashboard/business/${businessId}/appointments/staff`, icon: Users },
    { name: "Disponibilidade", href: `/dashboard/business/${businessId}/appointments/availability`, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              {tab.name}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
