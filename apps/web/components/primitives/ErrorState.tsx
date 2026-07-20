import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  action?: React.ReactNode;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = "An error occurred", message, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center space-y-lg text-center p-3xl",
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-risk-critical-bg">
          <AlertCircle className="h-[24px] w-[24px] text-risk-critical-text" />
        </div>
        <div className="space-y-sm max-w-md">
          <h3 className="text-heading-md text-text-primary">{title}</h3>
          <p className="text-body-md text-risk-critical-text">{message}</p>
        </div>
        {action && <div className="pt-sm">{action}</div>}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";

export { ErrorState };
