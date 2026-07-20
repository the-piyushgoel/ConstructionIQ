import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center space-y-md p-3xl",
          className
        )}
        role="status"
        aria-busy="true"
        {...props}
      >
        <Spinner size="lg" />
        <p className="text-body-md text-text-secondary animate-pulse">{message}</p>
      </div>
    );
  }
);
LoadingState.displayName = "LoadingState";

export { LoadingState };
