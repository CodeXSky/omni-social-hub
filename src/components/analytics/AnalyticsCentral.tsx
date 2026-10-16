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
    views: 0,
    reach: 0,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  const platformDist = analytics?.platformDistribution || [];

  const handleExportCSV = () => {
    const csvRows = [
      "Platform,Views,SharePercent",
      ...platformDist.map((p: any) => `${p.platform},${p.views || 0},${p.share}%`),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");

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
            Deep performance metrics calculated from live posts published across YouTube, TikTok, Meta & X.
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
        <MiniKpi title="Impressions" value={stats.impressions.toLocaleString()} change={stats.impressions > 0 ? "Hiển thị" : "0"} />
        <MiniKpi title="Total Reach" value={stats.reach.toLocaleString()} change={stats.reach > 0 ? "Tiếp cận" : "0"} />
        <MiniKpi title="Video Plays" value={stats.views.toLocaleString()} change={stats.views > 0 ? "Lượt xem" : "0"} />
        <MiniKpi title="Total Likes" value={stats.likes.toLocaleString()} change={stats.likes > 0 ? "Lượt thích" : "0"} />
        <MiniKpi title="Comments" value={stats.comments.toLocaleString()} change={stats.comments > 0 ? "Bình luận" : "0"} />
        <MiniKpi title="Re-shares / Retweets" value={stats.shares.toLocaleString()} change={stats.shares > 0 ? "Chia sẻ" : "0"} />
      </div>

      {/* Cross-Platform Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Live Platform Distribution of Views</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Calculated dynamically from published campaign variants</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Real Dynamic Share</span>
          </div>

          <div className="space-y-4">
            {platformDist.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Chưa có dữ liệu phân bổ nền tảng. Các chỉ số sẽ tự động xuất hiện khi có bài đăng được xuất bản.
              </div>
            ) : (
              platformDist.map((p: any, idx: number) => {
              const cfg = PLATFORM_CONFIGS[p.platform as Platform] || PLATFORM_CONFIGS.TWITTER;
              const colorBgMap: Record<string, string> = {
                YOUTUBE: "bg-red-500",
                TIKTOK: "bg-cyan-400",
                INSTAGRAM: "bg-pink-500",
                FACEBOOK: "bg-blue-600",
                TWITTER: "bg-sky-400",
                THREADS: "bg-purple-500",
                PINTEREST: "bg-rose-500",
              };

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-200">{cfg.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono">{(p.views || 0).toLocaleString()} views</span>
                      <span className="text-emerald-400 font-mono font-bold">{p.share}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorBgMap[p.platform] || "bg-cyan-400"} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.max(4, p.share)}%` }}
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right Radar / Engagement Heatmap (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-zinc-800/60">
              <h2 className="text-sm font-bold text-zinc-100">Best Time to Post (AI Heatmap)</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Optimized for maximum 30-minute viral velocity (Vietnam GMT+7)</p>
            </div>

            <div className="space-y-3 mt-4">
              {[
                { time: "11:30 AM - 01:00 PM", target: "TikTok & Shorts (Giờ nghỉ trưa)", score: "98% Peak" },
                { time: "07:30 PM - 09:30 PM", target: "Facebook Reels & Instagram (Tối)", score: "96% Peak" },
                { time: "09:30 PM - 11:00 PM", target: "TikTok Shop & Threads (Săn sale đêm)", score: "94% Peak" },
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
              Các video review gắn trực tiếp liên kết affiliate và giỏ hàng vàng trong 3 giây đầu tiên giúp tăng tỷ lệ chuyển đổi đơn hàng lên 3.8 lần so với chỉ để link ở bio.
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
