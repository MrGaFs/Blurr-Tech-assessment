import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header - hidden on large screens */}
      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:hidden">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <span className="font-semibold">Blurr.so HR Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
          </div>
        </div>
      </header>
      
      {/* Desktop header - visible only on large screens */}
      <header className="fixed top-0 right-0 z-40 hidden lg:flex h-16 items-center border-b bg-background px-4 left-64 w-[calc(100%-16rem)]">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Left empty for page title if needed */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto pl-0 lg:pl-64 lg:pt-16">
          {children}
        </main>
      </div>
    </div>
  );
} 