import { Platform } from "@prisma/client";

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  error?: string;
  responsePayload?: Record<string, any>;
  publishedUrl?: string;
}

export interface PublishPayload {
  caption: string;
  mediaUrls: string[];
  options?: {
    hashtags?: string[];
    boardId?: string;       // Pinterest
    linkUrl?: string;       // Pinterest / Facebook
    threadParts?: string[]; // Twitter
    firstComment?: string;  // Instagram / Facebook
    privacyLevel?: string;  // TikTok
    soundTitle?: string;    // TikTok
    title?: string;         // Pinterest Pin Title / FB Video Title
  };
}

export interface AccountTokenProfile {
  id: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string | null;
  profileMeta?: Record<string, any> | null;
}

export interface ISocialPlatformConnector {
  readonly platform: Platform;
  
  /**
   * Validate if access token is still active and within rate limits
   */
  validateToken(account: AccountTokenProfile): Promise<{ valid: boolean; expiresSoon: boolean; quotaRemaining?: number; details?: any }>;

  /**
   * Refresh OAuth token if expired
   */
  refreshToken(account: AccountTokenProfile): Promise<{ accessToken: string; refreshToken?: string; expiresInSeconds?: number }>;

  /**
   * Publish content to the official platform API
   */
  publish(account: AccountTokenProfile, payload: PublishPayload): Promise<PublishResult>;

  /**
   * Fetch current engagement metrics for a post
   */
  fetchMetrics(account: AccountTokenProfile, externalPostId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
  }>;
}
