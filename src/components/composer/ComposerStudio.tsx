"use client";

import React, { useState } from "react";
import { useComposerStore } from "@/store/composer-store";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { DevicePreview } from "@/components/composer/DevicePreview";
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
} from "lucide-react";

export function ComposerStudio() {
  const {
    masterTitle,
    setMasterTitle,
    masterCaption,
    setMasterCaption,
    masterMediaUrls,
    addMediaUrl,
    removeMediaUrl,
    scheduledAt,
    setScheduledAt,
    tone,
    setTone,
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

  // Trigger AI Multi-Channel Adaptation
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkVariants(data.variants);
        setSuccessBanner("✨ AI tailored native captions across all active platforms!");
        setTimeout(() => setSuccessBanner(null), 4000);
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
            ? "🚀 Dispatched to BullMQ workers! Posts are publishing across connected channels."
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

  const activeConfig = PLATFORM_CONFIGS[activeVariantTab];

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
            Split-Screen 3-Column Omni Engine
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdaptWithAI}
            disabled={isAdapting || !masterCaption}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAdapting ? "animate-spin" : ""}`} />
            <span>{isAdapting ? "Generating Variants..." : "Adapt All with AI"}</span>
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
        <div className="col-span-4 p-5 overflow-y-auto space-y-5 bg-zinc-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Master Idea & Settings
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">STEP 1</span>
          </div>

          {/* Master Post Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">Post Title / Campaign</label>
            <input
              type="text"
              value={masterTitle}
              onChange={(e) => setMasterTitle(e.target.value)}
              placeholder="e.g. Q4 Feature Launch"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Master Caption */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-zinc-400">Master Script / Core Thought</label>
              <span className="text-[10px] text-zinc-500">{masterCaption.length} chars</span>
            </div>
            <textarea
              rows={6}
              value={masterCaption}
              onChange={(e) => setMasterCaption(e.target.value)}
              placeholder="Type your base message or campaign thought here. The AI engine will reshape this into platform-specific lengths, hooks, and hashtags..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none"
            />
          </div>

          {/* Tone & AI Preset */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">AI Adaptation Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "viral_edgy", label: "🔥 Viral & Edgy" },
                { id: "engaging", label: "💬 Engaging" },
                { id: "professional", label: "💼 SaaS Pro" },
                { id: "educational", label: "📚 Guide" },
                { id: "casual", label: "☕ Casual" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border text-left transition-colors ${
                    tone === t.id
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Platforms Toggles */}
          <div className="space-y-2">
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

          {/* Media Attachments */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400">Media Assets (Images / Videos)</label>
            <div className="space-y-2">
              {masterMediaUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{url}</span>
                  </div>
                  <button
                    onClick={() => removeMediaUrl(idx)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image or 9:16 video URL..."
                  value={newMediaInput}
                  onChange={(e) => setNewMediaInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60"
                />
                <button
                  onClick={() => {
                    if (newMediaInput.trim()) {
                      addMediaUrl(newMediaInput.trim());
                      setNewMediaInput("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scheduled Date Picker */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <label className="text-[11px] font-semibold text-zinc-400">Schedule Date & Time</label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduledAt || ""}
                onChange={(e) => setScheduledAt(e.target.value || null)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/60"
              />
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
            <span className="text-[10px] text-zinc-500 font-mono">EDIT PER PLATFORM</span>
          </div>

          {/* Platform Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {selectedPlatforms.map((p) => {
              const cfg = PLATFORM_CONFIGS[p];
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
                {currentVariant.caption.length} / {activeConfig.maxChars || 2200}
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/90 font-medium">
              💡 {activeConfig.aspectRatioHint}
            </div>
          </div>

          {/* Customized Platform Caption */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">
              Adapted Caption (Editable Override)
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
            <label className="text-[11px] font-semibold text-zinc-400">Target Hashtags</label>
            <div className="flex flex-wrap gap-1.5">
              {(currentVariant.hashtags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Specific Extra Parameters */}
          {activeVariantTab === Platform.PINTEREST && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-[11px] font-semibold text-rose-400">Pinterest Pin Specifics</label>
              <input
                type="text"
                placeholder="Pin Title (SEO optimized)"
                value={currentVariant.options?.title || ""}
                onChange={(e) =>
                  updateVariant(Platform.PINTEREST, {
                    options: { ...currentVariant.options, title: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
              />
              <input
                type="text"
                placeholder="Destination Link URL"
                value={currentVariant.options?.linkUrl || ""}
                onChange={(e) =>
                  updateVariant(Platform.PINTEREST, {
                    options: { ...currentVariant.options, linkUrl: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
              />
            </div>
          )}

          {activeVariantTab === Platform.TIKTOK && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-[11px] font-semibold text-cyan-400">TikTok Direct Post Settings</label>
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div>Sound: <span className="text-zinc-200">Recommended Viral Audio</span></div>
                <div>Privacy: <span className="text-zinc-200">PUBLIC_TO_EVERYONE</span></div>
                <div>Format: <span className="text-emerald-400">9:16 Vertical Video Pull-URL Enabled</span></div>
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
