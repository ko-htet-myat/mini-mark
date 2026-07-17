import { AppSidebar } from "@/components/layout/side-bar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/layout/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LanguageSwitcher from "../language-switcher";
import { ModeToggle } from "../theme-switcher";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex px-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DynamicBreadcrumb />
          </div>
          <div className=" flex align-items-center gap-3">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </header>
        <section className=" p-6">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
