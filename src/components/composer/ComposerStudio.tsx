"use client";

import React, { useState } from "react";
import { useComposerStore } from "@/store/composer-store";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { DevicePreview } from "@/components/composer/DevicePreview";
import { MediaUploader } from "@/components/composer/MediaUploader";
import { REALTIME_TRENDING_FEEDS } from "@/lib/trending-engine";
import { validatePlatformPost, PLATFORM_RULES } from "@/lib/platform-rules";
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
  Check,
  Search,
  Globe,
  Loader2,
  AlertTriangle,
  Hash
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
    affiliateProductUrl,
    setAffiliateProductUrl,
    affiliateLink,
    setAffiliateLink,
    affiliateProductName,
    setAffiliateProductName,
    fetchedProduct,
    setFetchedProduct,
    isFetchingProduct,
    setIsFetchingProduct,
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

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  // Fetch Product Metadata from Affiliate Product Link
  const handleFetchProductMetadata = async () => {
    if (!affiliateProductUrl) return;
    try {
      setIsFetchingProduct(true);
      const res = await fetch("/api/product/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: affiliateProductUrl }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        const prod = data.product;
        setFetchedProduct(prod);
        setAffiliateProductName(prod.title);
        setAffiliateLink(affiliateProductUrl);

        setMasterTitle(`Review & Trải Nghiệm: ${prod.title}`);
        setMasterCaption(
          `Review trải nghiệm thực tế ${prod.title}. Đánh giá chi tiết ưu nhược điểm, độ bền và cảm giác sử dụng thực tế: ${prod.description}`
        );

        if (prod.title.toLowerCase().includes("chuột") || prod.title.toLowerCase().includes("công thái học") || prod.title.toLowerCase().includes("logitech")) {
          setCurrentTrendingTopic("Ergonomic Desk Setup & Anti-Fatigue Tech Gadgets");
          setTrendingUrgency("EXPLODING 🔥");
        } else {
          setCurrentTrendingTopic("Shopee Hot Deals & Must-Have Tech Gadgets 2026");
          setTrendingUrgency("EXPLODING 🔥");
        }

        setSuccessBanner(`🎯 Đã tải thông tin "${prod.title.slice(0, 45)}..."! Bấm "Generate Trending AI Copy" để tạo bài viết.`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingProduct(false);
    }
  };

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
          niche: currentTrendingTopic,
          affiliateLink,
          affiliateProductName: fetchedProduct?.title || affiliateProductName,
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
          `🔥 AI đã tạo nội dung chuẩn hóa cho ${selectedPlatforms.length} kênh theo xu hướng "${data.trendingContext?.topic || currentTrendingTopic}"!`
        );
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdapting(false);
    }
  };

  // Quick Append Hashtags
  const handleAppendHashtags = () => {
    const defaultTags: Record<Platform, string[]> = {
      [Platform.TIKTOK]: ["#foryou", "#review", "#tech", "#gadgets", "#trending"],
      [Platform.YOUTUBE]: ["#Shorts", "#Technology", "#GadgetsReview"],
      [Platform.INSTAGRAM]: ["#reels", "#gadgetlover", "#techlife", "#viral"],
      [Platform.FACEBOOK]: ["#congnghe", "#review", "#dealhot"],
      [Platform.TWITTER]: ["#TechTrends", "#Gadgets"],
      [Platform.THREADS]: ["#technology", "#gear", "#review"],
      [Platform.PINTEREST]: ["#techsetup", "#gadgets", "#deskaccessories"],
    };

    const tagsToAdd = defaultTags[activeVariantTab] || ["#trending"];
    const currentText = variants[activeVariantTab]?.caption || masterCaption;
    const updatedCaption = `${currentText}\n\n${tagsToAdd.join(" ")}`;
    updateVariant(activeVariantTab, { caption: updatedCaption, hashtags: tagsToAdd });
  };

  // Submit / Publish Now or Schedule
  const handlePublishOrSchedule = async (isInstant: boolean) => {
    try {
      setIsPublishing(true);
      const payloadVariants = selectedPlatforms.map((p) => ({
        platform: p,
        adaptedContent: variants[p]?.caption || masterCaption,
        mediaUrls: variants[p]?.mediaUrls && variants[p].mediaUrls.length > 0 ? variants[p].mediaUrls : masterMediaUrls,
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
            ? "🚀 Đã phát hành ngay tới các kênh! Xem chi tiết trong tab Records."
            : `📅 Đã lên lịch tự động cho bài viết thành công vào lúc ${new Date(scheduledAt || Date.now()).toLocaleString("vi-VN")}!`
        );
        setTimeout(() => setSuccessBanner(null), 6000);
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

  // Validation
  const validation = validatePlatformPost(activeVariantTab, {
    title: masterTitle,
    caption: currentVariant.caption,
    mediaUrls: currentVariant.mediaUrls?.length ? currentVariant.mediaUrls : masterMediaUrls,
  });

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
            Split-Screen Multi-Channel Engine • Drag & Drop Media & AI Viral Hooks
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
            <span>{isAdapting ? "Đang phân tích xu hướng..." : "Tạo biến thể AI"}</span>
          </button>

          <button
            onClick={() => setShowScheduleInput(!showScheduleInput)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showScheduleInput
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700/80"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Lên lịch tự động</span>
          </button>

          {showScheduleInput ? (
            <button
              onClick={() => handlePublishOrSchedule(false)}
              disabled={isPublishing || !scheduledAt}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Xác nhận lên lịch</span>
            </button>
          ) : (
            <button
              onClick={() => handlePublishOrSchedule(true)}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? "Đang xuất bản..." : "Đăng tất cả ngay"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Datetime Bar if opened */}
      {showScheduleInput && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-8 py-2.5 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-200 font-semibold">Chọn thời gian lên lịch:</span>
            <input
              type="datetime-local"
              value={scheduledAt || ""}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-zinc-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
            <span className="text-[11px] text-zinc-400">
              Hệ thống Cron Scheduler sẽ tự động dispatch khi đến giờ hẹn.
            </span>
          </div>
          <button onClick={() => setShowScheduleInput(false)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

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
              1. Master Idea, Product & Media Hub
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">BƯỚC 1</span>
          </div>

          {/* 1. PRODUCT METADATA FETCHER (Auto-Metadata Scraper) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Affiliate Target Product Link
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Auto-Metadata Scraper
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={affiliateProductUrl}
                onChange={(e) => setAffiliateProductUrl(e.target.value)}
                placeholder="Paste Shopee, Lazada, Amazon, Shopify, or product link..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleFetchProductMetadata}
                disabled={isFetchingProduct || !affiliateProductUrl}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {isFetchingProduct ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Fetch Info</span>
              </button>
            </div>

            {fetchedProduct && (
              <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                <div className="font-bold text-white line-clamp-1">{fetchedProduct.title}</div>
                <div className="text-[10px] text-zinc-400 line-clamp-2">{fetchedProduct.description}</div>
                <div className="text-[9px] text-emerald-400 font-mono pt-0.5">
                  Brand: {fetchedProduct.brand} • Ready for AI copy optimization
                </div>
              </div>
            )}
          </div>

          {/* 2. GOOGLE DRIVE VIDEO LINK INGESTION */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-900 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Google Drive Video Link (Direct Stream)
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
                  <Check className="w-3 h-3" /> Tự động chuyển đổi thành URL stream trực tiếp
                </span>
                <span>Hỗ trợ 9:16 dọc & 16:9</span>
              </div>
            </div>
          </div>

          {/* Master Post Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Tiêu đề chiến dịch</label>
            <input
              type="text"
              value={masterTitle}
              onChange={(e) => setMasterTitle(e.target.value)}
              placeholder="Ví dụ: Đánh Giá Siêu Phẩm Công Nghệ 2026"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Master Caption */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-zinc-400">Nội dung cốt lõi (Master Script)</label>
              <span className="text-[10px] text-zinc-500 font-mono">{masterCaption.length} ký tự</span>
            </div>
            <textarea
              rows={4}
              value={masterCaption}
              onChange={(e) => setMasterCaption(e.target.value)}
              placeholder="Nhập ý tưởng chính hoặc kịch bản. AI sẽ tự động biến hóa câu từ và hashtag phù hợp cho từng nền tảng..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed resize-none"
            />
          </div>

          {/* DIRECT DRAG & DROP MEDIA UPLOADER (NEW GÓI 2) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Media Đính Kèm (Upload Trực Tiếp từ Máy)</span>
            </label>
            <MediaUploader
              mediaUrls={masterMediaUrls}
              onAddMedia={addMediaUrl}
              onRemoveMedia={removeMediaUrl}
            />
          </div>

          {/* REAL-TIME TRENDING TOPIC SELECTOR */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-zinc-900 border border-orange-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Chủ Đề Xu Hướng (Viral Hook Context)
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

          {/* AFFILIATE REFERRAL LINK */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                Link Tiếp Thị Liên Kết (Affiliate Link)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                Tự Động Chèn
              </span>
            </div>

            <input
              type="text"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://shopee.vn/affiliate/product-123"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Target Platforms Toggles */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">Chọn Kênh Xuất Bản</label>
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
              2. Tinh Chỉnh Biến Thể Kênh
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">BƯỚC 2</span>
          </div>

          {/* Platform Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            {selectedPlatforms.map((p) => {
              const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.YOUTUBE;
              const Icon = cfg.icon;
              const isActive = activeVariantTab === p;
              return (
                <button
                  key={p}
                  onClick={() => setActiveVariantTab(p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white border border-cyan-500/50 shadow-md shadow-cyan-500/10 text-cyan-300"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Specific Header Details */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                {activeConfig.name}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  validation.remainingChars < 0
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : validation.remainingChars < 50
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {currentVariant.caption.length} / {PLATFORM_RULES[activeVariantTab]?.maxCaptionLength || 5000} ký tự
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/90 font-medium">
              💡 {activeConfig.aspectRatioHint}
            </div>

            {/* Platform Constraints Validation Warnings */}
            {validation.errors.length > 0 && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 space-y-1">
                {validation.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-red-300">
                    <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
                {validation.warnings.map((warn, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick AI Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAppendHashtags}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <Hash className="w-3 h-3 text-cyan-400" />
              <span>Chèn Hashtags Gợi Ý</span>
            </button>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="storytelling">Giọng kể chuyện (Storytelling)</option>
              <option value="provocative">Giật tít tò mò (FOMO)</option>
              <option value="educational">Chuyên gia phân tích</option>
              <option value="direct_response">Kêu gọi mua hàng (Affiliate)</option>
            </select>
          </div>

          {/* Customized Platform Caption */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">
              Nội dung riêng cho {activeConfig.name}
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

          {/* Hashtag List */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">
              Hashtags Hiện Tại
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
        </div>

        {/* ========================================================
            COLUMN 3: REAL-TIME DEVICE LIVE PREVIEW (Width: 4/12)
           ======================================================== */}
        <div className="col-span-4 p-5 overflow-y-auto bg-zinc-950 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                3. Mô Phỏng Thực Tế:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeConfig.name}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">100% VISUAL ACCURACY</span>
          </div>

          <DevicePreview
            platform={activeVariantTab}
            caption={currentVariant.caption}
            mediaUrls={currentVariant.mediaUrls?.length ? currentVariant.mediaUrls : masterMediaUrls}
            googleDriveUrl={googleDriveVideoUrl}
            options={currentVariant.options}
            availablePlatforms={selectedPlatforms}
            onSelectPlatform={(p) => setActiveVariantTab(p)}
          />
        </div>
      </div>
    </div>
  );
}
