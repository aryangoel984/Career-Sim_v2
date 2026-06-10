import { AppNav } from "@/components/ui/components";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AppNav />
      {children}
    </div>
  );
}
