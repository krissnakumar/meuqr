import React from "react";
import { cn } from "./utils";

export interface QuickActionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  color?: "indigo" | "emerald" | "amber" | "violet" | "blue" | "rose";
}

const colorStyles = {
  indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700",
  violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100 group-hover:text-violet-700",
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700",
  rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:text-rose-700",
};

const borderStyles = {
  indigo: "hover:border-indigo-200 hover:bg-indigo-50/30",
  emerald: "hover:border-emerald-200 hover:bg-emerald-50/30",
  amber: "hover:border-amber-200 hover:bg-amber-50/30",
  violet: "hover:border-violet-200 hover:bg-violet-50/30",
  blue: "hover:border-blue-200 hover:bg-blue-50/30",
  rose: "hover:border-rose-200 hover:bg-rose-50/30",
};

export function QuickActionItem({ icon, title, description, onClick, href, color = "indigo" }: QuickActionItemProps) {
  const Component = href ? "a" : "button";
  const props = href ? { href } : { onClick };

  return (
    <Component
      {...props}
      className={cn(
        "group flex items-center gap-3.5 p-3.5 rounded-xl border border-[#E2E8F0] bg-white transition-all duration-200 cursor-pointer",
        borderStyles[color]
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
        colorStyles[color]
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-[#0F172A] group-hover:text-inherit transition-colors">
          {title}
        </p>
        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>
      <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-inherit group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Component>
  );
}
