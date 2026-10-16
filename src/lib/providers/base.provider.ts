import { Platform } from "@prisma/client";
import { DBSocialAccount } from "@/lib/mock-db";
import { decryptToken } from "@/lib/crypto";

export interface SocialPublishPayload {
  title?: string;
  caption: string;
  mediaUrls: string[];
  hashtags?: string[];
  options?: Record<string, any>;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalUrl?: string;
  status: "PUBLISHED" | "PROCESSING" | "FAILED";
  error?: string;
  publishedAt?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn: number;
}

export abstract class BaseSocialProvider {
  abstract readonly platform: Platform;
  abstract readonly name: string;

  /**
   * Helper to retrieve decrypted access token from DBSocialAccount
   */
  protected getDecryptedToken(account: DBSocialAccount): string {
    return decryptToken(account.accessToken);
  }

  /**
   * Helper to retrieve decrypted refresh token from DBSocialAccount
   */
  protected getDecryptedRefreshToken(account: DBSocialAccount): string | null {
    return account.refreshToken ? decryptToken(account.refreshToken) : null;
  }

  /**
   * Main publishing method - dispatches content & media to the platform API
   */
  abstract publish(
    account: DBSocialAccount,
    payload: SocialPublishPayload
  ): Promise<PublishResult>;

  /**
   * Refreshes access token if supported by platform
   */
  abstract refreshToken(
    account: DBSocialAccount
  ): Promise<TokenRefreshResult>;

  /**
   * Optional status check for async video processing (e.g. TikTok video init, IG container)
   */
  async checkPublishStatus?(
    account: DBSocialAccount,
    publishId: string
  ): Promise<PublishResult> {
    return {
      success: true,
      externalPostId: publishId,
      status: "PUBLISHED",
    };
  }

  /**
   * Optional live metrics fetcher
   */
  async fetchPostMetrics?(
    account: DBSocialAccount,
    externalPostId: string
  ): Promise<Record<string, number>> {
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }
}
