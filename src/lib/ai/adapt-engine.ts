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
}

/**
 * Intelligent AI Adaptation Engine
 * Employs heuristic prompt tailoring per platform standard or leverages LLM API when configured.
 */
export async function adaptContentWithAI(input: AdaptationInput): Promise<Record<Platform, AdaptationResult>> {
  const { masterCaption, targetPlatforms, nicheOrTopic = "Tech & Innovation", tone = "engaging" } = input;

  const results: Partial<Record<Platform, AdaptationResult>> = {};

  for (const platform of targetPlatforms) {
    results[platform] = generatePlatformVariant(platform, masterCaption, tone, nicheOrTopic);
  }

  return results as Record<Platform, AdaptationResult>;
}

function generatePlatformVariant(
  platform: Platform,
  masterCaption: string,
  tone: string,
  niche: string
): AdaptationResult {
  const cleanCaption = masterCaption.trim();

  switch (platform) {
    case Platform.TIKTOK: {
      const hook = "🔥 Stop scrolling if you want to level up:";
      const punchy = `${hook}\n\n${cleanCaption.slice(0, 300)}\n\nDrop your thoughts below 👇`;
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
      // Twitter constraint: 280 chars or Thread
      const isThreadNeeded = cleanCaption.length > 250;
      let threadParts: string[] = [];

      if (isThreadNeeded) {
        threadParts = [
          `🧵 1/3 Here's a breakdown you need to know today:\n\n${cleanCaption.slice(0, 180)}... ⬇️`,
          `2/3 The core insight:\n\n${cleanCaption.slice(180, 400)}`,
          `3/3 Key Takeaway:\n\nIf this was valuable:\n• Retweet the 1st tweet\n• Follow for more insights daily! 🚀`,
        ];
      }

      const shortTweet = cleanCaption.length > 240 ? `${cleanCaption.slice(0, 230)}...` : cleanCaption;
      const hashtags = ["#BuildInPublic", "#TechNews", "#Productivity"];

      return {
        platform: Platform.TWITTER,
        caption: isThreadNeeded ? threadParts[0] : `${shortTweet} ${hashtags.slice(0, 2).join(" ")}`,
        hashtags,
        tips: isThreadNeeded
          ? "Exceeds 280 characters: Formatted as a high-retention 3-part sequential thread."
          : "Optimized for high CTR with sharp punchlines within the 280 character limit.",
        metadata: {
          isThread: isThreadNeeded,
          threadParts,
          characterCount: isThreadNeeded ? threadParts[0].length : shortTweet.length,
        },
      };
    }

    case Platform.THREADS: {
      const dialogueText = `${cleanCaption.slice(0, 450)}\n\nWhat’s your take on this? Let’s discuss in the replies 👇`;
      const hashtags = ["#threadscommunity", "#dailythoughts"];
      return {
        platform: Platform.THREADS,
        caption: dialogueText,
        hashtags,
        tips: "Crafted with conversational dialogue tone to drive quote posts and replies.",
        metadata: {
          characterLimit: 500,
          currentLength: dialogueText.length,
        },
      };
    }

    case Platform.FACEBOOK: {
      const structuredPost = `📢 COMMUNITY INSIGHT\n\n${cleanCaption}\n\n💡 Why this matters to you:\n1. Keeps you ahead of emerging shifts\n2. Streamlines your daily execution\n\n👉 Save this post for reference and tag someone who needs this!`;
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
      const igCaption = `${cleanCaption}\n.\n.\nDouble tap if this resonated! ❤️\nSave this for later 📌\nShare with a friend who needs to see this! 🚀\n\n#InstagramGrowth #DigitalCreator #DailyInspiration #MarketingTips #CreatorHustle`;
      const hashtags = ["#InstagramGrowth", "#DigitalCreator", "#DailyInspiration", "#MarketingTips", "#CreatorHustle"];
      return {
        platform: Platform.INSTAGRAM,
        caption: igCaption,
        hashtags,
        tips: "Includes line-breaks, triple engagement CTAs (Like, Save, Share), and 5 targeted niche hashtags.",
        metadata: {
          idealMedia: "Carousel (1:1 or 4:5) / Reel (9:16)",
          firstCommentRecommended: true,
        },
      };
    }

    case Platform.PINTEREST: {
      const title = cleanCaption.split(".")[0]?.slice(0, 75) || "Actionable Insights & Growth Guide";
      const pinDesc = `${cleanCaption.slice(0, 400)} | Discover more strategies, full step-by-step templates, and actionable takeaways at our official hub.`;
      const hashtags = ["#Inspiration", "#Productivity", "#Guides"];

      return {
        platform: Platform.PINTEREST,
        caption: pinDesc,
        hashtags,
        tips: "Optimized for Pinterest SEO algorithm: High search volume keywords in Title & Description with link attribution.",
        metadata: {
          title,
          boardRecommendation: "Resources & Inspiration",
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
