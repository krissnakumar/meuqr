import React from "react";
import { cn } from "./utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white",
        accent: "bg-emerald-500 text-white",
        secondary: "bg-slate-100 text-slate-700",
        outline: "border border-slate-200 text-slate-600",
        muted: "bg-slate-50 text-slate-500",
        indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        amber: "bg-amber-50 text-amber-700 border border-amber-200",
        rose: "bg-rose-50 text-rose-700 border border-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export { Badge, badgeVariants };
