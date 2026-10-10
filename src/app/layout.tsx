import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "OmniSocial Hub | Omni-Channel Social Media Management & Adaptive Auto-Posting",
  description: "Enterprise Omni-Channel Social Media Hub with AI Adaptive Content Generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        <Sidebar />
        <Header />
        <main className="ml-64 flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
