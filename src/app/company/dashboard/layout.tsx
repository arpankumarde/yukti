import { CompanySidebar } from "@/components/layout/CompanySidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <CompanySidebar collapsible="icon" />
      <SidebarInset>
        <div className="border-b p-4">
          <SidebarTrigger />
        </div>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
