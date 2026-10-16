import { Platform, PostStatus, VariantStatus } from "@prisma/client";
import { mockDB, DBMasterPost, DBPostVariant, DBSocialAccount } from "./mock-db";
import { getSocialProvider, PublishResult, SocialPublishPayload } from "./providers";
import { encryptToken } from "./crypto";

export interface DispatchSummary {
  masterPostId: string;
  totalVariants: number;
  publishedCount: number;
  failedCount: number;
  postStatus: PostStatus;
  results: Record<string, PublishResult>;
}

export class PublishingDispatcher {
  /**
   * Dispatches a Master Post to all its configured social variants concurrently
   * with full failure isolation per network (BullMQ/Postiz pattern).
   */
  static async dispatch(masterPostId: string): Promise<DispatchSummary> {
    const masterPost = mockDB.getPostById(masterPostId);
    if (!masterPost) {
      throw new Error(`Master Post with ID "${masterPostId}" was not found.`);
    }

    const variants = masterPost.variants;
    if (!variants || variants.length === 0) {
      return {
        masterPostId,
        totalVariants: 0,
        publishedCount: 0,
        failedCount: 0,
        postStatus: masterPost.status,
        results: {},
      };
    }

    // Set post status to QUEUED / PUBLISHING
    mockDB.updatePost(masterPostId, {
      status: PostStatus.QUEUED,
    });

    const results: Record<string, PublishResult> = {};

    // Execute variants concurrently with failure isolation
    await Promise.allSettled(
      variants.map(async (variant) => {
        try {
          const res = await this.publishVariant(masterPost, variant);
          results[variant.platform] = res;
        } catch (err: any) {
          const failureRes: PublishResult = {
            success: false,
            status: "FAILED",
            error: err.message || "Unknown publishing error",
          };
          results[variant.platform] = failureRes;
          mockDB.updateVariant(variant.id, {
            status: VariantStatus.FAILED,
            errorLog: failureRes.error,
          });
        }
      })
    );

    const postStatus = this.recomputeMasterPostStatus(masterPostId);
    const publishedCount = Object.values(results).filter((r) => r.success).length;
    const failedCount = Object.values(results).filter((r) => !r.success).length;

    return {
      masterPostId,
      totalVariants: variants.length,
      publishedCount,
      failedCount,
      postStatus,
      results,
    };
  }

  /**
   * Selective retry for a single variant (e.g., when user connects missing token)
   * without re-uploading to channels that already succeeded!
   */
  static async retryVariant(variantId: string): Promise<{
    variant: DBPostVariant;
    result: PublishResult;
    masterPost: DBMasterPost;
  }> {
    const variant = mockDB.getVariantById(variantId);
    if (!variant) {
      throw new Error(`Post variant "${variantId}" not found.`);
    }

    const masterPost = mockDB.getPostById(variant.masterPostId);
    if (!masterPost) {
      throw new Error(`Master post for variant "${variantId}" not found.`);
    }

    const result = await this.publishVariant(masterPost, variant);
    this.recomputeMasterPostStatus(masterPost.id);

    const updatedVariant = mockDB.getVariantById(variantId)!;
    const updatedPost = mockDB.getPostById(masterPost.id)!;

    return {
      variant: updatedVariant,
      result,
      masterPost: updatedPost,
    };
  }

  /**
   * Retry all failed variants for a given master post
   */
  static async retryFailedVariants(masterPostId: string): Promise<DispatchSummary> {
    const masterPost = mockDB.getPostById(masterPostId);
    if (!masterPost) {
      throw new Error(`Master Post "${masterPostId}" not found.`);
    }

    const failedVariants = masterPost.variants.filter(
      (v) => v.status === VariantStatus.FAILED || v.status === VariantStatus.PENDING
    );

    const results: Record<string, PublishResult> = {};

    await Promise.allSettled(
      failedVariants.map(async (variant) => {
        try {
          const res = await this.publishVariant(masterPost, variant);
          results[variant.platform] = res;
        } catch (err: any) {
          const failureRes: PublishResult = {
            success: false,
            status: "FAILED",
            error: err.message || "Retry failed",
          };
          results[variant.platform] = failureRes;
          mockDB.updateVariant(variant.id, {
            status: VariantStatus.FAILED,
            errorLog: failureRes.error,
          });
        }
      })
    );

    const postStatus = this.recomputeMasterPostStatus(masterPostId);
    const publishedCount = Object.values(results).filter((r) => r.success).length;
    const failedCount = Object.values(results).filter((r) => !r.success).length;

    return {
      masterPostId,
      totalVariants: failedVariants.length,
      publishedCount,
      failedCount,
      postStatus,
      results,
    };
  }

  /**
   * Sync metrics (views, likes, comments, shares) directly from official social APIs
   */
  static async syncMetrics(options?: {
    masterPostId?: string;
    variantId?: string;
  }): Promise<{ updatedCount: number; updatedVariants: DBPostVariant[] }> {
    let variantsToSync: DBPostVariant[] = [];

    if (options?.variantId) {
      const v = mockDB.getVariantById(options.variantId);
      if (v && v.status === VariantStatus.PUBLISHED && v.externalPostId) {
        variantsToSync.push(v);
      }
    } else if (options?.masterPostId) {
      const post = mockDB.getPostById(options.masterPostId);
      if (post) {
        variantsToSync = post.variants.filter(
          (v) => v.status === VariantStatus.PUBLISHED && Boolean(v.externalPostId)
        );
      }
    } else {
      const allRecords = mockDB.getPosts();
      for (const p of allRecords) {
        variantsToSync.push(
          ...p.variants.filter((v) => v.status === VariantStatus.PUBLISHED && Boolean(v.externalPostId))
        );
      }
    }

    const updatedVariants: DBPostVariant[] = [];

    await Promise.allSettled(
      variantsToSync.map(async (v) => {
        try {
          const account = v.socialAccountId
            ? mockDB.getAccountById(v.socialAccountId)
            : mockDB.getAccountByPlatform(v.platform);

          if (!account || !v.externalPostId) return;

          const provider = getSocialProvider(v.platform);
          if (provider.fetchPostMetrics) {
            const metrics = await provider.fetchPostMetrics(account, v.externalPostId);
            const updated = mockDB.updateVariant(v.id, {
              views: metrics.views ?? v.views ?? 0,
              likes: metrics.likes ?? v.likes ?? 0,
              comments: metrics.comments ?? v.comments ?? 0,
              shares: metrics.shares ?? v.shares ?? 0,
            });
            if (updated) updatedVariants.push(updated);
          }
        } catch (e: any) {
          console.warn(`[SyncMetrics] Failed to fetch metrics for variant ${v.id}:`, e.message);
        }
      })
    );

    return {
      updatedCount: updatedVariants.length,
      updatedVariants,
    };
  }

  /**
   * Recalculate MasterPost status based on its children variants
   */
  private static recomputeMasterPostStatus(masterPostId: string): PostStatus {
    const post = mockDB.getPostById(masterPostId);
    if (!post) return PostStatus.FAILED;

    const published = post.variants.filter((v) => v.status === VariantStatus.PUBLISHED).length;
    const failed = post.variants.filter((v) => v.status === VariantStatus.FAILED).length;
    const total = post.variants.length;

    let finalStatus: PostStatus = PostStatus.PUBLISHED;
    if (total === 0) {
      finalStatus = PostStatus.DRAFT;
    } else if (published === total) {
      finalStatus = PostStatus.PUBLISHED;
    } else if (published > 0 && failed > 0) {
      finalStatus = PostStatus.PARTIALLY_PUBLISHED;
    } else if (failed === total) {
      finalStatus = PostStatus.FAILED;
    } else {
      finalStatus = PostStatus.QUEUED;
    }

    mockDB.updatePost(masterPostId, {
      status: finalStatus,
      publishedAt: published > 0 ? (post.publishedAt || new Date().toISOString()) : null,
    });

    return finalStatus;
  }

  /**
   * Publishes an individual variant for a specific platform
   */
  static async publishVariant(
    masterPost: DBMasterPost,
    variant: DBPostVariant
  ): Promise<PublishResult> {
    // 1. Mark variant as PUBLISHING
    mockDB.updateVariant(variant.id, {
      status: VariantStatus.PUBLISHING,
      errorLog: null,
    });

    // 2. Resolve connected social account
    let account: DBSocialAccount | undefined;
    if (variant.socialAccountId) {
      account = mockDB.getAccountById(variant.socialAccountId);
    }
    if (!account) {
      account = mockDB.getAccountByPlatform(variant.platform);
    }

    if (!account) {
      const err = `Chưa kết nối tài khoản cho kênh ${variant.platform}. Vui lòng liên kết tài khoản tại trang Cài Đặt.`;
      mockDB.updateVariant(variant.id, {
        status: VariantStatus.FAILED,
        errorLog: err,
      });
      return { success: false, status: "FAILED", error: err };
    }

    // 3. Obtain provider instance
    let provider;
    try {
      provider = getSocialProvider(variant.platform);
    } catch (err: any) {
      const msg = `Provider không khả dụng cho kênh ${variant.platform}: ${err.message}`;
      mockDB.updateVariant(variant.id, {
        status: VariantStatus.FAILED,
        errorLog: msg,
      });
      return { success: false, status: "FAILED", error: msg };
    }

    // 4. Token Freshness Check & Auto-Refresh (rolling refresh strategy)
    if (account.tokenExpiresAt && account.refreshToken) {
      const expiresAt = new Date(account.tokenExpiresAt).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresAt - now < fiveMinutes) {
        try {
          const refreshed = await provider.refreshToken(account);
          if (refreshed.accessToken) {
            const newExpiry = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
            const updatedAccount = mockDB.updateAccount(account.id, {
              accessToken: encryptToken(refreshed.accessToken),
              refreshToken: refreshed.refreshToken
                ? encryptToken(refreshed.refreshToken)
                : account.refreshToken,
              tokenExpiresAt: newExpiry,
            });
            if (updatedAccount) {
              account = updatedAccount;
            }
          }
        } catch (refreshErr: any) {
          console.warn(`[Dispatcher] Auto token refresh failed for ${variant.platform}:`, refreshErr.message);
          if (expiresAt < now) {
            const err = `Phiên đăng nhập ${variant.platform} đã hết hạn. Vui lòng kết nối lại tài khoản.`;
            mockDB.updateVariant(variant.id, {
              status: VariantStatus.FAILED,
              errorLog: err,
            });
            return { success: false, status: "FAILED", error: err };
          }
        }
      }
    }

    // 5. Construct payload
    const mediaUrls = variant.mediaUrls?.length > 0 ? variant.mediaUrls : masterPost.rawMediaUrls;
    const payload: SocialPublishPayload = {
      title: masterPost.title,
      caption: variant.adaptedContent || masterPost.rawCaption || "",
      mediaUrls: mediaUrls || [],
      options: variant.platformSpecificPayload || {},
    };

    // 6. Invoke provider publish
    const publishRes = await provider.publish(account, payload);

    // 7. Update SQLite variant status
    if (publishRes.success) {
      mockDB.updateVariant(variant.id, {
        socialAccountId: account.id,
        status: VariantStatus.PUBLISHED,
        externalPostId: publishRes.externalPostId || null,
        publishedAt: publishRes.publishedAt || new Date().toISOString(),
        errorLog: null,
        views: publishRes.metrics?.views ?? 0,
        likes: publishRes.metrics?.likes ?? 0,
        comments: publishRes.metrics?.comments ?? 0,
        shares: publishRes.metrics?.shares ?? 0,
      });
    } else {
      mockDB.updateVariant(variant.id, {
        socialAccountId: account.id,
        status: VariantStatus.FAILED,
        errorLog: publishRes.error || "Lỗi không xác định khi xuất bản",
      });
    }

    return publishRes;
  }
}
