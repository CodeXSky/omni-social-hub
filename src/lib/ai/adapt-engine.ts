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

  // Helper to extract product details or highlights from masterCaption & productName
  const getProductHighlights = (name: string, captionText: string) => {
    const lower = `${name} ${captionText}`.toLowerCase();
    if (lower.includes("đèn") || lower.includes("lymax") || lower.includes("bảo vệ mắt") || lower.includes("ánh sáng")) {
      return [
        "Ánh sáng bất đối xứng chiếu thẳng bàn phím, không rọi thẳng mắt chống mỏi mắt hiệu quả.",
        "3 chế độ ánh sáng thông minh (vàng ấm, tự nhiên, trắng sáng) dễ dàng đổi màu.",
        "Tiết kiệm diện tích bàn làm việc, lắp chắc chắn trực tiếp trên viền màn hình máy tính."
      ];
    }
    if (lower.includes("chuột") || lower.includes("công thái học") || lower.includes("logitech") || lower.includes("vertical")) {
      return [
        "Góc cầm 57 độ tự nhiên ôm sát lòng bàn tay, giải phóng áp lực cổ tay.",
        "Phím bấm Silent êm ái, click chống ồn làm việc đêm không sợ phiền ai.",
        "Kết nối Bluetooth mượt mà giữa Laptop và PC."
      ];
    }
    if (lower.includes("bàn phím") || lower.includes("keyboard")) {
      return [
        "Cảm giác gõ đầm tay, nảy đều giúp tăng tốc độ gõ phím.",
        "Kết nối không dây ổn định, thời lượng pin sử dụng bền bỉ.",
        "Thiết kế nhỏ gọn, tinh tế tối ưu cho góc làm việc."
      ];
    }
    // Default highlights for any general tech/product
    return [
      `Thiết kế hiện đại, hoàn thiện tỉ mỉ và độ bền ấn tượng của ${name.slice(0, 30)}.`,
      "Trải nghiệm thực tế mượt mà, tiện lợi hỗ trợ tối đa công việc hàng ngày.",
      "Mức giá cực kỳ hợp lý trong phân khúc, nhiều ưu đãi khi săn sale."
    ];
  };

  const highlights = getProductHighlights(productName, cleanCaption);

  switch (platform) {
    case Platform.YOUTUBE: {
      const hookTitle = isProduct
        ? `🔥 Review ${productName.slice(0, 45)} | Đáng tiền hay phí tiền?`
        : `${trending.suggestedHook.slice(0, 50)} | Full Review`;

      const videoBody = isProduct
        ? `${trending.suggestedHook}\n\n` +
          `👉 Trải nghiệm thực tế em **${productName}** sau một thời gian sử dụng:\n` +
          `- ${highlights[0]}\n` +
          `- ${highlights[1]}\n` +
          `- ${highlights[2]}\n\n` +
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
        ? `${viralHook}\n\nTrải nghiệm thực tế em này cực kỳ ưng: ${highlights[0]} ${highlights[1]}\n\n🛒 Mua ngay tại giỏ hàng đính kèm trong video nhé cả nhà! 👇`
        : `${viralHook}\n\n${cleanCaption.slice(0, 240)}\n\n🛒 Mua ngay tại giỏ hàng đính kèm góc video! 👇`;

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
          `✅ ${highlights[0]}\n` +
          `✅ ${highlights[1]}\n` +
          `✅ ${highlights[2]}\n.\n.` +
          `👉 Link mua chính hãng + mã giảm giá mình để ở Link in Bio nhé! 🛒\n` +
          `❤️ Thả tim nếu bạn cũng mê góc setup công nghệ!\n` +
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
          `Đã tìm ra giải pháp tối ưu cho anh chị em dân văn phòng & setup bàn làm việc: **${productName}**!\n\n` +
          `💡 Trải nghiệm thực tế:\n` +
          `1. ${highlights[0]}\n` +
          `2. ${highlights[1]}\n` +
          `3. ${highlights[2]}\n\n` +
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
        ? `Gợi ý nâng cấp bàn làm việc cho anh em: ${productName.slice(0, 40)}... ${highlights[0].slice(0, 50)} 👉 ${affiliateLink} ${trendingTags.slice(0, 2).join(" ")}`
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
        ? `${trending.suggestedHook}\n\nSau 1 thời gian dùng thử ${productName}, mình nhận ra em này giải quyết đúng vấn đề mình cần: ${highlights[0]}\n\nCó bạn nào trong này cũng đang dùng qua chưa? Chia sẻ cảm nhận với mình bên dưới nhé 👇\n\n(Link mua chính hãng cho ai cần: ${affiliateLink})`
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
        ? `${trending.suggestedHook} Nâng cấp góc làm việc với ${productName}. ${highlights[0]} Click để săn voucher giảm giá độc quyền ngay hôm nay!`
        : `${trending.suggestedHook} | ${cleanCaption.slice(0, 300)} | Click to claim your 30% discount today!`;

      const hashtags = ["#Inspiration", "#DeskSetup", ...trendingTags];

      return {
        platform: Platform.PINTEREST,
        caption: pinDesc,
        hashtags,
        tips: "Từ khóa SEO Pinterest nhắm vào tệp tìm kiếm Desk Setup & Công nghệ, liên kết đích dẫn thẳng về Shopee.",
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
