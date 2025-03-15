import { RecruiterSidebar } from "@/components/layout/RecruiterSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <RecruiterSidebar collapsible="icon" />
      <SidebarInset>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
