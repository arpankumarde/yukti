import { RecruiterSidebar } from "@/components/layout/ApplicantSidebar";
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
        <div className="p-0 md:p-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
