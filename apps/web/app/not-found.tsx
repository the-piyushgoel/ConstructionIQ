import * as React from "react";
import { EmptyState } from "@/components/primitives/EmptyState";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/primitives/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas text-text-primary">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Button asChild variant="primary">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
