import { ApplicantSidebar } from "@/components/layout/ApplicantSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ApplicantSidebar collapsible="icon" />
      <SidebarInset>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
