import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerSim AI — Get job experience before getting a job",
  description: "CareerSim AI creates realistic work simulations that help students prove employability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=jetbrains-mono@400,500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
