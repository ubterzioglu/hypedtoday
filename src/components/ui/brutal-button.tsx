import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brutalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-3 border-foreground",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-coral hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(16_100%_66%)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        tertiary:
          "bg-tertiary text-tertiary-foreground shadow-cyan hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(180_100%_50%)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-[4px_4px_0px_hsl(45_100%_51%)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(45_100%_51%)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        highlight:
          "bg-highlight text-highlight-foreground shadow-[4px_4px_0px_hsl(330_100%_64%)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(330_100%_64%)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        outline:
          "bg-transparent text-foreground border-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-brutal",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalButtonVariants> {}

const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(brutalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BrutalButton.displayName = "BrutalButton";

export { BrutalButton, brutalButtonVariants };
