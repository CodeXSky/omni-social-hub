"use client";

import React, { useEffect, useState } from "react";
import { 
  Radio, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Plus,
  Trash2,
  SlidersHorizontal
} from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

export function AccountsManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data.accounts || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRefreshToken = (id: string) => {
    setRefreshingId(id);
    setTimeout(() => {
      setRefreshingId(null);
    }, 1200);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              OAuth & Token Lifecycle
            </span>
            <span className="text-zinc-500 text-xs">• AES-256-GCM Encrypted</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Accounts & Official API Hub</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage authenticated developer credentials, OAuth permissions, and rate-limit quotas.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]">
          <Plus className="w-4 h-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Hardware & Token Encryption Active</h3>
            <p className="text-[11px] text-zinc-400">
              All bearer access tokens, client secrets, and refresh credentials are encrypted at rest with AES-256-GCM.
            </p>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">STANDARDS: SOC2 / GDPR READY</div>
      </div>

      {/* Connected Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const cfg = PLATFORM_CONFIGS[acc.platform as Platform] || PLATFORM_CONFIGS.TWITTER;
          const Icon = cfg.icon;
          const isRefreshing = refreshingId === acc.id;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all backdrop-blur-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Account Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${cfg.badgeBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">{acc.accountName}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">@{acc.username}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </span>
                </div>

                {/* Token Specs */}
                <div className="mt-4 space-y-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">API Endpoint</span>
                    <span className="text-zinc-300 font-mono">{cfg.name} Official API</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Rate Limit Quota</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {acc.rateLimitRemaining || 95} requests left
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Token Status</span>
                    <span className="text-zinc-400 font-mono text-[10px]">60d Rolling Refresh</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <button
                  onClick={() => handleRefreshToken(acc.id)}
                  disabled={isRefreshing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
                  <span>{isRefreshing ? "Refreshing..." : "Refresh Token"}</span>
                </button>
                <button className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
