import React from "react";
import { cn } from "./utils";

export interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  time?: string;
  location?: string;
  dotColor?: string;
  className?: string;
}

export function ActivityItem({ icon, title, description, time, location, dotColor = "bg-indigo-500", className }: ActivityItemProps) {
  return (
    <div className={cn("flex items-start gap-3.5 group", className)}>
      <div className="relative flex flex-col items-center">
        <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-white", dotColor)} />
        <div className="w-px flex-1 bg-[#E2E8F0] mt-2 group-last:hidden" />
      </div>
      <div className="flex-1 min-w-0 pb-5 group-last:pb-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A]">{title}</p>
            {description && (
              <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{description}</p>
            )}
            {(time || location) && (
              <div className="flex items-center gap-2 mt-1.5">
                {time && <span className="text-[10px] text-[#94A3B8]">{time}</span>}
                {time && location && <span className="text-[#CBD5E1]">•</span>}
                {location && <span className="text-[10px] text-[#94A3B8]">{location}</span>}
              </div>
            )}
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0 group-hover:bg-[#F1F5F9] transition-colors">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
