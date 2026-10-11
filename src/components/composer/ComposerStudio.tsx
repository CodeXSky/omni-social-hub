"use client";

import React, { useState } from "react";
import { useComposerStore } from "@/store/composer-store";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { DevicePreview } from "@/components/composer/DevicePreview";
import { REALTIME_TRENDING_FEEDS } from "@/lib/trending-engine";
import { Platform } from "@prisma/client";
import {
  Sparkles,
  Send,
  Calendar,
  Image as ImageIcon,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Wand2,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Tag,
  Link as LinkIcon,
  Flame,
  HardDrive,
  Film,
  Zap,
  Check
} from "lucide-react";

export function ComposerStudio() {
  const {
    masterTitle,
    setMasterTitle,
    masterCaption,
    setMasterCaption,
    masterMediaUrls,
    googleDriveVideoUrl,
    setGoogleDriveVideoUrl,
    isGoogleDriveConverted,
    addMediaUrl,
    removeMediaUrl,
    scheduledAt,
    setScheduledAt,
    tone,
    setTone,
    affiliateLink,
    setAffiliateLink,
    affiliateProductName,
    setAffiliateProductName,
    currentTrendingTopic,
    setCurrentTrendingTopic,
    trendingUrgency,
    setTrendingUrgency,
    selectedPlatforms,
    togglePlatform,
    activeVariantTab,
    setActiveVariantTab,
    variants,
    updateVariant,
    setBulkVariants,
    isAdapting,
    setIsAdapting,
    isPublishing,
    setIsPublishing,
  } = useComposerStore();

  const [newMediaInput, setNewMediaInput] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Trigger AI Multi-Channel Adaptation with Trending & Google Drive Video
  const handleAdaptWithAI = async () => {
    try {
      setIsAdapting(true);
      const res = await fetch("/api/ai/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterCaption,
          targetPlatforms: selectedPlatforms,
          tone,
          niche: currentTrendingTopic,
          affiliateLink,
          affiliateProductName,
          googleDriveUrl: googleDriveVideoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkVariants(data.variants);
        if (data.trendingContext) {
          setCurrentTrendingTopic(data.trendingContext.topic);
          setTrendingUrgency(data.trendingContext.urgency);
        }
        setSuccessBanner(
          `🔥 AI updated copy with trending wave: "${data.trendingContext?.topic || currentTrendingTopic}" & Google Drive stream ready!`
        );
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdapting(false);
    }
  };

  // Submit / Publish Now or Schedule
  const handlePublishOrSchedule = async (isInstant: boolean) => {
    try {
      setIsPublishing(true);
      const payloadVariants = selectedPlatforms.map((p) => ({
        platform: p,
        adaptedContent: variants[p]?.caption || masterCaption,
        mediaUrls: variants[p]?.mediaUrls || masterMediaUrls,
        options: variants[p]?.options || {},
      }));

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: masterTitle,
          caption: masterCaption,
          mediaUrls: masterMediaUrls,
          scheduledAt: isInstant ? null : scheduledAt,
          publishNow: isInstant,
          variants: payloadVariants,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessBanner(
          isInstant
            ? "🚀 Dispatched to BullMQ workers! Video & affiliate links published across connected channels."
            : "📅 Successfully queued for automated multi-channel schedule!"
        );
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const currentVariant = variants[activeVariantTab] || {
    caption: masterCaption,
    hashtags: [],
    mediaUrls: masterMediaUrls,
    options: {},
  };

  const activeConfig = PLATFORM_CONFIGS[activeVariantTab] || PLATFORM_CONFIGS.YOUTUBE;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
      {/* Top Studio Control Bar */}
      <div className="h-14 px-8 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Composer Studio
            </h1>
          </div>
          <span className="text-xs text-zinc-500">|</span>
          <span className="text-xs text-zinc-400">
            Split-Screen 3-Column Omni Engine • Google Drive Video & Viral Trends
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdaptWithAI}
            disabled={isAdapting || !masterCaption}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAdapting ? "animate-spin" : ""}`} />
            <span>{isAdapting ? "Analyzing Viral Trends..." : "Generate Trending AI Copy"}</span>
          </button>

          <button
            onClick={() => handlePublishOrSchedule(false)}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Queue / Schedule</span>
          </button>

          <button
            onClick={() => handlePublishOrSchedule(true)}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? "Publishing..." : "Publish All Now"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-8 py-2 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 3-Column Split Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden divide-x divide-zinc-800/80">
        {/* ========================================================
            COLUMN 1: MASTER POST INPUT (Width: 4/12)
           ======================================================== */}
        <div className="col-span-4 p-5 overflow-y-auto space-y-4 bg-zinc-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Master Idea, Google Drive & Trends
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">STEP 1</span>
          </div>

          {/* Real-Time Trending Topic Selector */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-zinc-900 border border-orange-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Real-Time Trending Context
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold">
                {trendingUrgency}
              </span>
            </div>

            <select
              value={currentTrendingTopic}
              onChange={(e) => {
                setCurrentTrendingTopic(e.target.value);
                const found = REALTIME_TRENDING_FEEDS.find((f) => f.topic === e.target.value);
                if (found) setTrendingUrgency(found.urgency);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-orange-200 focus:outline-none focus:border-orange-500"
            >
              {REALTIME_TRENDING_FEEDS.map((t, idx) => (
                <option key={idx} value={t.topic}>
                  {t.topic} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Google Drive Video Link Ingestion Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-900 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Google Drive Video URL (Direct Stream)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                TikTok • Shorts • Reel Ready
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={googleDriveVideoUrl}
                onChange={(e) => setGoogleDriveVideoUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-blue-200 focus:outline-none focus:border-blue-400"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3" /> Auto-converted to direct pull URL
                </span>
                <span>Supports 9:16 vertical & 16:9</span>
              </div>
            </div>
          </div>

          {/* Affiliate Conversion Box */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                Affiliate Revenue Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                Auto-Injected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Affiliate Link</label>
                <input
                  type="text"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  value={affiliateProductName}
                  onChange={(e) => setAffiliateProductName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Master Post Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Campaign Title</label>
            <input
              type="text"
              value={masterTitle}
              onChange={(e) => setMasterTitle(e.target.value)}
              placeholder="e.g. Q4 Feature Launch"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Master Caption */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-zinc-400">Master Thought / Script</label>
              <span className="text-[10px] text-zinc-500">{masterCaption.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={masterCaption}
              onChange={(e) => setMasterCaption(e.target.value)}
              placeholder="Enter your core ideas. The AI will weave in current trending hooks and hashtags..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none"
            />
          </div>

          {/* Target Platforms Toggles */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">Target Publishing Channels</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PLATFORM_CONFIGS).map((key) => {
                const p = key as Platform;
                const config = PLATFORM_CONFIGS[p];
                const Icon = config.icon;
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? `${config.badgeBg} border-zinc-600`
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 2: AI ADAPTATION CONFIG & VARIANT EDITOR (Width: 4/12)
           ======================================================== */}
        <div className="col-span-4 p-5 overflow-y-auto space-y-4 bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              2. Tailored Platform Variants
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">TRENDING & GDRIVE ADAPTED</span>
          </div>

          {/* Platform Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {selectedPlatforms.map((p) => {
              const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.YOUTUBE;
              const Icon = cfg.icon;
              const isActive = activeVariantTab === p;
              return (
                <button
                  key={p}
                  onClick={() => setActiveVariantTab(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Specific Header Details */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                {activeConfig.name} Variant
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentVariant.caption.length} / {activeConfig.maxChars || 5000}
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/90 font-medium">
              💡 {activeConfig.aspectRatioHint}
            </div>
            {googleDriveVideoUrl && (
              <div className="text-[10px] text-blue-400 flex items-center gap-1 pt-1 border-t border-zinc-800">
                <Film className="w-3 h-3" /> Attached: Google Drive Video Stream
              </div>
            )}
          </div>

          {/* Customized Platform Caption */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">
              Adapted Caption (Trending Hooks & SEO)
            </label>
            <textarea
              rows={8}
              value={currentVariant.caption}
              onChange={(e) =>
                updateVariant(activeVariantTab, { caption: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-violet-500/60 leading-relaxed resize-none"
            />
          </div>

          {/* Hashtag Management */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">
              Surging Trending Hashtags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(currentVariant.hashtags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-orange-300 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* YouTube Specific Settings */}
          {activeVariantTab === Platform.YOUTUBE && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-[11px] font-semibold text-red-400">YouTube & Shorts Specifics</label>
              <input
                type="text"
                placeholder="Video Title (SEO optimized)"
                value={currentVariant.options?.title || ""}
                onChange={(e) =>
                  updateVariant(Platform.YOUTUBE, {
                    options: { ...currentVariant.options, title: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
              />
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Pinned Affiliate Comment:</span>
                  <span className="text-amber-400">Active</span>
                </div>
                <input
                  type="text"
                  placeholder="Pinned Comment Text"
                  value={currentVariant.options?.pinnedComment || ""}
                  onChange={(e) =>
                    updateVariant(Platform.YOUTUBE, {
                      options: { ...currentVariant.options, pinnedComment: e.target.value },
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-amber-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            COLUMN 3: REAL-TIME DEVICE LIVE PREVIEW (Width: 4/12)
           ======================================================== */}
        <div className="col-span-4 p-5 overflow-y-auto bg-zinc-950 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              3. Native Live Simulation
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">100% VISUAL ACCURACY</span>
          </div>

          <DevicePreview
            platform={activeVariantTab}
            caption={currentVariant.caption}
            mediaUrls={currentVariant.mediaUrls || masterMediaUrls}
            options={currentVariant.options}
          />
        </div>
      </div>
    </div>
  );
}
