"use client";

import * as React from "react";
import { NavRail } from "./NavRail";
import { TopBar } from "./TopBar";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-canvas text-text-primary">
      <NavRail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1440px] px-4 py-xl md:px-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
