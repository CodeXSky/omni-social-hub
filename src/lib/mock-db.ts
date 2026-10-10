import { Platform, PostStatus, VariantStatus } from "@prisma/client";
import { encryptToken } from "./crypto";

export interface DBWorkspace {
  id: string;
  name: string;
  slug: string;
}

export interface DBSocialAccount {
  id: string;
  workspaceId: string;
  platform: Platform;
  accountId: string;
  accountName: string;
  username: string;
  profilePic: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string;
  rateLimitRemaining: number;
  profileMeta: Record<string, any>;
  status: string;
}

export interface DBMasterPost {
  id: string;
  workspaceId: string;
  authorId: string;
  title: string;
  rawCaption: string;
  rawMediaUrls: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  variants: DBPostVariant[];
}

export interface DBPostVariant {
  id: string;
  masterPostId: string;
  socialAccountId: string | null;
  platform: Platform;
  adaptedContent: string;
  mediaUrls: string[];
  platformSpecificPayload: Record<string, any>;
  status: VariantStatus;
  externalPostId: string | null;
  publishedAt: string | null;
  errorLog: string | null;
  socialAccount?: DBSocialAccount | null;
}

// In-Memory Global Store singleton
class MockDatabase {
  private workspace: DBWorkspace = {
    id: "ws-acme-prod-01",
    name: "Acme Media & Co",
    slug: "acme-media",
  };

  private accounts: DBSocialAccount[] = [
    {
      id: "acc-tiktok-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.TIKTOK,
      accountId: "tt_acme_viral",
      accountName: "Acme Daily",
      username: "acmedaily",
      profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_tiktok_token_demo_mode"),
      refreshToken: encryptToken("mock_tiktok_refresh_demo_mode"),
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 95,
      profileMeta: { followers: 124500, verified: true, engagementRate: "5.8%" },
      status: "ACTIVE",
    },
    {
      id: "acc-instagram-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.INSTAGRAM,
      accountId: "ig_acme_official",
      accountName: "Acme Creators",
      username: "acme.official",
      profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_meta_ig_token_demo_mode"),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 980,
      profileMeta: { followers: 48200, verified: true, engagementRate: "6.2%" },
      status: "ACTIVE",
    },
    {
      id: "acc-twitter-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.TWITTER,
      accountId: "tw_acme_news",
      accountName: "Acme Hub",
      username: "AcmeHub",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_x_token_demo_mode"),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 48,
      profileMeta: { followers: 31200, verified: true, engagementRate: "3.4%" },
      status: "ACTIVE",
    },
    {
      id: "acc-threads-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.THREADS,
      accountId: "th_acme_threads",
      accountName: "Acme Threads",
      username: "acme.official",
      profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_threads_token_demo_mode"),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 240,
      profileMeta: { followers: 19800, verified: false, engagementRate: "4.1%" },
      status: "ACTIVE",
    },
    {
      id: "acc-facebook-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.FACEBOOK,
      accountId: "fb_page_109384",
      accountName: "Acme Global Page",
      username: "AcmeGlobalOfficial",
      profilePic: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_fb_token_demo_mode"),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 990,
      profileMeta: { followers: 89400, pageId: "109384", engagementRate: "2.9%" },
      status: "ACTIVE",
    },
    {
      id: "acc-pinterest-01",
      workspaceId: "ws-acme-prod-01",
      platform: Platform.PINTEREST,
      accountId: "pin_acme_boards",
      accountName: "Acme Design Boards",
      username: "acmedesign",
      profilePic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      accessToken: encryptToken("mock_pin_token_demo_mode"),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rateLimitRemaining: 1000,
      profileMeta: { monthlyViews: 540000, defaultBoardId: "board_tech_trends" },
      status: "ACTIVE",
    },
  ];

  private posts: DBMasterPost[] = [
    {
      id: "post-seed-01",
      workspaceId: "ws-acme-prod-01",
      authorId: "usr-alex-01",
      title: "OmniSocial Hub 2.0 Feature Release",
      rawCaption: "We just rolled out the all-new OmniSocial Hub 2.0 with instant cross-platform AI adaptation! Schedule to TikTok, Instagram, X, Threads, Facebook, and Pinterest in one click.",
      rawMediaUrls: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      ],
      scheduledAt: null,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      status: PostStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      variants: [
        {
          id: "var-01-tt",
          masterPostId: "post-seed-01",
          socialAccountId: "acc-tiktok-01",
          platform: Platform.TIKTOK,
          adaptedContent: "🔥 Stop scrolling if you want to level up:\n\nOmniSocial Hub 2.0 is live! Connect all channels with AI.\n\nDrop your thoughts below 👇 #TechTok #ViralTips",
          mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"],
          platformSpecificPayload: { hook: "🔥 Stop scrolling" },
          status: VariantStatus.PUBLISHED,
          externalPostId: "tt_pub_994210",
          publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          errorLog: null,
        },
        {
          id: "var-01-ig",
          masterPostId: "post-seed-01",
          socialAccountId: "acc-instagram-01",
          platform: Platform.INSTAGRAM,
          adaptedContent: "We just rolled out OmniSocial Hub 2.0!\n.\n.\nDouble tap if this resonated! ❤️\nSave for later 📌\n#InstagramGrowth #CreatorHustle",
          mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"],
          platformSpecificPayload: {},
          status: VariantStatus.PUBLISHED,
          externalPostId: "ig_pub_488219",
          publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          errorLog: null,
        },
        {
          id: "var-01-tw",
          masterPostId: "post-seed-01",
          socialAccountId: "acc-twitter-01",
          platform: Platform.TWITTER,
          adaptedContent: "OmniSocial Hub 2.0 is live! Connect all channels with AI. #BuildInPublic #TechNews",
          mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"],
          platformSpecificPayload: {},
          status: VariantStatus.PUBLISHED,
          externalPostId: "tw_pub_1829491",
          publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          errorLog: null,
        },
      ],
    },
    {
      id: "post-seed-02",
      workspaceId: "ws-acme-prod-01",
      authorId: "usr-alex-01",
      title: "Behind The Scenes: Engineering Team",
      rawCaption: "A sneak peek behind how our engineering team crafts zero-latency asynchronous posting pipelines.",
      rawMediaUrls: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      ],
      scheduledAt: new Date(Date.now() + 86400 * 1000 * 2).toISOString(),
      publishedAt: null,
      status: PostStatus.QUEUED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: [
        {
          id: "var-02-th",
          masterPostId: "post-seed-02",
          socialAccountId: "acc-threads-01",
          platform: Platform.THREADS,
          adaptedContent: "A sneak peek behind how our team crafts zero-latency posting. What's your top scaling challenge? 👇",
          mediaUrls: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"],
          platformSpecificPayload: {},
          status: VariantStatus.QUEUED,
          externalPostId: null,
          publishedAt: null,
          errorLog: null,
        },
      ],
    },
  ];

  getWorkspace() {
    return this.workspace;
  }

  getAccounts(): DBSocialAccount[] {
    return [...this.accounts];
  }

  getAccountById(id: string): DBSocialAccount | undefined {
    return this.accounts.find((a) => a.id === id);
  }

  getAccountByPlatform(platform: Platform): DBSocialAccount | undefined {
    return this.accounts.find((a) => a.platform === platform);
  }

  updateAccount(id: string, patch: Partial<DBSocialAccount>) {
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.accounts[idx] = { ...this.accounts[idx], ...patch };
      return this.accounts[idx];
    }
    return null;
  }

  getPosts(): DBMasterPost[] {
    return [...this.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createPost(data: {
    title: string;
    caption: string;
    mediaUrls: string[];
    scheduledAt: string | null;
    publishNow: boolean;
    variants: Array<{
      platform: Platform;
      adaptedContent: string;
      mediaUrls: string[];
      options?: Record<string, any>;
    }>;
  }): DBMasterPost {
    const postId = `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const createdVariants: DBPostVariant[] = data.variants.map((v) => {
      const acc = this.getAccountByPlatform(v.platform);
      return {
        id: `var-${Date.now()}-${v.platform}`,
        masterPostId: postId,
        socialAccountId: acc ? acc.id : null,
        platform: v.platform,
        adaptedContent: v.adaptedContent,
        mediaUrls: v.mediaUrls.length > 0 ? v.mediaUrls : data.mediaUrls,
        platformSpecificPayload: v.options || {},
        status: data.publishNow ? VariantStatus.PUBLISHED : (data.scheduledAt ? VariantStatus.QUEUED : VariantStatus.PENDING),
        externalPostId: data.publishNow ? `sim_${v.platform.toLowerCase()}_${Date.now()}` : null,
        publishedAt: data.publishNow ? nowIso : null,
        errorLog: null,
        socialAccount: acc || null,
      };
    });

    const newPost: DBMasterPost = {
      id: postId,
      workspaceId: this.workspace.id,
      authorId: "usr-alex-01",
      title: data.title || "Untitled Master Post",
      rawCaption: data.caption,
      rawMediaUrls: data.mediaUrls,
      scheduledAt: data.scheduledAt,
      publishedAt: data.publishNow ? nowIso : null,
      status: data.publishNow ? PostStatus.PUBLISHED : (data.scheduledAt ? PostStatus.QUEUED : PostStatus.DRAFT),
      createdAt: nowIso,
      updatedAt: nowIso,
      variants: createdVariants,
    };

    this.posts.unshift(newPost);
    return newPost;
  }

  deletePost(id: string) {
    this.posts = this.posts.filter((p) => p.id !== id);
  }
}

const globalForMock = globalThis as unknown as { mockDB?: MockDatabase };
export const mockDB = globalForMock.mockDB || new MockDatabase();
if (process.env.NODE_ENV !== "production") globalForMock.mockDB = mockDB;
