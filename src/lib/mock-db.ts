import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Platform, PostStatus, VariantStatus } from "@prisma/client";
import { encryptToken } from "./crypto";

export interface DBWorkspace {
  id: string;
  name: string;
  slug: string;
}

export interface DBOAuthConfig {
  platform: Platform;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scopes?: string;
  isEnabled: boolean;
  updatedAt: string;
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
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  socialAccount?: DBSocialAccount | null;
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

class SQLiteDatabase {
  private db: Database.Database;

  constructor() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, "omnisocial.sqlite");
    this.db = new Database(dbPath);
    // Enable WAL mode for high concurrent throughput & reliability
    this.db.pragma("journal_mode = WAL");

    this.initTables();
    this.seedInitialDataIfEmpty();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS social_accounts (
        id TEXT PRIMARY KEY,
        workspaceId TEXT NOT NULL,
        platform TEXT NOT NULL,
        accountId TEXT NOT NULL,
        accountName TEXT NOT NULL,
        username TEXT NOT NULL,
        profilePic TEXT,
        accessToken TEXT,
        refreshToken TEXT,
        tokenExpiresAt TEXT,
        rateLimitRemaining INTEGER DEFAULT 1000,
        profileMeta TEXT,
        status TEXT DEFAULT 'ACTIVE'
      );

      CREATE TABLE IF NOT EXISTS master_posts (
        id TEXT PRIMARY KEY,
        workspaceId TEXT NOT NULL,
        authorId TEXT NOT NULL,
        title TEXT NOT NULL,
        rawCaption TEXT,
        rawMediaUrls TEXT,
        scheduledAt TEXT,
        publishedAt TEXT,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_variants (
        id TEXT PRIMARY KEY,
        masterPostId TEXT NOT NULL,
        socialAccountId TEXT,
        platform TEXT NOT NULL,
        adaptedContent TEXT,
        mediaUrls TEXT,
        platformSpecificPayload TEXT,
        status TEXT NOT NULL,
        externalPostId TEXT,
        publishedAt TEXT,
        errorLog TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        FOREIGN KEY (masterPostId) REFERENCES master_posts (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS oauth_configs (
        platform TEXT PRIMARY KEY,
        clientId TEXT NOT NULL,
        clientSecret TEXT NOT NULL,
        redirectUri TEXT,
        scopes TEXT,
        isEnabled INTEGER DEFAULT 1,
        updatedAt TEXT
      );
    `);
  }

  private seedInitialDataIfEmpty() {
    const countWorkspaces = this.db.prepare("SELECT count(*) as count FROM workspaces").get() as { count: number };
    if (countWorkspaces.count === 0) {
      this.db.prepare("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)").run(
        "ws-affiliate-01",
        "Affiliate Media Studio",
        "affiliate-media"
      );
    }
  }

  clearAllPosts() {
    this.db.prepare("DELETE FROM post_variants").run();
    this.db.prepare("DELETE FROM master_posts").run();
  }

  getWorkspace(): DBWorkspace {
    const row = this.db.prepare("SELECT * FROM workspaces LIMIT 1").get() as any;
    return row || { id: "ws-affiliate-01", name: "Affiliate Media Studio", slug: "affiliate-media" };
  }

  getAccounts(): DBSocialAccount[] {
    const rows = this.db.prepare("SELECT * FROM social_accounts ORDER BY id ASC").all() as any[];
    return rows.map((r) => ({
      ...r,
      profileMeta: r.profileMeta ? JSON.parse(r.profileMeta) : {},
    }));
  }

  getAccountById(id: string): DBSocialAccount | undefined {
    const row = this.db.prepare("SELECT * FROM social_accounts WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      profileMeta: row.profileMeta ? JSON.parse(row.profileMeta) : {},
    };
  }

  getAccountByPlatform(platform: Platform): DBSocialAccount | undefined {
    const row = this.db.prepare("SELECT * FROM social_accounts WHERE platform = ? LIMIT 1").get(platform) as any;
    if (!row) return undefined;
    return {
      ...row,
      profileMeta: row.profileMeta ? JSON.parse(row.profileMeta) : {},
    };
  }

  addAccount(account: DBSocialAccount) {
    this.db.prepare(`
      INSERT INTO social_accounts (
        id, workspaceId, platform, accountId, accountName, username, profilePic,
        accessToken, refreshToken, tokenExpiresAt, rateLimitRemaining, profileMeta, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      account.id,
      account.workspaceId,
      account.platform,
      account.accountId,
      account.accountName,
      account.username,
      account.profilePic,
      account.accessToken,
      account.refreshToken,
      account.tokenExpiresAt,
      account.rateLimitRemaining,
      JSON.stringify(account.profileMeta || {}),
      account.status
    );
    return account;
  }

  updateAccount(id: string, patch: Partial<DBSocialAccount>) {
    const acc = this.getAccountById(id);
    if (!acc) return null;
    const updated = { ...acc, ...patch };
    this.db.prepare(`
      UPDATE social_accounts SET
        accountName = ?, username = ?, profilePic = ?, accessToken = ?, refreshToken = ?,
        tokenExpiresAt = ?, rateLimitRemaining = ?, profileMeta = ?, status = ?
      WHERE id = ?
    `).run(
      updated.accountName,
      updated.username,
      updated.profilePic,
      updated.accessToken,
      updated.refreshToken,
      updated.tokenExpiresAt,
      updated.rateLimitRemaining,
      JSON.stringify(updated.profileMeta || {}),
      updated.status,
      id
    );
    return updated;
  }

  deleteAccount(id: string) {
    this.db.prepare("DELETE FROM social_accounts WHERE id = ?").run(id);
  }

  upsertAccount(account: DBSocialAccount) {
    const existing = this.db.prepare(
      "SELECT id FROM social_accounts WHERE platform = ? AND (accountId = ? OR username = ?) LIMIT 1"
    ).get(account.platform, account.accountId, account.username) as { id: string } | undefined;

    if (existing) {
      return this.updateAccount(existing.id, account);
    } else {
      return this.addAccount(account);
    }
  }

  getOAuthConfig(platform: Platform): DBOAuthConfig | null {
    const row = this.db.prepare("SELECT * FROM oauth_configs WHERE platform = ?").get(platform) as any;
    if (row) {
      return {
        ...row,
        isEnabled: Boolean(row.isEnabled),
      };
    }
    return null;
  }

  getAllOAuthConfigs(): Record<string, DBOAuthConfig> {
    const rows = this.db.prepare("SELECT * FROM oauth_configs").all() as any[];
    const result: Record<string, DBOAuthConfig> = {};
    for (const r of rows) {
      result[r.platform] = {
        ...r,
        isEnabled: Boolean(r.isEnabled),
      };
    }
    return result;
  }

  saveOAuthConfig(config: { platform: Platform; clientId: string; clientSecret: string; redirectUri?: string; scopes?: string }) {
    this.db.prepare(`
      INSERT INTO oauth_configs (platform, clientId, clientSecret, redirectUri, scopes, isEnabled, updatedAt)
      VALUES (?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(platform) DO UPDATE SET
        clientId = excluded.clientId,
        clientSecret = excluded.clientSecret,
        redirectUri = excluded.redirectUri,
        scopes = excluded.scopes,
        updatedAt = excluded.updatedAt
    `).run(
      config.platform,
      config.clientId,
      config.clientSecret,
      config.redirectUri || null,
      config.scopes || null,
      new Date().toISOString()
    );
  }

  deleteOAuthConfig(platform: Platform) {
    this.db.prepare("DELETE FROM oauth_configs WHERE platform = ?").run(platform);
  }

  getPosts(): DBMasterPost[] {
    const postRows = this.db.prepare("SELECT * FROM master_posts ORDER BY createdAt DESC").all() as any[];
    const variantStmt = this.db.prepare("SELECT * FROM post_variants WHERE masterPostId = ?");

    return postRows.map((p) => {
      const variants = (variantStmt.all(p.id) as any[]).map((v) => ({
        ...v,
        mediaUrls: v.mediaUrls ? JSON.parse(v.mediaUrls) : [],
        platformSpecificPayload: v.platformSpecificPayload ? JSON.parse(v.platformSpecificPayload) : {},
        socialAccount: this.getAccountById(v.socialAccountId) || null,
      }));

      return {
        ...p,
        rawMediaUrls: p.rawMediaUrls ? JSON.parse(p.rawMediaUrls) : [],
        variants,
      };
    });
  }

  getPostById(id: string): DBMasterPost | undefined {
    const postRow = this.db.prepare("SELECT * FROM master_posts WHERE id = ?").get(id) as any;
    if (!postRow) return undefined;

    const variantRows = this.db.prepare("SELECT * FROM post_variants WHERE masterPostId = ?").all(id) as any[];
    const variants = variantRows.map((v) => ({
      ...v,
      mediaUrls: v.mediaUrls ? JSON.parse(v.mediaUrls) : [],
      platformSpecificPayload: v.platformSpecificPayload ? JSON.parse(v.platformSpecificPayload) : {},
      socialAccount: this.getAccountById(v.socialAccountId) || null,
    }));

    return {
      ...postRow,
      rawMediaUrls: postRow.rawMediaUrls ? JSON.parse(postRow.rawMediaUrls) : [],
      variants,
    };
  }

  updatePost(id: string, patch: Partial<DBMasterPost>): DBMasterPost | null {
    const post = this.getPostById(id);
    if (!post) return null;

    const updated = { ...post, ...patch, updatedAt: new Date().toISOString() };
    this.db.prepare(`
      UPDATE master_posts SET
        title = ?, rawCaption = ?, rawMediaUrls = ?, scheduledAt = ?, publishedAt = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updated.title,
      updated.rawCaption,
      JSON.stringify(updated.rawMediaUrls || []),
      updated.scheduledAt || null,
      updated.publishedAt || null,
      updated.status,
      updated.updatedAt,
      id
    );

    return this.getPostById(id) || null;
  }

  getVariantById(id: string): DBPostVariant | undefined {
    const row = this.db.prepare("SELECT * FROM post_variants WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      mediaUrls: row.mediaUrls ? JSON.parse(row.mediaUrls) : [],
      platformSpecificPayload: row.platformSpecificPayload ? JSON.parse(row.platformSpecificPayload) : {},
      socialAccount: this.getAccountById(row.socialAccountId) || null,
    };
  }

  getDueScheduledPosts(): DBMasterPost[] {
    const nowIso = new Date().toISOString();
    const rows = this.db.prepare(`
      SELECT id FROM master_posts 
      WHERE status = 'QUEUED' 
      AND scheduledAt IS NOT NULL 
      AND scheduledAt <= ?
    `).all(nowIso) as { id: string }[];

    return rows.map((r) => this.getPostById(r.id)!).filter(Boolean);
  }

  updateVariant(id: string, patch: Partial<DBPostVariant>): DBPostVariant | null {
    const row = this.db.prepare("SELECT * FROM post_variants WHERE id = ?").get(id) as any;
    if (!row) return null;

    const current: DBPostVariant = {
      ...row,
      mediaUrls: row.mediaUrls ? JSON.parse(row.mediaUrls) : [],
      platformSpecificPayload: row.platformSpecificPayload ? JSON.parse(row.platformSpecificPayload) : {},
    };

    const updated = { ...current, ...patch };

    this.db.prepare(`
      UPDATE post_variants SET
        socialAccountId = ?, adaptedContent = ?, mediaUrls = ?, platformSpecificPayload = ?,
        status = ?, externalPostId = ?, publishedAt = ?, errorLog = ?,
        views = ?, likes = ?, comments = ?, shares = ?
      WHERE id = ?
    `).run(
      updated.socialAccountId || null,
      updated.adaptedContent,
      JSON.stringify(updated.mediaUrls || []),
      JSON.stringify(updated.platformSpecificPayload || {}),
      updated.status,
      updated.externalPostId || null,
      updated.publishedAt || null,
      updated.errorLog || null,
      updated.views ?? 0,
      updated.likes ?? 0,
      updated.comments ?? 0,
      updated.shares ?? 0,
      id
    );

    const reloaded = this.db.prepare("SELECT * FROM post_variants WHERE id = ?").get(id) as any;
    return {
      ...reloaded,
      mediaUrls: reloaded.mediaUrls ? JSON.parse(reloaded.mediaUrls) : [],
      platformSpecificPayload: reloaded.platformSpecificPayload ? JSON.parse(reloaded.platformSpecificPayload) : {},
      socialAccount: this.getAccountById(reloaded.socialAccountId) || null,
    };
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
    const ws = this.getWorkspace();

    const initialStatus = data.publishNow
      ? PostStatus.QUEUED
      : data.scheduledAt
      ? PostStatus.QUEUED
      : PostStatus.DRAFT;

    const insertPost = this.db.prepare(`
      INSERT INTO master_posts (
        id, workspaceId, authorId, title, rawCaption, rawMediaUrls, scheduledAt, publishedAt, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
      postId,
      ws.id,
      "usr-admin-01",
      data.title || "Chiến dịch Mạng Xã Hội",
      data.caption,
      JSON.stringify(data.mediaUrls || []),
      data.scheduledAt,
      null,
      initialStatus,
      nowIso,
      nowIso
    );

    const insertVariant = this.db.prepare(`
      INSERT INTO post_variants (
        id, masterPostId, socialAccountId, platform, adaptedContent, mediaUrls, platformSpecificPayload,
        status, externalPostId, publishedAt, errorLog, views, likes, comments, shares
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdVariants: DBPostVariant[] = data.variants.map((v) => {
      const acc = this.getAccountByPlatform(v.platform);
      const varId = `var-${Date.now()}-${v.platform}`;

      const varStatus = data.publishNow
        ? VariantStatus.PENDING
        : data.scheduledAt
        ? VariantStatus.QUEUED
        : VariantStatus.PENDING;

      insertVariant.run(
        varId,
        postId,
        acc ? acc.id : null,
        v.platform,
        v.adaptedContent,
        JSON.stringify(v.mediaUrls && v.mediaUrls.length > 0 ? v.mediaUrls : data.mediaUrls),
        JSON.stringify(v.options || {}),
        varStatus,
        null,
        null,
        null,
        0, // Real metrics start strictly at 0
        0,
        0,
        0
      );

      return {
        id: varId,
        masterPostId: postId,
        socialAccountId: acc ? acc.id : null,
        platform: v.platform,
        adaptedContent: v.adaptedContent,
        mediaUrls: v.mediaUrls && v.mediaUrls.length > 0 ? v.mediaUrls : data.mediaUrls,
        platformSpecificPayload: v.options || {},
        status: varStatus,
        externalPostId: null,
        publishedAt: null,
        errorLog: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        socialAccount: acc || null,
      };
    });

    return {
      id: postId,
      workspaceId: ws.id,
      authorId: "usr-admin-01",
      title: data.title || "Chiến dịch Mạng Xã Hội",
      rawCaption: data.caption,
      rawMediaUrls: data.mediaUrls,
      scheduledAt: data.scheduledAt,
      publishedAt: null,
      status: initialStatus,
      createdAt: nowIso,
      updatedAt: nowIso,
      variants: createdVariants,
    };
  }

  deletePost(id: string) {
    this.db.prepare("DELETE FROM post_variants WHERE masterPostId = ?").run(id);
    this.db.prepare("DELETE FROM master_posts WHERE id = ?").run(id);
  }

  // Get flat list of all published/queued variant records for the Records tab
  getAllVariantRecords(): Array<{
    id: string;
    masterPostId: string;
    postTitle: string;
    rawCaption: string;
    scheduledAt: string | null;
    createdAt: string;
    platform: Platform;
    accountName: string;
    username: string;
    adaptedContent: string;
    mediaUrl: string;
    allMediaUrls: string[];
    platformSpecificPayload: Record<string, any>;
    status: VariantStatus;
    externalPostId: string | null;
    publishedAt: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    const rows = this.db.prepare(`
      SELECT 
        v.id,
        v.masterPostId,
        p.title as postTitle,
        p.rawCaption,
        p.scheduledAt,
        p.createdAt,
        v.platform,
        COALESCE(a.accountName, 'Mặc định') as accountName,
        COALESCE(a.username, 'omni') as username,
        v.adaptedContent,
        v.mediaUrls,
        v.platformSpecificPayload,
        v.status,
        v.externalPostId,
        v.publishedAt,
        v.errorLog,
        v.views,
        v.likes,
        v.comments,
        v.shares
      FROM post_variants v
      JOIN master_posts p ON v.masterPostId = p.id
      LEFT JOIN social_accounts a ON v.socialAccountId = a.id
      ORDER BY COALESCE(v.publishedAt, p.createdAt) DESC
    `).all() as any[];

    return rows.map((r) => {
      let firstMedia = "";
      let parsedMediaList: string[] = [];
      try {
        const parsed = JSON.parse(r.mediaUrls);
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstMedia = parsed[0];
          parsedMediaList = parsed;
        }
      } catch (e) {}

      let payload: Record<string, any> = {};
      try {
        if (r.platformSpecificPayload) {
          payload = JSON.parse(r.platformSpecificPayload);
        }
      } catch (e) {}

      return {
        id: r.id,
        masterPostId: r.masterPostId,
        postTitle: r.postTitle,
        rawCaption: r.rawCaption || "",
        scheduledAt: r.scheduledAt,
        createdAt: r.createdAt,
        platform: r.platform as Platform,
        accountName: r.accountName,
        username: r.username,
        adaptedContent: r.adaptedContent,
        mediaUrl: firstMedia,
        allMediaUrls: parsedMediaList,
        platformSpecificPayload: payload,
        status: r.status as VariantStatus,
        externalPostId: r.externalPostId,
        publishedAt: r.publishedAt,
        errorLog: r.errorLog || null,
        views: r.views || 0,
        likes: r.likes || 0,
        comments: r.comments || 0,
        shares: r.shares || 0,
      };
    });
  }

  getAnalyticsSummary() {
    const totals = this.db.prepare(`
      SELECT 
        COALESCE(SUM(views), 0) as views,
        COALESCE(SUM(likes), 0) as likes,
        COALESCE(SUM(comments), 0) as comments,
        COALESCE(SUM(shares), 0) as shares
      FROM post_variants
      WHERE status = 'PUBLISHED'
    `).get() as any;

    const totalViews = Number(totals.views || 0);
    const totalLikes = Number(totals.likes || 0);
    const totalComments = Number(totals.comments || 0);
    const totalShares = Number(totals.shares || 0);

    const totalReach = Math.round(totalViews * 0.72);
    const totalImpressions = Math.round(totalViews * 1.35);

    const postCounts = this.db.prepare(`
      SELECT 
        COUNT(*) as totalPosts,
        SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as publishedCount,
        SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) as queuedCount
      FROM master_posts
    `).get() as any;

    const platformGroup = this.db.prepare(`
      SELECT 
        platform,
        COALESCE(SUM(views), 0) as views,
        COUNT(*) as posts
      FROM post_variants
      WHERE status = 'PUBLISHED'
      GROUP BY platform
    `).all() as any[];

    const colors: Record<string, string> = {
      YOUTUBE: "#ef4444",
      TIKTOK: "#06b6d4",
      INSTAGRAM: "#ec4899",
      FACEBOOK: "#2563eb",
      TWITTER: "#38bdf8",
      THREADS: "#a855f7",
      PINTEREST: "#f43f5e",
    };

    const platformDistribution = platformGroup.map((pg) => {
      const v = Number(pg.views || 0);
      const share = totalViews > 0 ? Math.round((v / totalViews) * 100) : 0;
      return {
        platform: pg.platform,
        views: v,
        share,
        color: colors[pg.platform] || "#6b7280",
      };
    }).sort((a, b) => b.share - a.share);

    return {
      totals: {
        views: totalViews,
        reach: totalReach,
        impressions: totalImpressions,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      },
      publishedCount: postCounts.publishedCount || 0,
      queuedCount: postCounts.queuedCount || 0,
      totalPosts: postCounts.totalPosts || 0,
      platformDistribution,
    };
  }
}

const globalForMock = globalThis as unknown as { mockDB?: SQLiteDatabase };
export const mockDB = new SQLiteDatabase();
if (process.env.NODE_ENV !== "production") globalForMock.mockDB = mockDB;
