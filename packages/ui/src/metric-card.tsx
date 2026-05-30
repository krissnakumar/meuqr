import React from "react";
import { cn } from "./utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: "indigo" | "emerald" | "blue" | "violet" | "amber" | "rose";
  className?: string;
}

const colorStyles = {
  indigo: {
    bg: "bg-indigo-50/80",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    accent: "text-indigo-600",
    trendBg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  emerald: {
    bg: "bg-emerald-50/80",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "text-emerald-600",
    trendBg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  blue: {
    bg: "bg-blue-50/80",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "text-blue-600",
    trendBg: "bg-blue-50",
    border: "border-blue-100",
  },
  violet: {
    bg: "bg-violet-50/80",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    accent: "text-violet-600",
    trendBg: "bg-violet-50",
    border: "border-violet-100",
  },
  amber: {
    bg: "bg-amber-50/80",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accent: "text-amber-600",
    trendBg: "bg-amber-50",
    border: "border-amber-100",
  },
  rose: {
    bg: "bg-rose-50/80",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accent: "text-rose-600",
    trendBg: "bg-rose-50",
    border: "border-rose-100",
  },
};

export function MetricCard({ label, value, icon, trend, color = "indigo", className }: MetricCardProps) {
  const colors = colorStyles[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 group",
        className
      )}
    >
      {/* Top color accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 opacity-80", colors.bg)} />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight">
            {value}
          </p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", colors.trendBg, colors.accent)}>
              <span className={trend.positive ? "rotate-0" : "rotate-180"}>
                ▲
              </span>
              <span>{trend.value}%</span>
              <span className="text-[#64748B] font-normal">vs ontem</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm", colors.iconBg, colors.iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
