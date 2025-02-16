export default function LoginLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div className="min-h-svh bg-muted p-6 md:p-10">{children}</div>;
  }