"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  ClipboardList,
  Cpu,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Risk Intelligence", href: "/risk", icon: ShieldAlert },
  { label: "Recovery Plans", href: "/plans", icon: ClipboardList },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function NavRail() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden flex-col border-r border-border-default bg-surface-base transition-all duration-base md:flex",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border-default px-4">
        {!isCollapsed && (
          <span className="text-body-md font-semibold text-text-primary">
            Construction IQ
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="rounded-sm p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 mx-auto" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-body-md font-medium transition-colors hover:bg-surface-raised hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong",
                isActive
                  ? "bg-brand-500/10 text-brand-500 relative"
                  : "text-text-secondary",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-[2px] rounded-r-md bg-brand-500" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  !isCollapsed && "mr-3",
                  isActive ? "text-brand-500" : "text-text-muted group-hover:text-text-primary"
                )}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
