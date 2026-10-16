"use client";

import React from "react";
import Link from "next/link";
import { Bell, Search, Plus, Radio, Zap, ShieldCheck } from "lucide-react";

export function Header() {
  React.useEffect(() => {
    // Automatic Background Cron: checks every 30s for scheduled posts due to publish
    fetch("/api/cron/publisher").catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/cron/publisher").catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, master posts, or tags... (⌘K)"
            className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
          />
        </div>
      </div>

      {/* Action buttons & User profile */}
      <div className="flex items-center gap-4">
        {/* Quick Create Post button */}
        <Link
          href="/composer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Master Post</span>
        </Link>

        {/* Status notification */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Meta • TikTok • X API v2 Active</span>
        </div>

        <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 ring-2 ring-zinc-950" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-zinc-800">
            WS
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-medium text-zinc-200 leading-tight">Workspace Admin</div>
            <div className="text-[10px] text-zinc-500">Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
