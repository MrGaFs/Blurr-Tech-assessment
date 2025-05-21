"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, Users, Settings, LogOut, Folders, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

// Mobile-specific sidebar nav item
function MobileSidebarNavItem({ 
  href, 
  icon, 
  title, 
  onNavigate 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent cursor-pointer",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{title}</span>
    </a>
  );
}

// Mobile optimized sidebar
function MobileSidebarContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="w-full bg-background">
      <div className="flex h-full max-h-screen flex-col pt-12"> {/* pt-12 to make room for the close button */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            <MobileSidebarNavItem
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              title="Overview"
              onNavigate={onNavigate}
            />

            <MobileSidebarNavItem
              href="/dashboard/employees"
              icon={<Users className="h-4 w-4" />}
              title="Employees"
              onNavigate={onNavigate}
            />

            <MobileSidebarNavItem
              href="/dashboard/projects"
              icon={<Folders className="h-4 w-4" />}
              title="Projects"
              onNavigate={onNavigate}
            />

            <MobileSidebarNavItem
              href="/dashboard/salary"
              icon={<DollarSign className="h-4 w-4" />}
              title="Salary"
              onNavigate={onNavigate}
            />

            <div className="mt-4 text-xs font-medium uppercase text-muted-foreground">Settings</div>
            <MobileSidebarNavItem
              href="/dashboard/settings"
              icon={<Settings className="h-4 w-4" />}
              title="Settings"
              onNavigate={onNavigate}
            />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onNavigate();
              signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  
  // Close the sidebar when pressing escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-background transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <MobileSidebarContent onNavigate={handleNavigate} />
      </div>
    </>
  );
} 