import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Database, Activity, Settings, Ghost, Map as MapIcon } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GHOST PROJECT | Watchdog Platform and Infrastructure Prediction",
  description: "Tracking DPWH Infrastructure Anomalies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full flex bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        {/* Sidebar */}
        <aside className="w-64 bg-[#111827] text-[var(--sidebar-fg)] flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Ghost className="w-6 h-6" />
              <h1 className="text-xl font-black tracking-widest uppercase text-white">Ghost Project</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Public Infra Watchdog</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors pressable">
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            <Link href="/map" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors pressable">
              <MapIcon className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-sm">Nationwide Map</span>
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors pressable">
              <Database className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-sm">Projects Database</span>
            </Link>
            <Link href="/predict" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors pressable">
              <Activity className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-sm">Predictions</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
