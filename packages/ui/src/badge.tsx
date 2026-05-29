import React from "react";
import { cn } from "./utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#1877F2] text-white",
        accent: "bg-[#31A24C] text-white",
        secondary: "bg-[#E4E6EB] text-[#050505]",
        outline: "border border-[#E4E6EB] text-[#050505]",
        muted: "bg-[#F0F2F5] text-[#65676B]",
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
