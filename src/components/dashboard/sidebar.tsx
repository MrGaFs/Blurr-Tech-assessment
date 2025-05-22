"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, Folders, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
}

function SidebarNavItem({ href, icon, title }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  return (
    <div className="hidden fixed top-0 left-0 h-screen w-64 border-r bg-background lg:block z-30">
      <div className="flex h-full max-h-screen flex-col">
        {/* Sidebar Header - aligns with the desktop header */}
        <div className="h-16 border-b flex items-center px-4 font-semibold">
          Blurr.so | HR Portal
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            <SidebarNavItem
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              title="Overview"
            />

            <SidebarNavItem
              href="/dashboard/employees"
              icon={<Users className="h-4 w-4" />}
              title="Employees"
            />

            <SidebarNavItem
              href="/dashboard/projects"
              icon={<Folders className="h-4 w-4" />}
              title="Projects"
            />

            <SidebarNavItem
              href="/dashboard/salary"
              icon={<DollarSign className="h-4 w-4" />}
              title="Salary"
            />

            <div className="mt-4 text-xs font-medium uppercase text-muted-foreground">Settings</div>
            <SidebarNavItem
              href="/dashboard/settings"
              icon={<Settings className="h-4 w-4" />}
              title="Settings"
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
