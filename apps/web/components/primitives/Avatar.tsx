import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-6 w-6 text-caption",
      md: "h-8 w-8 text-body-sm",
      lg: "h-12 w-12 text-body-md",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-surface-raised items-center justify-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="aspect-square h-full w-full object-cover"
          />
        ) : fallback ? (
          <span className="font-medium text-text-primary uppercase">
            {fallback}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-text-muted" />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
