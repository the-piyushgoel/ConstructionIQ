import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-sm py-xs text-caption font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-strong focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-border-default bg-surface-raised text-text-primary",
        status: "border-border-subtle bg-surface-sunken text-text-secondary",
        "risk-critical": "border-risk-critical-border bg-risk-critical-bg text-risk-critical-text",
        "risk-high": "border-risk-high-border bg-risk-high-bg text-risk-high-text",
        "risk-moderate": "border-risk-moderate-border bg-risk-moderate-bg text-risk-moderate-text",
        "risk-low": "border-risk-low-border bg-risk-low-bg text-risk-low-text",
        "risk-neutral": "border-risk-neutral-border bg-risk-neutral-bg text-risk-neutral-text",
        agent: "border-brand-500/40 bg-brand-500/10 text-brand-400",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
