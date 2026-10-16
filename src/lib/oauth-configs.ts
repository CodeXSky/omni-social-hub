import { Platform } from "@prisma/client";
import { mockDB } from "@/lib/mock-db";

export interface PlatformOAuthMeta {
  platform: Platform;
  name: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  defaultScopes: string;
  devPortalUrl: string;
  docsUrl: string;
  envClientIdKey: string;
  envClientSecretKey: string;
  instructions: string;
}

export const PLATFORM_OAUTH_META: Record<Platform, PlatformOAuthMeta> = {
  [Platform.TIKTOK]: {
    platform: Platform.TIKTOK,
    name: "TikTok Content Posting v2",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    userInfoUrl: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count",
    defaultScopes: "user.info.basic,video.upload,video.publish",
    devPortalUrl: "https://developers.tiktok.com/apps/",
    docsUrl: "https://developers.tiktok.com/doc/login-kit-web",
    envClientIdKey: "TIKTOK_CLIENT_KEY",
    envClientSecretKey: "TIKTOK_CLIENT_SECRET",
    instructions: "Đăng ký ứng dụng tại TikTok for Developers, kích hoạt Content Posting API & Login Kit, điền Callback URL.",
  },
  [Platform.YOUTUBE]: {
    platform: Platform.YOUTUBE,
    name: "YouTube Data API v3",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    defaultScopes: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    devPortalUrl: "https://console.cloud.google.com/apis/credentials",
    docsUrl: "https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps",
    envClientIdKey: "GOOGLE_CLIENT_ID",
    envClientSecretKey: "GOOGLE_CLIENT_SECRET",
    instructions: "Tạo OAuth 2.0 Client ID (Web Application) tại Google Cloud Console, bật YouTube Data API v3.",
  },
  [Platform.FACEBOOK]: {
    platform: Platform.FACEBOOK,
    name: "Meta Graph API (Facebook Pages & Reels)",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/v19.0/me?fields=id,name,picture",
    defaultScopes: "pages_show_list,pages_read_engagement,pages_manage_posts,public_profile",
    devPortalUrl: "https://developers.facebook.com/apps/",
    docsUrl: "https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/",
    envClientIdKey: "META_APP_ID",
    envClientSecretKey: "META_APP_SECRET",
    instructions: "Tạo App loại Business tại Meta for Developers, thêm sản phẩm Facebook Login & Graph API.",
  },
  [Platform.INSTAGRAM]: {
    platform: Platform.INSTAGRAM,
    name: "Instagram Professional / Content Publishing API",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/v19.0/me?fields=id,name,accounts{instagram_business_account{id,username,name,profile_picture_url,followers_count}}",
    defaultScopes: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
    devPortalUrl: "https://developers.facebook.com/apps/",
    docsUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api",
    envClientIdKey: "META_APP_ID",
    envClientSecretKey: "META_APP_SECRET",
    instructions: "Kết nối Instagram Creator/Business account với Facebook Page, cấp quyền Instagram Content Publish.",
  },
  [Platform.TWITTER]: {
    platform: Platform.TWITTER,
    name: "X API v2 (Twitter)",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userInfoUrl: "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics",
    defaultScopes: "tweet.read tweet.write users.read offline.access",
    devPortalUrl: "https://developer.x.com/en/portal/dashboard",
    docsUrl: "https://developer.x.com/en/docs/authentication/oauth-2-0",
    envClientIdKey: "TWITTER_CLIENT_ID",
    envClientSecretKey: "TWITTER_CLIENT_SECRET",
    instructions: "Tạo App tại X Developer Portal, User authentication settings OAuth 2.0 (Confidential Client), cấp quyền Tweet write.",
  },
  [Platform.THREADS]: {
    platform: Platform.THREADS,
    name: "Meta Threads API",
    authUrl: "https://threads.net/oauth/authorize",
    tokenUrl: "https://graph.threads.net/oauth/access_token",
    userInfoUrl: "https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url",
    defaultScopes: "threads_basic,threads_content_publish",
    devPortalUrl: "https://developers.facebook.com/apps/",
    docsUrl: "https://developers.facebook.com/docs/threads",
    envClientIdKey: "THREADS_APP_ID",
    envClientSecretKey: "THREADS_APP_SECRET",
    instructions: "Thêm Use Cases 'Threads API' trên Meta App Dashboard, cấu hình Redirect URI.",
  },
  [Platform.PINTEREST]: {
    platform: Platform.PINTEREST,
    name: "Pinterest API v5",
    authUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    userInfoUrl: "https://api.pinterest.com/v5/user_account",
    defaultScopes: "boards:read,pins:read,pins:write,user_accounts:read",
    devPortalUrl: "https://developers.pinterest.com/apps/",
    docsUrl: "https://developers.pinterest.com/docs/api/v5/",
    envClientIdKey: "PINTEREST_APP_ID",
    envClientSecretKey: "PINTEREST_APP_SECRET",
    instructions: "Tạo App tại Pinterest Developers, kích hoạt quyền tạo Pins & đọc tài khoản.",
  },
};

/**
 * Get active Client ID and Client Secret, checking SQLite first, then process.env
 */
export function getActiveOAuthCredentials(platform: Platform) {
  const meta = PLATFORM_OAUTH_META[platform];
  const dbConfig = mockDB.getOAuthConfig(platform);

  // If this is Instagram or Threads and no direct config is set, inherit from Facebook (Meta App Suite)
  let fallbackClientId = "";
  let fallbackClientSecret = "";
  let isInherited = false;

  if ((platform === Platform.INSTAGRAM || platform === Platform.THREADS) && !dbConfig?.clientId) {
    const metaFacebookConfig = mockDB.getOAuthConfig(Platform.FACEBOOK);
    if (metaFacebookConfig?.clientId) {
      fallbackClientId = metaFacebookConfig.clientId;
      fallbackClientSecret = metaFacebookConfig.clientSecret;
      isInherited = true;
    } else if (process.env.META_APP_ID) {
      fallbackClientId = process.env.META_APP_ID;
      fallbackClientSecret = process.env.META_APP_SECRET || "";
      isInherited = true;
    }
  }

  const clientId = dbConfig?.clientId || fallbackClientId || process.env[meta?.envClientIdKey] || process.env.META_APP_ID || "";
  const clientSecret = dbConfig?.clientSecret || fallbackClientSecret || process.env[meta?.envClientSecretKey] || process.env.META_APP_SECRET || "";
  const customScopes = dbConfig?.scopes || meta?.defaultScopes || "";

  return {
    isConfigured: Boolean(clientId && clientSecret),
    clientId,
    clientSecret,
    scopes: customScopes,
    hasDbOverride: Boolean(dbConfig?.clientId),
    isInheritedFromMeta: isInherited,
    meta,
  };
}

/**
 * Construct Callback / Redirect URI for a platform
 */
export function getCallbackUri(platform: Platform, baseUrl?: string): string {
  const host = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
  return `${host.replace(/\/$/, "")}/api/auth/${platform.toLowerCase()}/callback`;
}

/**
 * Generate full OAuth authorization consent URL
 */
export function buildAuthorizationUrl(platform: Platform, origin: string): { url: string; state: string } {
  const creds = getActiveOAuthCredentials(platform);
  const redirectUri = getCallbackUri(platform, origin);
  const state = Buffer.from(JSON.stringify({ platform, origin, ts: Date.now() })).toString("base64url");

  const meta = creds.meta;
  const params = new URLSearchParams();

  switch (platform) {
    case Platform.TIKTOK:
      params.set("client_key", creds.clientId);
      params.set("scope", creds.scopes);
      params.set("response_type", "code");
      params.set("redirect_uri", redirectUri);
      params.set("state", state);
      break;

    case Platform.YOUTUBE:
      params.set("client_id", creds.clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", creds.scopes);
      params.set("access_type", "offline");
      params.set("prompt", "consent");
      params.set("state", state);
      break;

    case Platform.FACEBOOK:
    case Platform.INSTAGRAM:
      params.set("client_id", creds.clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", creds.scopes);
      params.set("state", state);
      break;

    case Platform.TWITTER:
      params.set("client_id", creds.clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", creds.scopes);
      params.set("state", state);
      params.set("code_challenge", "challenge"); // PKCE fallback
      params.set("code_challenge_method", "plain");
      break;

    case Platform.THREADS:
      params.set("client_id", creds.clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", creds.scopes);
      params.set("state", state);
      break;

    case Platform.PINTEREST:
      params.set("client_id", creds.clientId);
      params.set("redirect_uri", redirectUri);
      params.set("response_type", "code");
      params.set("scope", creds.scopes);
      params.set("state", state);
      break;
  }

  return {
    url: `${meta.authUrl}?${params.toString()}`,
    state,
  };
}
