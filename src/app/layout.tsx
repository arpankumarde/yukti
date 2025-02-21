import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils"; // Add this import

export const metadata: Metadata = {
  title: "Yukti AI",
  icons: "/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased")}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
