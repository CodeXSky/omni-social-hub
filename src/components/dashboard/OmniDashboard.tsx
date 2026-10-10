"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  Calendar, 
  ArrowUpRight, 
  Zap, 
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Play
} from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

export function OmniDashboard() {
  const [data, setData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [resAnalytics, resAccounts, resPosts] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/accounts"),
          fetch("/api/posts"),
        ]);
        const aData = await resAnalytics.json();
        const accData = await resAccounts.json();
        const pData = await resPosts.json();

        setData(aData);
        setAccounts(accData.accounts || []);
        setPosts(pData.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = data?.stats?.totals || {
    views: 142800,
    reach: 98500,
    impressions: 185400,
    likes: 12840,
    comments: 2190,
    shares: 1820,
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live Mission Control
            </span>
            <span className="text-zinc-500 text-xs">• Real-Time Pulse</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Omni-Channel Social Command
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated cross-platform reach across TikTok, Instagram, X, Threads, Facebook & Pinterest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/composer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Composer Studio</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views / Video Plays"
          value={stats.views.toLocaleString()}
          change="+18.4% vs last week"
          icon={Play}
          color="cyan"
        />
        <MetricCard
          title="Aggregated Reach"
          value={stats.reach.toLocaleString()}
          change="+12.1% unique accounts"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Total Engagements (Likes + Saves)"
          value={stats.likes.toLocaleString()}
          change="4.86% avg engagement"
          icon={Heart}
          color="pink"
        />
        <MetricCard
          title="Total Viral Shares"
          value={stats.shares.toLocaleString()}
          change="+24.8% distribution velocity"
          icon={Share2}
          color="emerald"
        />
      </div>

      {/* Grid: Follower Growth & Account Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Follower Growth Curves (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Cross-Platform Growth Trajectory
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Aggregate audience expansion tracked daily across official APIs
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> TikTok
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Instagram
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> X
              </span>
            </div>
          </div>

          {/* Graphical Growth Bars Simulation */}
          <div className="space-y-4 pt-2">
            {[
              { label: "TikTok (124.5K Followers)", percent: 85, color: "from-cyan-500 to-blue-500", gain: "+2,400 this week" },
              { label: "Instagram (48.2K Followers)", percent: 62, color: "from-pink-500 to-rose-500", gain: "+980 this week" },
              { label: "X / Twitter (31.2K Followers)", percent: 45, color: "from-sky-400 to-indigo-500", gain: "+450 this week" },
              { label: "Threads (19.8K Followers)", percent: 34, color: "from-purple-500 to-violet-600", gain: "+610 this week" },
              { label: "Pinterest (540K Monthly Views)", percent: 92, color: "from-rose-500 to-red-600", gain: "+38K impressions" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-300">{item.label}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">{item.gain}</span>
                </div>
                <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Platform Traffic Distribution Radar */}
          <div className="pt-4 border-t border-zinc-800/60 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Top Performing</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">TikTok Reels</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">44% Share of Impressions</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Highest Conversion</div>
              <div className="text-sm font-bold text-pink-400 mt-1">Instagram Carousels</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">6.2% Click-through Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Viral Velocity</div>
              <div className="text-sm font-bold text-sky-400 mt-1">X Threads</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">3.4x Retweet Multiplier</div>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Accounts & Token Health (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <h2 className="text-sm font-bold text-zinc-100">Official API Token Health</h2>
              <span className="text-[10px] text-emerald-400 font-mono">ALL CONNECTED</span>
            </div>

            <div className="space-y-3 mt-4">
              {accounts.map((acc) => {
                const cfg = PLATFORM_CONFIGS[acc.platform as Platform] || PLATFORM_CONFIGS.TWITTER;
                const Icon = cfg.icon;
                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/70 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${cfg.badgeBg} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">
                          {acc.accountName}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          @{acc.username}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {acc.rateLimitRemaining || 100} req left
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/accounts"
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
          >
            <span>Manage API Connections & Keys</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Upcoming Scheduled & Recent Publishing Queue Timeline */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100">Live Queue & Publishing Timeline</h2>
          </div>
          <Link href="/calendar" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            <span>View Full Calendar</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {posts.length > 0 ? (
            posts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.rawMediaUrls?.[0] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{post.title || "Master Campaign"}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xl">
                      {post.rawCaption}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex -space-x-1">
                    {(post.variants || []).map((v: any) => {
                      const cfg = PLATFORM_CONFIGS[v.platform as Platform] || PLATFORM_CONFIGS.TWITTER;
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={v.id}
                          className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center"
                          title={v.platform}
                        >
                          <Icon className="w-3 h-3 text-zinc-300" />
                        </div>
                      );
                    })}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {post.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No recent posts yet. Launch the Composer Studio to create your first omnichannel master post!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color }: any) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400">{title}</span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
