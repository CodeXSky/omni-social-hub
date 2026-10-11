import React from "react";
import { Platform } from "@prisma/client";
import { 
  Camera, 
  MessageSquare, 
  Share2, 
  Video, 
  MessageCircle, 
  Pin, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Layers,
  Send,
  PlaySquare
} from "lucide-react";

export interface PlatformConfig {
  name: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  maxChars?: number;
  aspectRatioHint: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  YOUTUBE: {
    name: "YouTube / Shorts",
    badgeBg: "bg-red-500/10 border-red-500/30 text-red-400",
    badgeText: "text-red-400",
    borderColor: "border-red-500/40",
    icon: PlaySquare,
    maxChars: 5000,
    aspectRatioHint: "9:16 Shorts or 16:9 Video + Affiliate Links in Description",
  },
  TIKTOK: {
    name: "TikTok",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    badgeText: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    icon: Video,
    maxChars: 2200,
    aspectRatioHint: "9:16 Vertical Video (Required)",
  },
  INSTAGRAM: {
    name: "Instagram",
    badgeBg: "bg-pink-500/10 border-pink-500/30 text-pink-400",
    badgeText: "text-pink-400",
    borderColor: "border-pink-500/40",
    icon: Camera,
    maxChars: 2200,
    aspectRatioHint: "1:1 Square or 4:5 Carousel / Reel",
  },
  TWITTER: {
    name: "X (Twitter)",
    badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
    badgeText: "text-sky-400",
    borderColor: "border-sky-500/40",
    icon: Send,
    maxChars: 280,
    aspectRatioHint: "16:9 or 1:1 Image / Thread",
  },
  THREADS: {
    name: "Threads",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    badgeText: "text-purple-400",
    borderColor: "border-purple-500/40",
    icon: MessageCircle,
    maxChars: 500,
    aspectRatioHint: "Square / Text dialogue focus",
  },
  FACEBOOK: {
    name: "Facebook",
    badgeBg: "bg-blue-600/10 border-blue-600/30 text-blue-400",
    badgeText: "text-blue-400",
    borderColor: "border-blue-600/40",
    icon: Share2,
    maxChars: 5000,
    aspectRatioHint: "16:9 Image / Video + CTA Link",
  },
  PINTEREST: {
    name: "Pinterest",
    badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    badgeText: "text-rose-400",
    borderColor: "border-rose-500/40",
    icon: Pin,
    maxChars: 500,
    aspectRatioHint: "2:3 Vertical Graphic (1000x1500)",
  },
};
