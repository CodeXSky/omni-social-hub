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
  Tag
} from "lucide-react";

interface DevicePreviewProps {
  platform: Platform;
  caption: string;
  mediaUrls: string[];
  options?: Record<string, any>;
}

export function DevicePreview({ platform, caption, mediaUrls, options = {} }: DevicePreviewProps) {
  const [deviceFrame, setDeviceFrame] = useState<"phone" | "card">("phone");
  const media = mediaUrls[0] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Device Mode Toggle */}
      <div className="flex items-center gap-2 mb-4 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-[11px]">
        <button
          onClick={() => setDeviceFrame("phone")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            deviceFrame === "phone" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Native Mobile Frame
        </button>
        <button
          onClick={() => setDeviceFrame("card")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            deviceFrame === "card" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Feed Card View
        </button>
      </div>

      {/* Frame Container */}
      {deviceFrame === "phone" ? (
        <div className="w-[340px] h-[670px] bg-zinc-950 rounded-[44px] border-[6px] border-zinc-800 shadow-2xl shadow-cyan-950/20 relative overflow-hidden flex flex-col select-none ring-1 ring-zinc-700/50">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
          </div>

          {/* Render Mockup based on Platform */}
          <div className="flex-1 overflow-y-auto pt-7 pb-4">
            {platform === Platform.YOUTUBE && <YouTubeMockup caption={caption} media={media} options={options} />}
            {platform === Platform.TIKTOK && <TikTokMockup caption={caption} media={media} options={options} />}
            {platform === Platform.INSTAGRAM && <InstagramMockup caption={caption} media={media} />}
            {platform === Platform.TWITTER && <TwitterMockup caption={caption} media={media} options={options} />}
            {platform === Platform.THREADS && <ThreadsMockup caption={caption} media={media} />}
            {platform === Platform.FACEBOOK && <FacebookMockup caption={caption} media={media} />}
            {platform === Platform.PINTEREST && <PinterestMockup caption={caption} media={media} options={options} />}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-500 rounded-full" />
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 shadow-xl overflow-hidden">
          {platform === Platform.YOUTUBE && <YouTubeMockup caption={caption} media={media} options={options} />}
          {platform === Platform.TIKTOK && <TikTokMockup caption={caption} media={media} options={options} />}
          {platform === Platform.INSTAGRAM && <InstagramMockup caption={caption} media={media} />}
          {platform === Platform.TWITTER && <TwitterMockup caption={caption} media={media} options={options} />}
          {platform === Platform.THREADS && <ThreadsMockup caption={caption} media={media} />}
          {platform === Platform.FACEBOOK && <FacebookMockup caption={caption} media={media} />}
          {platform === Platform.PINTEREST && <PinterestMockup caption={caption} media={media} options={options} />}
        </div>
      )}
    </div>
  );
}

// 0. YouTube Shorts & Video Simulation with Affiliate Callout
function YouTubeMockup({ caption, media, options }: { caption: string; media: string; options: any }) {
  const title = options?.title || "Product Review & Walkthrough | Best Deals";
  const pinnedComment = options?.pinnedComment || "👉 Claim 30% OFF with our affiliate link in description!";

  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-between overflow-hidden">
      {/* Background Simulation */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media} alt="YouTube Shorts" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-2 text-white text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-red-500 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          Shorts
        </span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1">
            <ShoppingBag className="w-2.5 h-2.5" /> Affiliate Active
          </span>
        </div>
      </div>

      {/* Right Sidebar Interaction Icons */}
      <div className="relative z-10 self-end mr-3 flex flex-col items-center gap-4 text-white">
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
      <div className="relative z-10 px-4 pb-4 text-white space-y-2.5">
        {/* Affiliate Product Pinned Callout */}
        <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md text-[10px] text-white space-y-1">
          <div className="flex items-center justify-between font-bold text-red-300">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-red-400" /> Pinned Affiliate Deal:
            </span>
            <span className="text-amber-300">30% OFF CODE</span>
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

// 1. TikTok Reels Simulation
function TikTokMockup({ caption, media, options }: { caption: string; media: string; options: any }) {
  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-between overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media} alt="TikTok Media" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-2 text-white/90 text-xs font-semibold">
        <span className="text-white/60">LIVE</span>
        <div className="flex gap-4">
          <span className="text-white/60">Following</span>
          <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        </div>
        <Eye className="w-4 h-4 text-white/70" />
      </div>

      {/* Right Sidebar Interaction Icons */}
      <div className="relative z-10 self-end mr-3 flex flex-col items-center gap-4 text-white">
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
      <div className="relative z-10 px-4 pb-4 text-white space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs">@acmedaily</span>
          <BadgeCheck className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
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

// 2. Instagram Feed Simulation
function InstagramMockup({ caption, media }: { caption: string; media: string }) {
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
            <div className="text-[9px] text-zinc-400">Sponsored • Audio original</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media} alt="Instagram Post" className="w-full h-full object-cover" />
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
              <img src={media} alt="Tweet Media" className="w-full h-full object-cover" />
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
function ThreadsMockup({ caption, media }: { caption: string; media: string }) {
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
            <div className="rounded-xl overflow-hidden border border-zinc-800/80 max-h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt="Threads Media" className="w-full h-full object-cover" />
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
function FacebookMockup({ caption, media }: { caption: string; media: string }) {
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
            <div className="text-[10px] text-zinc-500">Sponsored · 🌍 Public</div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
      </div>

      <p className="px-3 text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
        {caption || "Facebook post message..."}
      </p>

      {media && (
        <div className="aspect-video w-full bg-zinc-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media} alt="FB Media" className="w-full h-full object-cover" />
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
        <img src={media} alt="Pin" className="w-full object-cover rounded-2xl" />
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
