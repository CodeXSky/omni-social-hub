"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PenTool, 
  CalendarDays, 
  BarChart3, 
  Radio, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  ChevronDown,
  Layers,
  Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Omni-Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Composer Studio", href: "/composer", icon: PenTool, badge: "AI Core" },
  { name: "Content Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Analytics Central", href: "/analytics", icon: BarChart3 },
  { name: "Accounts & API Hub", href: "/accounts", icon: Radio },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl flex flex-col justify-between h-screen fixed left-0 top-0 z-40">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/60 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              OmniSocial Hub
            </span>
            <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold">
              Enterprise v2.0
            </div>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3">
          <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all group">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                A
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 truncate">Acme Media & Co</div>
                <div className="text-[10px] text-zinc-500">6 connected accounts</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Health / API Quota Status */}
      <div className="p-4 border-t border-zinc-800/80">
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Dispatchers
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% HEALTH</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-[94%]" />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>BullMQ Engine</span>
            <span>0 ms latency</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
