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
    affiliateLink = "https://s.shopee.vn/8pmRkckDvo",
    affiliateProductName,
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

  // Fetch real-time trending insight matching product or topic
  const trending = getTrendingContext(nicheOrTopic, affiliateProductName || masterCaption);

  const results: Partial<Record<Platform, AdaptationResult>> = {};

  for (const platform of targetPlatforms) {
    results[platform] = generatePlatformVariant(
      platform, 
      masterCaption, 
      tone, 
      trending,
      affiliateLink, 
      affiliateProductName || "Sản phẩm ưu đãi",
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
  const trendingTags = trending.hashtags.slice(0, 4);

  // Determine if this is an affiliate product showcase
  const isProduct = affiliateProductName && affiliateProductName !== "OmniSocial Hub Pro";
  const productName = affiliateProductName;

  switch (platform) {
    case Platform.YOUTUBE: {
      const hookTitle = isProduct
        ? `🔥 Review ${productName.slice(0, 45)} | Đáng tiền hay phí tiền?`
        : `${trending.suggestedHook.slice(0, 50)} | Full Review`;

      const videoBody = isProduct
        ? `${trending.suggestedHook}\n\n` +
          `👉 Trải nghiệm thực tế em **${productName}** sau một thời gian sử dụng:\n` +
          `- Cảm giác cầm nắm công thái học ôm sát lòng bàn tay, giảm áp lực cổ tay rõ rệt.\n` +
          `- Phím bấm êm ái, click chống ồn làm việc đêm không sợ phiền ai.\n` +
          `- Kết nối Bluetooth mượt mà giữa Laptop và PC.\n\n` +
          `📌 Link sản phẩm chính hãng & săn voucher độc quyền mình để ở dưới nhé!`
        : `${trending.suggestedHook}\n\n${cleanCaption}`;

      const description = `${videoBody}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎁 LINK MUA SẢN PHẨM / ƯU ĐÃI ĐỘC QUYỀN:\n` +
        `👉 Mua ngay ${productName} (Đang có Flash Sale): ${affiliateLink}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 NỘI DUNG VIDEO / TIMESTAMPS:\n` +
        `0:00 - Mở hộp & Trải nghiệm thực tế\n` +
        `0:40 - Chi tiết thiết kế & Tính năng nổi bật\n` +
        `1:20 - Ưu điểm & Nhược điểm cần lưu ý\n` +
        `2:00 - Hướng dẫn săn voucher giảm giá\n\n` +
        `⚠️ Lưu ý: Video có gắn link tiếp thị liên kết (affiliate). Khi bạn mua qua link, kênh sẽ nhận một phần hoa hồng nhỏ để duy trì sản xuất nội dung hữu ích.\n\n` +
        `#Shorts #YouTubeShorts ${trendingTags.join(" ")} #Affiliate`;

      const hashtags = ["#Shorts", "#YouTubeShorts", ...trendingTags, "#Affiliate"];
      return {
        platform: Platform.YOUTUBE,
        caption: description,
        hashtags,
        tips: `Bắt trend "${trending.topic}". Tối ưu 3 giây đầu cho YouTube Shorts, ghim link Shopee & timestamps mô tả.`,
        videoStreamUrl: mediaUrl,
        metadata: {
          title: hookTitle,
          isShorts: true,
          pinnedComment: `🔥 Link mua ${productName} chính hãng giá ưu đãi nhất ở đây nhé cả nhà: ${affiliateLink} (Nhớ áp mã voucher giảm giá nha!) 👇`,
          affiliateLink,
          aspectRatio: "9:16 Shorts or 16:9 Landscape",
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_STREAM" : "DIRECT_URL",
        },
      };
    }

    case Platform.TIKTOK: {
      const viralHook = isProduct
        ? `🔥 ${trending.suggestedHook} "${productName.slice(0, 35)}..."`
        : trending.suggestedHook;

      const punchy = isProduct
        ? `${viralHook}\n\nAi ngồi máy tính nhiều mà mỏi cổ tay thì cứu tinh đây rồi. Chuột ôm tay 57 độ cực chuẩn, bấm êm ru không tiếng click.\n\n🔗 Link săn sale chính hãng mình ghim ở Bio hoặc Giỏ hàng nha cả nhà! 👇`
        : `${viralHook}\n\n${cleanCaption.slice(0, 240)}\n\n🔗 Link in bio to claim early access & deal! 👇`;

      const hashtags = ["#TikTokMadeMeDoIt", "#TechTok", ...trendingTags, "#FYP"];
      return {
        platform: Platform.TIKTOK,
        caption: `${punchy}\n\n${hashtags.join(" ")}`,
        hashtags,
        tips: `TikTok Trend Center: "${trending.urgency}". Chuẩn video dọc 9:16 kéo từ Google Drive, CTA kêu gọi click bio/giỏ hàng.`,
        videoStreamUrl: mediaUrl,
        metadata: {
          hook: viralHook,
          soundRecommendation: "Trending Beat: Lo-Fi Synth / Work Beats",
          aspectRatio: "9:16 Vertical Video",
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_PULL_URL" : "DIRECT_URL",
        },
      };
    }

    case Platform.INSTAGRAM: {
      const igCaption = isProduct
        ? `${trending.suggestedHook} ✨\n\nNâng cấp góc làm việc với em **${productName}** siêu xịn mịn!\n.\n.` +
          `✅ Cải thiện tư thế cầm tay tự nhiên\n` +
          `✅ Switch êm ái, yên tĩnh tuyệt đối\n` +
          `✅ Màu sắc thẩm mỹ, setup lên bàn cực sang\n.\n.` +
          `👉 Link mua chính hãng + mã giảm giá mình để ở Link in Bio nhé! 🛒\n` +
          `❤️ Thả tim nếu bạn cũng mê góc setup công thái học!\n` +
          `📌 Lưu lại bài viết khi cần săn sale nhé!\n\n` +
          `#InstagramReels #DeskSetup ${trendingTags.join(" ")}`
        : `${trending.suggestedHook}\n\n${cleanCaption}\n.\n.\n👉 Click link in bio to get an exclusive deal! ✨\nDouble tap if this resonated! ❤️\nSave this Reel for later 📌\nShare with a friend! 🚀\n\n#InstagramReels #CreatorEconomy ${trendingTags.join(" ")} #DailyHustle`;

      const hashtags = ["#InstagramReels", "#DeskSetup", ...trendingTags, "#ShopeeHaul"];
      return {
        platform: Platform.INSTAGRAM,
        caption: igCaption,
        hashtags,
        tips: "Định dạng Instagram Reels với 3 nút kêu gọi thuật toán (Save, Share, Click Bio Link).",
        videoStreamUrl: mediaUrl,
        metadata: {
          idealMedia: "Reel (9:16) or Carousel",
          firstCommentRecommended: true,
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_CONTAINER" : "DIRECT_URL",
        },
      };
    }

    case Platform.FACEBOOK: {
      const structuredPost = isProduct
        ? `📢 GÓC REVIEW ĐỒ CÔNG NGHỆ & SETUP BÀN LÀM VIỆC\n\n` +
          `Đã tìm ra giải pháp cho anh chị em dân văn phòng ngồi 8-10 tiếng bị mỏi cổ tay: **${productName}**!\n\n` +
          `💡 Trải nghiệm nhanh:\n` +
          `1. Cầm góc 57 độ tự nhiên, không bị vặn cơ tay như chuột thường.\n` +
          `2. Bấm siêu êm, độ nhạy cao, pin dùng cực lâu.\n` +
          `3. Kết nối Bluetooth nhanh chóng cho cả Windows và Mac.\n\n` +
          `👉 Anh chị em quan tâm có thể săn sale chính hãng tại link này nhé: ${affiliateLink}\n\n` +
          `Lưu bài viết hoặc tag đồng nghiệp cùng cơ quan vào tham khảo nhé cả nhà!`
        : `📢 TRENDING IN ${trending.category.toUpperCase()}\n\n${cleanCaption}\n\n💡 Key takeaways from this shift:\n1. Keeps you ahead of emerging shifts\n2. Streamlines multi-channel execution\n\n👉 Test it out and grab your deal here: ${affiliateLink}\n\nSave this post and tag a friend who needs this!`;

      const hashtags = ["#Reels", "#GocCongNghe", ...trendingTags];
      return {
        platform: Platform.FACEBOOK,
        caption: structuredPost,
        hashtags,
        tips: "Chuẩn bài viết Facebook Reels / Post dài tăng thời gian dừng đọc (dwell-time) kèm link Shopee rõ ràng.",
        videoStreamUrl: mediaUrl,
        metadata: {
          hasCTA: true,
          previewCardEnabled: true,
          sourceType: gdriveInfo?.isGoogleDrive ? "GOOGLE_DRIVE_CONTAINER" : "DIRECT_URL",
        },
      };
    }

    case Platform.TWITTER: {
      const shortTweet = isProduct
        ? `Dân văn phòng mỏi cổ tay nhất định phải đổi qua chuột công thái học: ${productName.slice(0, 40)}... Cầm siêu êm, giảm áp lực tay rõ rệt! 👉 ${affiliateLink} ${trendingTags.slice(0, 2).join(" ")}`
        : `${cleanCaption.slice(0, 180)} 👉 ${affiliateLink} ${trendingTags.slice(0, 2).join(" ")}`;

      const hashtags = ["#TechReview", ...trendingTags];

      return {
        platform: Platform.TWITTER,
        caption: shortTweet,
        hashtags,
        tips: "Tối ưu hóa dưới 280 ký tự, lời gọi hành động súc tích dẫn thẳng vào link affiliate Shopee.",
        videoStreamUrl: mediaUrl,
        metadata: {
          isThread: false,
          characterCount: shortTweet.length,
        },
      };
    }

    case Platform.THREADS: {
      const dialogueText = isProduct
        ? `${trending.suggestedHook}\n\nSau 1 tháng dùng thử ${productName}, mình nhận ra trước giờ cổ tay mình phải chịu khổ quá nhiều. Cầm em này xong không muốn quay lại chuột thường luôn 🥲\n\nCó bạn nào trong này cũng đang dùng chuột dọc không? Chia sẻ cảm nhận với mình bên dưới nhé 👇\n\n(Link mua chính hãng cho ai cần: ${affiliateLink})`
        : `${trending.suggestedHook}\n\n${cleanCaption.slice(0, 360)}\n\nTool link: ${affiliateLink}\n\nWhat’s your perspective on this? Let’s chat in the replies 👇`;

      const hashtags = ["#threadscommunity", ...trendingTags];
      return {
        platform: Platform.THREADS,
        caption: dialogueText,
        hashtags,
        tips: "Giọng văn tâm sự gần gũi kích thích tương tác bình luận tự nhiên của thuật toán Threads.",
        videoStreamUrl: mediaUrl,
        metadata: {
          characterLimit: 500,
          currentLength: dialogueText.length,
        },
      };
    }

    case Platform.PINTEREST: {
      const title = isProduct ? `Gợi Ý Setup Góc Làm Việc: ${productName.slice(0, 50)}` : cleanCaption.split(".")[0]?.slice(0, 75) || trending.topic;
      const pinDesc = isProduct
        ? `${trending.suggestedHook} Nâng cấp góc làm việc công thái học với ${productName}. Thiết kế tối giản, bảo vệ cổ tay. Click để săn voucher giảm giá độc quyền ngay hôm nay!`
        : `${trending.suggestedHook} | ${cleanCaption.slice(0, 300)} | Click to claim your 30% discount today!`;

      const hashtags = ["#Inspiration", "#DeskSetup", ...trendingTags];

      return {
        platform: Platform.PINTEREST,
        caption: pinDesc,
        hashtags,
        tips: "Từ khóa SEO Pinterest nhắm vào tệp tìm kiếm Desk Setup & Công thái học, liên kết đích dẫn thẳng về Shopee.",
        videoStreamUrl: mediaUrl,
        metadata: {
          title,
          boardRecommendation: "Góc Làm Việc & Đồ Công Nghệ 2026",
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
