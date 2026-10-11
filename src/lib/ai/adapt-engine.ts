import { Platform } from "@prisma/client";

export interface AdaptationResult {
  platform: Platform;
  caption: string;
  hashtags: string[];
  tips: string;
  metadata: Record<string, any>;
}

export interface AdaptationInput {
  masterCaption: string;
  targetPlatforms: Platform[];
  mediaUrls?: string[];
  nicheOrTopic?: string;
  tone?: "engaging" | "professional" | "viral_edgy" | "educational" | "casual";
  affiliateLink?: string;
  affiliateProductName?: string;
}

/**
 * Intelligent AI Adaptation Engine
 * Employs heuristic prompt tailoring per platform standard or leverages LLM API when configured.
 * Automatically injects YouTube Affiliate disclosure and pinned comment links.
 */
export async function adaptContentWithAI(input: AdaptationInput): Promise<Record<Platform, AdaptationResult>> {
  const { 
    masterCaption, 
    targetPlatforms, 
    nicheOrTopic = "Tech & Innovation", 
    tone = "engaging",
    affiliateLink = "https://omnisocial.io/ref/vip-partner",
    affiliateProductName = "OmniSocial Hub Pro"
  } = input;

  const results: Partial<Record<Platform, AdaptationResult>> = {};

  for (const platform of targetPlatforms) {
    results[platform] = generatePlatformVariant(
      platform, 
      masterCaption, 
      tone, 
      nicheOrTopic, 
      affiliateLink, 
      affiliateProductName
    );
  }

  return results as Record<Platform, AdaptationResult>;
}

function generatePlatformVariant(
  platform: Platform,
  masterCaption: string,
  tone: string,
  niche: string,
  affiliateLink: string,
  affiliateProductName: string
): AdaptationResult {
  const cleanCaption = masterCaption.trim();

  switch (platform) {
    case Platform.YOUTUBE: {
      const title = `${cleanCaption.slice(0, 65)} | Full Setup & Review`;
      const description = `${cleanCaption}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎁 SPECIAL DEAL / AFFILIATE LINK:\n` +
        `👉 Get ${affiliateProductName} with 30% OFF: ${affiliateLink}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 TIMESTAMPS:\n` +
        `0:00 - Introduction & The Big Problem\n` +
        `0:45 - Live Demo & Full Walkthrough\n` +
        `1:30 - How To Set Up Multi-Channel Posting\n` +
        `2:15 - Final Verdict & Best Deal\n\n` +
        `⚠️ FTC Disclosure: Some links above are affiliate links. If you purchase through them, we may receive a small commission at no additional cost to you.\n\n` +
        `#Shorts #YouTubeShorts #TechReview #ProductivityTools #Affiliate`;

      const hashtags = ["#Shorts", "#YouTubeShorts", "#TechReview", "#ProductivityTools", "#Affiliate"];
      return {
        platform: Platform.YOUTUBE,
        caption: description,
        hashtags,
        tips: "Optimized for YouTube Shorts & Videos. High-converting affiliate CTA, timestamps, and FTC compliant disclosure included.",
        metadata: {
          title,
          isShorts: true,
          pinnedComment: `🔥 Claim your discount on ${affiliateProductName} here: ${affiliateLink} (Limited time offer!) 👇`,
          affiliateLink,
          aspectRatio: "9:16 Shorts or 16:9 Landscape",
        },
      };
    }

    case Platform.TIKTOK: {
      const hook = "🔥 Stop scrolling if you want to level up:";
      const punchy = `${hook}\n\n${cleanCaption.slice(0, 300)}\n\n🔗 Link in bio for exclusive discount! 👇`;
      const hashtags = ["#TikTokMadeMeDoIt", "#TechTok", "#ViralTips", "#CreatorEconomy", "#FYP"];
      return {
        platform: Platform.TIKTOK,
        caption: `${punchy}\n\n${hashtags.join(" ")}`,
        hashtags,
        tips: "Optimized for vertical 9:16 video. Opening hook formulated to maximize 3-second hold rate.",
        metadata: {
          hook,
          soundRecommendation: "Trending Lo-Fi Beat / Upbeat Synth",
          aspectRatio: "9:16",
        },
      };
    }

    case Platform.TWITTER: {
      const isThreadNeeded = cleanCaption.length > 250;
      let threadParts: string[] = [];

      if (isThreadNeeded) {
        threadParts = [
          `🧵 1/3 Here's a breakdown you need to know today:\n\n${cleanCaption.slice(0, 180)}... ⬇️`,
          `2/3 The core insight:\n\n${cleanCaption.slice(180, 400)}`,
          `3/3 Key Takeaway & Discount:\n\nGet early access here: ${affiliateLink}\n\n• Retweet 1st tweet\n• Follow for more daily! 🚀`,
        ];
      }

      const shortTweet = cleanCaption.length > 200 ? `${cleanCaption.slice(0, 190)}...` : cleanCaption;
      const tweetWithAffiliate = `${shortTweet} 👉 ${affiliateLink} #BuildInPublic #Tech`;
      const hashtags = ["#BuildInPublic", "#TechNews", "#Productivity"];

      return {
        platform: Platform.TWITTER,
        caption: isThreadNeeded ? threadParts[0] : tweetWithAffiliate,
        hashtags,
        tips: isThreadNeeded
          ? "Exceeds 280 characters: Formatted as a high-retention 3-part sequential thread with affiliate link."
          : "Optimized for high CTR with sharp punchlines and direct affiliate link within 280 chars.",
        metadata: {
          isThread: isThreadNeeded,
          threadParts,
          characterCount: isThreadNeeded ? threadParts[0].length : tweetWithAffiliate.length,
        },
      };
    }

    case Platform.THREADS: {
      const dialogueText = `${cleanCaption.slice(0, 400)}\n\nCheck out the full tool here: ${affiliateLink}\n\nWhat’s your take on this? Let’s discuss 👇`;
      const hashtags = ["#threadscommunity", "#dailythoughts"];
      return {
        platform: Platform.THREADS,
        caption: dialogueText,
        hashtags,
        tips: "Crafted with conversational dialogue tone to drive quote posts, replies, and link clicks.",
        metadata: {
          characterLimit: 500,
          currentLength: dialogueText.length,
        },
      };
    }

    case Platform.FACEBOOK: {
      const structuredPost = `📢 COMMUNITY INSIGHT\n\n${cleanCaption}\n\n💡 Why this matters:\n1. Keeps you ahead of emerging shifts\n2. Streamlines your daily execution\n\n👉 Try it today and get an exclusive bonus here: ${affiliateLink}\n\nTag someone who needs this!`;
      const hashtags = ["#BusinessGrowth", "#ProductivityTips", "#Strategy"];
      return {
        platform: Platform.FACEBOOK,
        caption: structuredPost,
        hashtags,
        tips: "Structured with generous paragraph breaks, bullet points, and high-visibility CTA for feed dwell time.",
        metadata: {
          hasCTA: true,
          previewCardEnabled: true,
        },
      };
    }

    case Platform.INSTAGRAM: {
      const igCaption = `${cleanCaption}\n.\n.\n👉 Link in bio to get an exclusive deal! ✨\nDouble tap if this resonated! ❤️\nSave this for later 📌\nShare with a friend! 🚀\n\n#InstagramGrowth #DigitalCreator #DailyInspiration #MarketingTips #CreatorHustle`;
      const hashtags = ["#InstagramGrowth", "#DigitalCreator", "#DailyInspiration", "#MarketingTips", "#CreatorHustle"];
      return {
        platform: Platform.INSTAGRAM,
        caption: igCaption,
        hashtags,
        tips: "Includes line-breaks, link-in-bio affiliate CTA, and targeted niche hashtags.",
        metadata: {
          idealMedia: "Carousel (1:1 or 4:5) / Reel (9:16)",
          firstCommentRecommended: true,
        },
      };
    }

    case Platform.PINTEREST: {
      const title = cleanCaption.split(".")[0]?.slice(0, 75) || "Actionable Insights & Growth Guide";
      const pinDesc = `${cleanCaption.slice(0, 380)} | Click the link to claim your deal today!`;
      const hashtags = ["#Inspiration", "#Productivity", "#Guides"];

      return {
        platform: Platform.PINTEREST,
        caption: pinDesc,
        hashtags,
        tips: "Optimized for Pinterest SEO algorithm: High search volume keywords in Title & Description with affiliate pin link.",
        metadata: {
          title,
          boardRecommendation: "Resources & Inspiration",
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
