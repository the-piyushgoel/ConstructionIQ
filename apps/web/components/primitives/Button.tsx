import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-body-md font-medium ring-offset-surface-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-surface-sunken disabled:text-text-disabled w-full sm:w-auto",
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-white hover:shadow-elevation-2 active:bg-brand-600",
        secondary: "border border-border-default bg-transparent text-text-primary hover:shadow-elevation-2 active:bg-surface-sunken",
        ghost: "bg-transparent text-text-primary hover:bg-surface-overlay active:bg-surface-sunken",
        danger: "bg-risk-critical text-risk-critical-text hover:shadow-elevation-2 active:brightness-90",
      },
      size: {
        comfortable: "h-[36px] px-lg",
        compact: "h-[32px] px-md",
        iconComfortable: "h-[36px] w-[36px]",
        iconCompact: "h-[32px] w-[32px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "comfortable",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="mr-sm h-[20px] w-[20px] animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
