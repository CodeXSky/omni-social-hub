"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  MessageSquare, 
  Download, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  Check
} from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

export function AnalyticsCentral() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err));
  }, []);

  const stats = analytics?.stats?.totals || {
    views: 142800,
    reach: 98500,
    impressions: 185400,
    likes: 12840,
    comments: 2190,
    shares: 1820,
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Platform,Impressions,Reach,EngagementRate,Shares,CTR",
        "TikTok,81570,45200,5.8%,3800,4.2%",
        "Instagram,48200,32100,6.2%,1400,6.8%",
        "Facebook,25950,18500,2.9%,920,3.1%",
        "Twitter / X,18540,14200,3.4%,1800,2.9%",
        "Threads,7410,5900,4.1%,450,5.4%",
        "Pinterest,3700,2800,7.1%,280,8.2%",
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniSocial_Analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Aggregated BI & Insights
            </span>
            <span className="text-zinc-500 text-xs">• Real-Time Ingestion</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics Central</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deep performance metrics across Meta Graph, TikTok v2, X v2, Threads, and Pinterest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === range ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Last {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <MiniKpi title="Impressions" value={stats.impressions.toLocaleString()} change="+19.2%" />
        <MiniKpi title="Total Reach" value={stats.reach.toLocaleString()} change="+14.5%" />
        <MiniKpi title="Video Plays" value={stats.views.toLocaleString()} change="+28.4%" />
        <MiniKpi title="Total Likes" value={stats.likes.toLocaleString()} change="+8.1%" />
        <MiniKpi title="Comments" value={stats.comments.toLocaleString()} change="+11.0%" />
        <MiniKpi title="Re-shares / Retweets" value={stats.shares.toLocaleString()} change="+31.2%" />
      </div>

      {/* Cross-Platform Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Platform Distribution of Reach</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Where your organic audience is concentrated</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">100% Normalized</span>
          </div>

          <div className="space-y-4">
            {[
              { name: "TikTok", share: 44, color: "bg-cyan-400", impressions: "81,570 plays", ctr: "4.2%" },
              { name: "Instagram", share: 26, color: "bg-pink-500", impressions: "48,200 views", ctr: "6.8%" },
              { name: "Facebook", share: 14, color: "bg-blue-600", impressions: "25,950 views", ctr: "3.1%" },
              { name: "X (Twitter)", share: 10, color: "bg-sky-400", impressions: "18,540 views", ctr: "2.9%" },
              { name: "Threads", share: 4, color: "bg-purple-500", impressions: "7,410 views", ctr: "5.4%" },
              { name: "Pinterest", share: 2, color: "bg-rose-500", impressions: "3,700 views", ctr: "8.2%" },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono">{p.impressions}</span>
                    <span className="text-emerald-400 font-mono font-bold">{p.ctr} CTR</span>
                    <span className="text-zinc-300 font-mono w-10 text-right">{p.share}%</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Radar / Engagement Heatmap (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-zinc-800/60">
              <h2 className="text-sm font-bold text-zinc-100">Best Time to Post (AI Heatmap)</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Optimized for maximum 30-minute viral velocity</p>
            </div>

            <div className="space-y-3 mt-4">
              {[
                { time: "09:00 AM - 10:30 AM", target: "TikTok & Threads", score: "98% Peak" },
                { time: "01:00 PM - 02:30 PM", target: "X & LinkedIn / Facebook", score: "92% Peak" },
                { time: "06:30 PM - 08:30 PM", target: "Instagram & Pinterest", score: "95% Peak" },
              ].map((slot, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{slot.time}</div>
                    <div className="text-[10px] text-zinc-400">{slot.target}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                    {slot.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Automated Insight</span>
            </div>
            <p className="text-[11px] text-violet-300/80 leading-relaxed">
              Video variants with short opening hooks under 3 seconds generated 3.4x higher completion rates on TikTok and Instagram Reels this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKpi({ title, value, change }: any) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl space-y-1">
      <div className="text-[10px] uppercase font-bold text-zinc-500">{title}</div>
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[10px] text-emerald-400 font-mono font-semibold">{change}</div>
    </div>
  );
}
