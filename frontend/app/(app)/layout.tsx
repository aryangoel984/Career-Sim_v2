import { AppNav, DemoBanner } from "@/components/ui/components";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <DemoBanner />
      <AppNav />
      {children}
    </div>
  );
}
