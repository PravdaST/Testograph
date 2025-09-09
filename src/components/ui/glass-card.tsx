import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-lg shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-gradient-card backdrop-blur-md shadow-glass",
        elevated: "bg-gradient-card backdrop-blur-lg shadow-card shadow-glow transition-all duration-500",
        interactive: "bg-gradient-card backdrop-blur-md shadow-glass hover:shadow-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface GlassCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, className }))}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };