import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-[36px] w-full items-center justify-between rounded-md border border-border-default bg-surface-canvas px-md py-sm text-body-md ring-offset-surface-canvas placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-strong focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error && "border-risk-critical focus:ring-risk-critical",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : "false"}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
