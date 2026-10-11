import { Platform } from "@prisma/client";
import { getTrendingContext, TrendingInsight } from "../trending-engine";
import { parseGoogleDriveUrl } from "../gdrive-resolver";

export interface AdaptationResult {
  platform: Platform;
  caption: string;
  hashtags: string[];
  tips: string;
  metadata: Record<string, any>;
  videoStreamUrl?: string;
  thumbnailUrl?: string;
}

export interface AdaptationInput {
  masterCaption: string;
  targetPlatforms: Platform[];
  mediaUrls?: string[];
  googleDriveUrl?: string;
  nicheOrTopic?: string;
  tone?: "engaging" | "professional" | "viral_edgy" | "educational" | "casual";
  affiliateLink?: string;
  affiliateProductName?: string;
  useTrendingAI?: boolean;
}

/**
 * Enhanced AI Adaptation Engine
 * - Ingests real-time trending topics, breakthrough hooks, and surging hashtags
 * - Resolves Google Drive video links into direct streamable endpoints for YouTube, TikTok, FB Reel & Instagram
 * - Formats affiliate disclosures, timestamps, and pinned comments
 */
export async function adaptContentWithAI(input: AdaptationInput): Promise<{
  variants: Record<Platform, AdaptationResult>;
  trendingContext: TrendingInsight;
  gdriveResolved?: any;
}> {
  const { 
    masterCaption, 
    targetPlatforms, 
    mediaUrls = [],
    googleDriveUrl,
    nicheOrTopic, 
    tone = "engaging",
    affiliateLink = "https://omnisocial.io/ref/vip-partner",
    affiliateProductName = "OmniSocial Hub Pro",
    useTrendingAI = true,
  } = input;

  // Resolve Google Drive video link if provided
  let activeMediaUrl = mediaUrls[0] || "";
  let gdriveResolved = null;
  if (googleDriveUrl) {
    gdriveResolved = parseGoogleDriveUrl(googleDriveUrl);
    activeMediaUrl = gdriveResolved.directStreamUrl;
  } else if (activeMediaUrl.includes("drive.google.com")) {
    gdriveResolved = parseGoogleDriveUrl(activeMediaUrl);
    activeMediaUrl = gdriveResolved.directStreamUrl;
  }

  // Fetch real-time trending insight
  const trending = getTrendingContext(nicheOrTopic || masterCaption);

  const results: Partial<Record<Platform, AdaptationResult>> = {};

  for (const platform of targetPlatforms) {
    results[platform] = generatePlatformVariant(
      platform, 
      masterCaption, 
      tone, 
      trending,
      affiliateLink, 
      affiliateProductName,
      activeMediaUrl,
      gdriveResolved
    );
  }

  return {
    variants: results as Record<Platform, AdaptationResult>,
    trendingContext: trending,
    gdriveResolved,
  };
}

function generatePlatformVariant(
  platform: Platform,
  masterCaption: string,
  tone: string,
  trending: TrendingInsight,
  affiliateLink: string,
  affiliateProductName: string,
  mediaUrl: string,
  gdriveInfo: any
): AdaptationResult {
  const cleanCaption = masterCaption.trim();
  const trendingTags = trending.hashtags.slice(0, 3);

  switch (platform) {
    case Platform.YOUTUBE: {
      const hookTitle = `${trending.suggestedHook.slice(0, 50)} | Full Review`;
      const description = `${trending.suggestedHook}\n\n${cleanCaption}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎁 SPECIAL DEAL / AFFILIATE LINK:\n` +
        `👉 Get ${affiliateProductName} (30% OFF Limited Time): ${affiliateLink}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 VIDEO CHAPTERS:\n` +
        `0:00 - ${trending.topic} (Overview)\n` +
        `0:45 - Live System Walkthrough\n` +
        `1:35 - How To Set Up Google Drive Video Publishing\n` +
        `2:20 - Final Verdict & Claim Your Deal\n\n` +
        `⚠️ FTC Disclosure: Some links above are affiliate links. If you buy through them, we may earn a commission with no added cost to you.\n\n` +
        `#Shorts #YouTubeShorts ${trendingTags.join(" ")} #Affiliate`;

      const hashtags = ["#Shorts", "#YouTubeShorts", ...trendingTags, "#Affiliate"];
      return {
        platform: Platform.YOUTUBE,
        caption: description,
        hashtags,
        tips: `Trending surge match: "${trending.topic}". Includes 3-second hook, timestamps, and Google Drive video stream container.`,
        videoStreamUrl: mediaUrl,
        metadata: {
          title: hookTitle,
          isShorts: true,
          pinnedComment: `🔥 Claim your discount on ${affiliateProductName} here: ${affiliateLink} (Limited time offer!) 👇`,
          affiliateLink,
          aspectRatio: "9:16 Shorts or 16:9 Landscape",
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_STREAM" : "DIRECT_URL",
        },
      };
    }

    case Platform.TIKTOK: {
      const viralHook = trending.suggestedHook;
      const punchy = `${viralHook}\n\n${cleanCaption.slice(0, 240)}\n\n🔗 Link in bio to claim early access & deal! 👇`;
      const hashtags = ["#TikTokMadeMeDoIt", "#TechTok", ...trendingTags, "#FYP"];
      return {
        platform: Platform.TIKTOK,
        caption: `${punchy}\n\n${hashtags.join(" ")}`,
        hashtags,
        tips: `TikTok Creative Center Trend: "${trending.urgency}". Optimized for 9:16 vertical video pull URL.`,
        videoStreamUrl: mediaUrl,
        metadata: {
          hook: viralHook,
          soundRecommendation: "Trending Beat: Lo-Fi Synth 2026 Wave",
          aspectRatio: "9:16 Vertical Video",
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_PULL_URL" : "DIRECT_URL",
        },
      };
    }

    case Platform.INSTAGRAM: {
      const igCaption = `${trending.suggestedHook}\n\n${cleanCaption}\n.\n.\n👉 Click link in bio to get an exclusive deal! ✨\nDouble tap if this resonated! ❤️\nSave this Reel for later 📌\nShare with a friend! 🚀\n\n#InstagramReels #CreatorEconomy ${trendingTags.join(" ")} #DailyHustle`;
      const hashtags = ["#InstagramReels", "#CreatorEconomy", ...trendingTags, "#MarketingTips"];
      return {
        platform: Platform.INSTAGRAM,
        caption: igCaption,
        hashtags,
        tips: "Optimized for Instagram Reels algorithm with 3 CTAs (Save, Share, Bio Link) and Google Drive video container.",
        videoStreamUrl: mediaUrl,
        metadata: {
          idealMedia: "Reel (9:16) or Carousel",
          firstCommentRecommended: true,
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_CONTAINER" : "DIRECT_URL",
        },
      };
    }

    case Platform.FACEBOOK: {
      const structuredPost = `📢 TRENDING IN ${trending.category.toUpperCase()}\n\n${cleanCaption}\n\n💡 Key takeaways from this shift:\n1. Keeps you ahead of emerging shifts\n2. Streamlines multi-channel execution\n\n👉 Test it out and grab your deal here: ${affiliateLink}\n\nSave this post and tag a friend who needs this!`;
      const hashtags = ["#Reels", "#BusinessGrowth", ...trendingTags];
      return {
        platform: Platform.FACEBOOK,
        caption: structuredPost,
        hashtags,
        tips: "Facebook Reels & Feed format with high dwell-time paragraph spacing and direct preview card link.",
        videoStreamUrl: mediaUrl,
        metadata: {
          hasCTA: true,
          previewCardEnabled: true,
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_CONTAINER" : "DIRECT_URL",
        },
      };
    }

    case Platform.TWITTER: {
      const isThreadNeeded = cleanCaption.length > 200;
      let threadParts: string[] = [];

      if (isThreadNeeded) {
        threadParts = [
          `🧵 1/3 Trending now in tech: ${trending.topic}\n\n${cleanCaption.slice(0, 160)}... ⬇️`,
          `2/3 The core insight:\n\n${cleanCaption.slice(160, 380)}`,
          `3/3 Key Takeaway & Discount:\n\nGet early access here: ${affiliateLink}\n\n• Retweet 1st tweet\n• Follow for more daily! 🚀`,
        ];
      }

      const shortTweet = `${cleanCaption.slice(0, 180)} 👉 ${affiliateLink} ${trendingTags.slice(0, 2).join(" ")}`;
      const hashtags = ["#BuildInPublic", ...trendingTags];

      return {
        platform: Platform.TWITTER,
        caption: isThreadNeeded ? threadParts[0] : shortTweet,
        hashtags,
        tips: isThreadNeeded
          ? "Exceeds 280 characters: Formatted as a high-retention 3-part thread riding current viral topic."
          : "Optimized for high CTR with sharp punchlines and direct affiliate link within 280 chars.",
        videoStreamUrl: mediaUrl,
        metadata: {
          isThread: isThreadNeeded,
          threadParts,
          characterCount: isThreadNeeded ? threadParts[0].length : shortTweet.length,
        },
      };
    }

    case Platform.THREADS: {
      const dialogueText = `${trending.suggestedHook}\n\n${cleanCaption.slice(0, 360)}\n\nTool link: ${affiliateLink}\n\nWhat’s your perspective on this? Let’s chat in the replies 👇`;
      const hashtags = ["#threadscommunity", ...trendingTags];
      return {
        platform: Platform.THREADS,
        caption: dialogueText,
        hashtags,
        tips: "Conversational prompt designed to trigger algorithmic comment chain ranking on Threads.",
        videoStreamUrl: mediaUrl,
        metadata: {
          characterLimit: 500,
          currentLength: dialogueText.length,
        },
      };
    }

    case Platform.PINTEREST: {
      const title = cleanCaption.split(".")[0]?.slice(0, 75) || trending.topic;
      const pinDesc = `${trending.suggestedHook} | ${cleanCaption.slice(0, 300)} | Click to claim your 30% discount today!`;
      const hashtags = ["#Inspiration", ...trendingTags];

      return {
        platform: Platform.PINTEREST,
        caption: pinDesc,
        hashtags,
        tips: "SEO-rich Pin Description with buyer-intent keywords and target destination link.",
        videoStreamUrl: mediaUrl,
        metadata: {
          title,
          boardRecommendation: "Resources & Trends 2026",
          destinationLink: affiliateLink,
          aspectRatio: "2:3 Vertical Graphic (1000x1500)",
        },
      };
    }

    default:
      return {
        platform,
        caption: cleanCaption,
        hashtags: [],
        tips: "Standard format",
        metadata: {},
      };
  }
}
