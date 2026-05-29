import React from "react";
import { cn } from "./utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#1877F2] text-white hover:bg-[#166FE5] shadow-sm",
        accent: "bg-[#31A24C] text-white hover:bg-[#2B8F42] shadow-sm",
        secondary: "bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF] shadow-sm",
        outline: "border border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10",
        ghost: "text-[#050505] hover:bg-[#F2F3F5]",
        destructive: "bg-[#FA3E3E] text-white hover:bg-[#E13737]",
        link: "text-[#1877F2] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
