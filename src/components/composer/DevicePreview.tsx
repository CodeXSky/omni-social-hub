"use client";

import React, { useState } from "react";
import { Platform } from "@prisma/client";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Repeat2, 
  Music2, 
  ExternalLink, 
  MoreHorizontal,
  BadgeCheck,
  Send,
  Eye,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Tag,
  Film,
  ShieldAlert,
  SlidersHorizontal
} from "lucide-react";
import { parseGoogleDriveUrl } from "@/lib/gdrive-resolver";

interface DevicePreviewProps {
  platform: Platform;
  caption: string;
  mediaUrls: string[];
  options?: Record<string, any>;
  googleDriveUrl?: string;
  onSelectPlatform?: (platform: Platform) => void;
  availablePlatforms?: Platform[];
}

export function DevicePreview({ 
  platform, 
  caption, 
  mediaUrls, 
  options = {},
  googleDriveUrl,
  onSelectPlatform,
  availablePlatforms = []
}: DevicePreviewProps) {
  const [deviceFrame, setDeviceFrame] = useState<"phone" | "card">("phone");
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);

  const rawMedia = googleDriveUrl || mediaUrls[0] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";

  // Check if media is Google Drive
  const gdriveInfo = parseGoogleDriveUrl(rawMedia);
  const media = gdriveInfo.previewThumbnailUrl || rawMedia;

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-3">
      {/* Simulator Platform Quick Switcher & Controls */}
      {availablePlatforms.length > 0 && onSelectPlatform && (
        <div className="w-full flex items-center justify-between gap-1 pb-1 border-b border-zinc-900">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Preview Platform:</span>
          <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] scrollbar-none">
            {availablePlatforms.map((p) => (
              <button
                key={p}
                onClick={() => onSelectPlatform(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                  platform === p
                    ? "bg-cyan-500 text-zinc-950 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Device Mode Toggle & Safe Zones & Video Playback State */}
      <div className="flex items-center justify-between w-full px-1 gap-2">
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-[11px]">
          <button
            onClick={() => setDeviceFrame("phone")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              deviceFrame === "phone" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => setDeviceFrame("card")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              deviceFrame === "card" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Card
          </button>
        </div>

        {/* Safe Zone Overlay Toggle (TikTok, Shorts, Reels) */}
        {(platform === Platform.TIKTOK || platform === Platform.YOUTUBE || platform === Platform.INSTAGRAM) && (
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            title="Kiểm tra vùng an toàn (Safe Zone) tránh bị che text bởi UI"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              showSafeZones
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>{showSafeZones ? "Safe Zone: ON" : "Safe Zone: OFF"}</span>
          </button>
        )}

        {/* Video Player Toggle */}
        <button
          onClick={() => setIsPlayingVideo(!isPlayingVideo)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
            isPlayingVideo
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{isPlayingVideo ? "Stop" : "▶ Play"}</span>
        </button>
      </div>

      {/* Frame Container */}
      {deviceFrame === "phone" ? (
        <div className="w-[340px] h-[670px] bg-zinc-950 rounded-[44px] border-[6px] border-zinc-800 shadow-2xl shadow-cyan-950/20 relative overflow-hidden flex flex-col select-none ring-1 ring-zinc-700/50">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
          </div>

          {/* Safe Zone Visual Guide Overlay (9:16 vertical video guidelines) */}
          {showSafeZones && (platform === Platform.TIKTOK || platform === Platform.YOUTUBE || platform === Platform.INSTAGRAM) && (
            <div className="absolute inset-0 z-40 pointer-events-none border-2 border-dashed border-amber-400/50 m-2 mt-8 mb-6 rounded-2xl flex flex-col justify-between p-2">
              <div className="bg-amber-400/90 text-zinc-950 px-2 py-0.5 rounded text-[9px] font-extrabold self-start shadow">
                ⚠️ Top Header Zone (Avoid important text)
              </div>
              <div className="self-end mr-14 bg-amber-400/90 text-zinc-950 px-2 py-0.5 rounded text-[9px] font-extrabold shadow">
                ⚠️ Right Action Buttons (Like/Share/Comment)
              </div>
              <div className="bg-amber-400/90 text-zinc-950 px-2 py-0.5 rounded text-[9px] font-extrabold self-start shadow">
                ⚠️ Bottom Caption & Sound Area (Safe Margins)
              </div>
            </div>
          )}

          {/* Render Mockup based on Platform */}
          <div className="flex-1 overflow-hidden relative">
            {platform === Platform.YOUTUBE && (
              <YouTubeMockup 
                caption={caption} 
                media={media} 
                options={options} 
                gdriveInfo={gdriveInfo} 
                isPlayingVideo={isPlayingVideo} 
                onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
              />
            )}
            {platform === Platform.TIKTOK && (
              <TikTokMockup 
                caption={caption} 
                media={media} 
                options={options} 
                gdriveInfo={gdriveInfo} 
                isPlayingVideo={isPlayingVideo}
                onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
              />
            )}
            {platform === Platform.INSTAGRAM && (
              <InstagramMockup 
                caption={caption} 
                media={media} 
                gdriveInfo={gdriveInfo} 
                isPlayingVideo={isPlayingVideo}
                onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
              />
            )}
            {platform === Platform.TWITTER && <TwitterMockup caption={caption} media={media} options={options} />}
            {platform === Platform.THREADS && (
              <ThreadsMockup 
                caption={caption} 
                media={media} 
                isPlayingVideo={isPlayingVideo}
                gdriveInfo={gdriveInfo}
              />
            )}
            {platform === Platform.FACEBOOK && (
              <FacebookMockup 
                caption={caption} 
                media={media} 
                gdriveInfo={gdriveInfo} 
                isPlayingVideo={isPlayingVideo}
                onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
              />
            )}
            {platform === Platform.PINTEREST && <PinterestMockup caption={caption} media={media} options={options} />}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-500 rounded-full" />
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 shadow-xl overflow-hidden">
          {platform === Platform.YOUTUBE && (
            <YouTubeMockup 
              caption={caption} 
              media={media} 
              options={options} 
              gdriveInfo={gdriveInfo} 
              isPlayingVideo={isPlayingVideo}
              onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
            />
          )}
          {platform === Platform.TIKTOK && (
            <TikTokMockup 
              caption={caption} 
              media={media} 
              options={options} 
              gdriveInfo={gdriveInfo} 
              isPlayingVideo={isPlayingVideo}
              onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
            />
          )}
          {platform === Platform.INSTAGRAM && (
            <InstagramMockup 
              caption={caption} 
              media={media} 
              gdriveInfo={gdriveInfo} 
              isPlayingVideo={isPlayingVideo}
              onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
            />
          )}
          {platform === Platform.TWITTER && <TwitterMockup caption={caption} media={media} options={options} />}
          {platform === Platform.THREADS && (
            <ThreadsMockup 
              caption={caption} 
              media={media} 
              isPlayingVideo={isPlayingVideo}
              gdriveInfo={gdriveInfo}
            />
          )}
          {platform === Platform.FACEBOOK && (
            <FacebookMockup 
              caption={caption} 
              media={media} 
              gdriveInfo={gdriveInfo} 
              isPlayingVideo={isPlayingVideo}
              onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
            />
          )}
          {platform === Platform.PINTEREST && <PinterestMockup caption={caption} media={media} options={options} />}
        </div>
      )}
    </div>
  );
}

// 0. YouTube Shorts & Video Simulation with Affiliate Callout & Video Player
function YouTubeMockup({ 
  caption, 
  media, 
  options, 
  gdriveInfo,
  isPlayingVideo,
  onTogglePlay
}: { 
  caption: string; 
  media: string; 
  options: any; 
  gdriveInfo: any;
  isPlayingVideo?: boolean;
  onTogglePlay?: () => void;
}) {
  const title = options?.title || "Product Review & Walkthrough | Best Deals";
  const pinnedComment = options?.pinnedComment || "👉 Claim 30% OFF with our affiliate link in description!";

  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-between overflow-hidden">
      {/* Video or Thumbnail Background */}
      {isPlayingVideo && gdriveInfo?.embedVideoUrl ? (
        <iframe
          src={gdriveInfo.embedVideoUrl}
          className="absolute inset-0 w-full h-full border-0 z-0 bg-black"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : isPlayingVideo && gdriveInfo?.directStreamUrl ? (
        <video
          src={gdriveInfo.directStreamUrl}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-0 bg-black"
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media}
            alt="YouTube Shorts"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
            }}
          />
          {/* Play Overlay Button */}
          <button
            onClick={onTogglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/30 hover:scale-110 transition-transform z-10"
          >
            <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-white ml-1" />
          </button>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none z-10" />

      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-2 text-white text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-red-500 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          Shorts
        </span>
        <div className="flex items-center gap-2">
          {gdriveInfo?.isGoogleDrive && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold flex items-center gap-1">
              <Film className="w-2.5 h-2.5" /> GDrive Stream
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1">
            <ShoppingBag className="w-2.5 h-2.5" /> Affiliate Active
          </span>
        </div>
      </div>

      {/* Right Sidebar Interaction Icons */}
      <div className="relative z-20 self-end mr-3 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
            <ThumbsUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">38.4K</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
            <ThumbsDown className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Dislike</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">492</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Share</span>
        </div>
      </div>

      {/* Bottom Information, Channel & Affiliate Banner */}
      <div className="relative z-20 px-4 pb-4 text-white space-y-2.5">
        <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md text-[10px] text-white space-y-1">
          <div className="flex items-center justify-between font-bold text-red-300">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-red-400" /> Pinned Affiliate Deal:
            </span>
            <span className="text-amber-300">LIMITED DEAL</span>
          </div>
          <p className="line-clamp-1 text-zinc-200">{pinnedComment}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px]">
              YT
            </div>
            <span className="font-bold text-xs">@AcmeCreatorOfficial</span>
          </div>
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[11px] font-bold">
            Subscribe
          </button>
        </div>

        <h3 className="text-xs font-bold line-clamp-1 text-zinc-100">{title}</h3>
        <p className="text-[11px] line-clamp-2 text-zinc-300 leading-snug">
          {caption || "Full YouTube description with chapters and affiliate disclosures..."}
        </p>
      </div>
    </div>
  );
}

// 1. TikTok Reels Simulation with Video Player
function TikTokMockup({ 
  caption, 
  media, 
  options, 
  gdriveInfo,
  isPlayingVideo,
  onTogglePlay
}: { 
  caption: string; 
  media: string; 
  options: any; 
  gdriveInfo: any;
  isPlayingVideo?: boolean;
  onTogglePlay?: () => void;
}) {
  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-between overflow-hidden">
      {/* Video or Thumbnail Background */}
      {isPlayingVideo && gdriveInfo?.embedVideoUrl ? (
        <iframe
          src={gdriveInfo.embedVideoUrl}
          className="absolute inset-0 w-full h-full border-0 z-0 bg-black"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : isPlayingVideo && gdriveInfo?.directStreamUrl ? (
        <video
          src={gdriveInfo.directStreamUrl}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-0 bg-black"
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media}
            alt="TikTok Media"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
            }}
          />
          {/* Play Overlay Button */}
          <button
            onClick={onTogglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-cyan-500/90 text-zinc-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-110 transition-transform z-10"
          >
            <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-zinc-950 ml-1" />
          </button>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none z-10" />

      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-2 text-white/90 text-xs font-semibold">
        <span className="text-white/60">LIVE</span>
        <div className="flex gap-4">
          <span className="text-white/60">Following</span>
          <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        </div>
        <Eye className="w-4 h-4 text-white/70" />
      </div>

      {/* Right Sidebar Interaction Icons */}
      <div className="relative z-20 self-end mr-3 flex flex-col items-center gap-4 text-white">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
            +
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2 rounded-full bg-black/40 backdrop-blur-md">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">84.2K</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2 rounded-full bg-black/40 backdrop-blur-md">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">1,248</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2 rounded-full bg-black/40 backdrop-blur-md">
            <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">9,410</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2 rounded-full bg-black/40 backdrop-blur-md">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">3.8K</span>
        </div>
      </div>

      {/* Bottom Caption & Audio Bar */}
      <div className="relative z-20 px-4 pb-4 text-white space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs">@acmedaily</span>
          <BadgeCheck className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          {gdriveInfo?.isGoogleDrive && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
              GDrive
            </span>
          )}
        </div>
        <p className="text-[11px] line-clamp-3 text-zinc-100 leading-snug">
          {caption || "Write your viral TikTok hook here..."}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-zinc-300">
          <Music2 className="w-3 h-3 animate-spin" />
          <span className="truncate">{options?.soundRecommendation || "Original Audio - Acme Viral Sound"}</span>
        </div>
      </div>
    </div>
  );
}

// 2. Instagram Feed Simulation with Video Player
function InstagramMockup({ 
  caption, 
  media, 
  gdriveInfo,
  isPlayingVideo,
  onTogglePlay
}: { 
  caption: string; 
  media: string; 
  gdriveInfo: any;
  isPlayingVideo?: boolean;
  onTogglePlay?: () => void;
}) {
  return (
    <div className="bg-black text-white flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="Avatar" className="w-full h-full rounded-full object-cover border border-black" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">acme.official</span>
              <BadgeCheck className="w-3 h-3 text-blue-400 fill-blue-400" />
            </div>
            <div className="text-[9px] text-zinc-400">Reel • Audio original</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
        {isPlayingVideo && gdriveInfo?.embedVideoUrl ? (
          <iframe
            src={gdriveInfo.embedVideoUrl}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : isPlayingVideo && gdriveInfo?.directStreamUrl ? (
          <video
            src={gdriveInfo.directStreamUrl}
            controls
            autoPlay
            className="w-full h-full object-cover bg-black"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media}
              alt="Instagram Post"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
              }}
            />
            {/* Play Overlay Button */}
            <button
              onClick={onTogglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform"
            >
              <div className="w-0 h-0 border-y-6 border-y-transparent border-l-[12px] border-l-white ml-1" />
            </button>
          </>
        )}
        {gdriveInfo?.isGoogleDrive && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold text-blue-300">
            Google Drive Stream
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-zinc-200 hover:text-red-500" />
            <MessageCircle className="w-5 h-5 text-zinc-200" />
            <Send className="w-5 h-5 text-zinc-200" />
          </div>
          <Bookmark className="w-5 h-5 text-zinc-200" />
        </div>

        <div className="text-xs font-bold text-zinc-100">14,291 likes</div>

        <div className="text-xs text-zinc-200 space-y-1">
          <span className="font-bold mr-1.5">acme.official</span>
          <span className="whitespace-pre-line text-[11px] leading-relaxed text-zinc-300">
            {caption || "Instagram caption preview with tailored spacing and hashtags..."}
          </span>
        </div>

        <div className="text-[10px] text-zinc-500 uppercase tracking-wide">2 HOURS AGO</div>
      </div>
    </div>
  );
}

// 3. X / Twitter Mockup
function TwitterMockup({ caption, media, options }: { caption: string; media: string; options: any }) {
  const isThread = options?.isThread;
  const threadParts = options?.threadParts || [caption];

  return (
    <div className="bg-black text-white p-3 space-y-3 font-sans">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-zinc-700 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100">Acme Hub</span>
              <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span className="text-[11px] text-zinc-500">@AcmeHub · 12m</span>
            </div>
            <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
            {isThread ? threadParts[0] : (caption || "Share what is happening right now...")}
          </p>

          {media && (
            <div className="rounded-xl overflow-hidden border border-zinc-800 max-h-48 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media}
                alt="Tweet Media"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-zinc-500 text-[11px]">
            <span className="flex items-center gap-1 hover:text-sky-400">
              <MessageCircle className="w-3.5 h-3.5" /> 42
            </span>
            <span className="flex items-center gap-1 hover:text-emerald-400">
              <Repeat2 className="w-3.5 h-3.5" /> 18
            </span>
            <span className="flex items-center gap-1 hover:text-pink-500">
              <Heart className="w-3.5 h-3.5" /> 165
            </span>
            <span className="flex items-center gap-1 hover:text-sky-400">
              <Bookmark className="w-3.5 h-3.5" /> 24
            </span>
            <Share2 className="w-3.5 h-3.5 hover:text-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Threads Mockup
function ThreadsMockup({ 
  caption, 
  media,
  isPlayingVideo,
  gdriveInfo,
  onTogglePlay
}: { 
  caption: string; 
  media: string;
  isPlayingVideo?: boolean;
  gdriveInfo?: any;
  onTogglePlay?: () => void;
}) {
  return (
    <div className="bg-black text-white p-3 space-y-2">
      <div className="flex gap-2.5">
        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-100">acme.official</span>
            <span className="text-[10px] text-zinc-500">45m</span>
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
            {caption || "Start a thread..."}
          </p>

          {media && (
            <div className="rounded-xl overflow-hidden border border-zinc-800/80 max-h-52 relative">
              {isPlayingVideo && gdriveInfo?.embedVideoUrl ? (
                <iframe
                  src={gdriveInfo.embedVideoUrl}
                  className="w-full h-48 border-0 bg-black"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : isPlayingVideo && gdriveInfo?.directStreamUrl ? (
                <video
                  src={gdriveInfo.directStreamUrl}
                  controls
                  autoPlay
                  className="w-full h-48 object-cover bg-black"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media}
                    alt="Threads Media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
                    }}
                  />
                  {onTogglePlay && (
                    <button
                      onClick={onTogglePlay}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <div className="w-0 h-0 border-y-5 border-y-transparent border-l-[10px] border-l-white ml-0.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-zinc-400 pt-1">
            <Heart className="w-4 h-4 hover:text-red-500" />
            <MessageCircle className="w-4 h-4 hover:text-white" />
            <Repeat2 className="w-4 h-4 hover:text-white" />
            <Send className="w-4 h-4 hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Facebook Feed Mockup
function FacebookMockup({ 
  caption, 
  media, 
  gdriveInfo,
  isPlayingVideo,
  onTogglePlay
}: { 
  caption: string; 
  media: string; 
  gdriveInfo: any;
  isPlayingVideo?: boolean;
  onTogglePlay?: () => void;
}) {
  return (
    <div className="bg-zinc-950 text-white rounded-lg border border-zinc-900 space-y-2.5">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            AG
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100 flex items-center gap-1">
              Acme Global Official
              <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
            </div>
            <div className="text-[10px] text-zinc-500">Facebook Reel · 🌍 Public</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
      </div>

      <p className="px-3 text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
        {caption || "Facebook post message..."}
      </p>

      {media && (
        <div className="aspect-video w-full bg-zinc-900 overflow-hidden relative">
          {isPlayingVideo && gdriveInfo?.embedVideoUrl ? (
            <iframe
              src={gdriveInfo.embedVideoUrl}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : isPlayingVideo && gdriveInfo?.directStreamUrl ? (
            <video
              src={gdriveInfo.directStreamUrl}
              controls
              autoPlay
              className="w-full h-full object-cover bg-black"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media}
                alt="FB Media"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
                }}
              />
              <button
                onClick={onTogglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <div className="w-0 h-0 border-y-6 border-y-transparent border-l-[12px] border-l-white ml-1" />
              </button>
            </>
          )}
          {gdriveInfo?.isGoogleDrive && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold text-blue-300">
              Facebook Reel Stream
            </div>
          )}
        </div>
      )}

      <div className="p-3 pt-1 border-t border-zinc-900 flex justify-between text-xs text-zinc-400">
        <span className="hover:text-blue-400 flex items-center gap-1">👍 Like</span>
        <span className="hover:text-zinc-200 flex items-center gap-1">💬 Comment</span>
        <span className="hover:text-zinc-200 flex items-center gap-1">↗️ Share</span>
      </div>
    </div>
  );
}

// 6. Pinterest Pin Mockup
function PinterestMockup({ caption, media, options }: { caption: string; media: string; options: any }) {
  return (
    <div className="bg-zinc-950 p-2 space-y-2">
      <div className="rounded-2xl overflow-hidden relative shadow-lg group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media}
          alt="Pin"
          className="w-full object-cover rounded-2xl"
          onError={(e) => {
            (e.target as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
          }}
        />
        <div className="absolute top-2 right-2">
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-lg">
            Save
          </button>
        </div>
      </div>

      <div className="px-1 space-y-1">
        <h4 className="text-xs font-bold text-zinc-100 line-clamp-1">
          {options?.title || "Modern Omnichannel Marketing Strategy"}
        </h4>
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">
          {caption || "Pinterest Pin description with rich keywords and link tags..."}
        </p>
        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-zinc-300">
          <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] font-bold text-white">
            P
          </div>
          <span>Acme Design Boards</span>
        </div>
      </div>
    </div>
  );
}
