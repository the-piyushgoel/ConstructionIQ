import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center space-y-lg text-center p-3xl",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
            <Icon className="h-[24px] w-[24px] text-text-secondary" />
          </div>
        )}
        <div className="space-y-sm max-w-md">
          <h3 className="text-heading-md text-text-primary">{title}</h3>
          <p className="text-body-md text-text-secondary">{description}</p>
        </div>
        {action && <div className="pt-sm">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
