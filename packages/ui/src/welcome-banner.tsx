import React from "react";
import { cn } from "./utils";

export interface WelcomeBannerProps {
  greeting: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function WelcomeBanner({ greeting, title, subtitle, badge, badgeIcon, actions, className }: WelcomeBannerProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 border border-indigo-400/20",
      className
    )}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] bg-purple-300/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[150px] h-[150px] bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
              {badgeIcon}
              {badge}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-50 to-purple-100 capitalize">{title}</span>! 👋
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
