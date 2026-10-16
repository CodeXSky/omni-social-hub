import { Platform } from "@prisma/client";

export interface PlatformRule {
  maxCaptionLength: number;
  maxTitleLength?: number;
  requiresMedia: boolean;
  requiresVideo?: boolean;
  recommendedAspectRatio?: "9:16" | "1:1" | "16:9" | "2:3";
  maxVideoSeconds?: number;
  allowedMediaTypes: Array<"image" | "video">;
  tips: string[];
}

export const PLATFORM_RULES: Record<Platform, PlatformRule> = {
  [Platform.TIKTOK]: {
    maxCaptionLength: 2200,
    requiresMedia: true,
    requiresVideo: true,
    recommendedAspectRatio: "9:16",
    maxVideoSeconds: 600,
    allowedMediaTypes: ["video"],
    tips: [
      "Khuyên dùng video dọc 9:16 (1080x1920) để đạt thuật toán tốt nhất.",
      "Đặt 3-5 hashtag xu hướng ở cuối caption.",
      "Âm thanh nền hoặc giọng đọc thu hút trong 3 giây đầu tiên.",
    ],
  },
  [Platform.YOUTUBE]: {
    maxCaptionLength: 5000,
    maxTitleLength: 100,
    requiresMedia: true,
    requiresVideo: true,
    recommendedAspectRatio: "9:16",
    maxVideoSeconds: 60,
    allowedMediaTypes: ["video"],
    tips: [
      "YouTube Shorts tối ưu dưới 60 giây, tỉ lệ dọc 9:16.",
      "Tiêu đề nên chứa thẻ #Shorts để được đưa vào Shorts Feed.",
    ],
  },
  [Platform.FACEBOOK]: {
    maxCaptionLength: 63206,
    requiresMedia: false,
    allowedMediaTypes: ["image", "video"],
    tips: [
      "Facebook Reels ưu tiên video 9:16 dưới 90 giây.",
      "Kèm link affiliate trong comment đầu tiên để tránh giảm reach.",
    ],
  },
  [Platform.INSTAGRAM]: {
    maxCaptionLength: 2200,
    requiresMedia: true,
    recommendedAspectRatio: "9:16",
    allowedMediaTypes: ["image", "video"],
    tips: [
      "Instagram Reels yêu cầu video dọc 9:16.",
      "Tối đa 30 hashtag; nên dùng 5-8 hashtag chất lượng.",
    ],
  },
  [Platform.TWITTER]: {
    maxCaptionLength: 280,
    requiresMedia: false,
    allowedMediaTypes: ["image", "video"],
    tips: [
      "Giới hạn 280 ký tự cho tài khoản chuẩn.",
      "Đính kèm tối đa 4 ảnh hoặc 1 video (tối đa 140 giây).",
    ],
  },
  [Platform.THREADS]: {
    maxCaptionLength: 500,
    requiresMedia: false,
    allowedMediaTypes: ["image", "video"],
    tips: [
      "Tối đa 500 ký tự cho mỗi Thread.",
      "Hỗ trợ video lên tới 5 phút và ảnh chất lượng cao.",
    ],
  },
  [Platform.PINTEREST]: {
    maxCaptionLength: 500,
    maxTitleLength: 100,
    requiresMedia: true,
    recommendedAspectRatio: "2:3",
    allowedMediaTypes: ["image", "video"],
    tips: [
      "Tỉ lệ chuẩn Idea Pin và Standard Pin là 2:3 (1000x1500).",
      "Tiêu đề cần chứa từ khóa tìm kiếm (SEO Pinterest).",
    ],
  },
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  remainingChars: number;
}

export function validatePlatformPost(
  platform: Platform,
  data: { title?: string; caption: string; mediaUrls: string[] }
): ValidationResult {
  const rule = PLATFORM_RULES[platform];
  const errors: string[] = [];
  const warnings: string[] = [];

  const captionLength = (data.caption || "").length;
  const remainingChars = rule.maxCaptionLength - captionLength;

  if (captionLength > rule.maxCaptionLength) {
    errors.push(
      `Nội dung vượt quá giới hạn ${rule.maxCaptionLength} ký tự của ${platform} (${captionLength}/${rule.maxCaptionLength}).`
    );
  }

  if (rule.maxTitleLength && (data.title || "").length > rule.maxTitleLength) {
    errors.push(
      `Tiêu đề vượt quá giới hạn ${rule.maxTitleLength} ký tự (${(data.title || "").length}/${rule.maxTitleLength}).`
    );
  }

  const hasMedia = data.mediaUrls && data.mediaUrls.length > 0;

  if (rule.requiresMedia && !hasMedia) {
    errors.push(`Kênh ${platform} bắt buộc phải có ít nhất 1 ảnh hoặc video.`);
  }

  if (rule.requiresVideo && hasMedia) {
    const hasVideo = data.mediaUrls.some(
      (url) =>
        url.endsWith(".mp4") ||
        url.endsWith(".mov") ||
        url.endsWith(".webm") ||
        url.includes("video")
    );
    if (!hasVideo) {
      warnings.push(`Kênh ${platform} ưu tiên định dạng video ngắn (.mp4). File đính kèm có thể bị từ chối.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    remainingChars,
  };
}
