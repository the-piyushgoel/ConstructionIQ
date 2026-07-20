"use client";

import * as React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar } from "@/components/primitives/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitives/Dropdown";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/primitives/Drawer";


export function TopBar() {
  const { toggleMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border-default bg-surface-base px-4 shadow-elevation-1">
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger */}
        <Drawer>
          <DrawerTrigger asChild>
            <button
              onClick={toggleMobile}
              className="md:hidden rounded-sm p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong"
            >
              <Menu className="h-5 w-5" />
            </button>
          </DrawerTrigger>
          <DrawerContent side="left" className="w-[240px] p-0 border-r-0">
            {/* NavRail is naturally styled for desktop, but we could wrap it or use a separate component. For simplicity, we can render the NavItems here or just reuse NavRail with overrides. Since NavRail is hidden on mobile, we can provide a specific mobile nav list here. */}
            <div className="flex h-14 items-center justify-start border-b border-border-default px-4">
              <span className="text-body-md font-semibold text-text-primary">
                Construction IQ
              </span>
            </div>
            <div className="p-2 flex flex-col space-y-1">
              {/* Note: Mobile nav links should close the drawer on click */}
              <a href="/dashboard" className="text-body-md font-medium text-text-secondary px-2 py-2">Dashboard</a>
              <a href="/projects" className="text-body-md font-medium text-text-secondary px-2 py-2">Projects</a>
              <a href="/risk" className="text-body-md font-medium text-text-secondary px-2 py-2">Risk Intelligence</a>
              <a href="/plans" className="text-body-md font-medium text-text-secondary px-2 py-2">Recovery Plans</a>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Global Search Placeholder */}
        <div className="hidden lg:flex relative items-center max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search risk IDs, vendors..."
            className="flex h-9 w-64 rounded-md border border-border-default bg-surface-canvas pl-9 pr-3 text-body-sm ring-offset-surface-canvas placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Alerts Bell */}
        <button className="relative rounded-sm p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong">
          <Bell className="h-5 w-5" />
          {/* Example notification badge */}
          <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full bg-risk-critical" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none rounded-full ring-offset-surface-canvas focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2">
              <Avatar fallback={user?.name?.charAt(0) || "U"} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Theme Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-risk-critical-text focus:text-risk-critical-text"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
