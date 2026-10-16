import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { mockDB } from "@/lib/mock-db";
import { encryptToken } from "@/lib/crypto";
import { 
  getActiveOAuthCredentials, 
  getCallbackUri, 
  PLATFORM_OAUTH_META 
} from "@/lib/oauth-configs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { searchParams, origin } = new URL(req.url);
  const redirectTarget = new URL("/accounts", req.url);

  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase() as Platform;

    if (!Object.values(Platform).includes(platform)) {
      redirectTarget.searchParams.set("error", "invalid_platform");
      return NextResponse.redirect(redirectTarget);
    }

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error") || searchParams.get("error_description");

    if (oauthError) {
      redirectTarget.searchParams.set("error", oauthError);
      redirectTarget.searchParams.set("platform", platform);
      return NextResponse.redirect(redirectTarget);
    }

    if (!code) {
      redirectTarget.searchParams.set("error", "no_code_provided");
      redirectTarget.searchParams.set("platform", platform);
      return NextResponse.redirect(redirectTarget);
    }

    const creds = getActiveOAuthCredentials(platform);
    const meta = PLATFORM_OAUTH_META[platform];
    const redirectUri = getCallbackUri(platform, origin);

    let accessToken = "";
    let refreshToken: string | null = null;
    let tokenExpiresIn = 3600 * 24 * 30; // 30 days default
    let accountId = `acc_${platform.toLowerCase()}_${Date.now()}`;
    let accountName = `${PLATFORM_OAUTH_META[platform]?.name} Channel`;
    let username = `channel_${Date.now().toString().slice(-5)}`;
    let profilePic = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
    let followers = 0;

    // 1. Exchange authorization code for Access & Refresh tokens
    if (platform === Platform.TIKTOK) {
      const tokenRes = await fetch(meta.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: creds.clientId,
          client_secret: creds.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.data?.access_token) {
        accessToken = tokenData.data.access_token;
        refreshToken = tokenData.data.refresh_token || null;
        tokenExpiresIn = tokenData.data.expires_in || tokenExpiresIn;
        accountId = tokenData.data.open_id || accountId;

        // Fetch user info from TikTok
        const userRes = await fetch(meta.userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userRes.json();
        if (userData.data?.user) {
          const u = userData.data.user;
          accountName = u.display_name || accountName;
          username = u.username || u.display_name || username;
          profilePic = u.avatar_url || profilePic;
          followers = u.follower_count || 0;
        }
      } else {
        throw new Error(tokenData.message || tokenData.error_description || "Failed to exchange TikTok code");
      }
    } else if (platform === Platform.YOUTUBE) {
      const tokenRes = await fetch(meta.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token || null;
        tokenExpiresIn = tokenData.expires_in || tokenExpiresIn;

        // Fetch channel info from YouTube Data API
        const userRes = await fetch(meta.userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userRes.json();
        if (userData.items && userData.items.length > 0) {
          const ch = userData.items[0];
          accountId = ch.id;
          accountName = ch.snippet?.title || accountName;
          username = ch.snippet?.customUrl?.replace("@", "") || ch.snippet?.title || username;
          profilePic = ch.snippet?.thumbnails?.default?.url || profilePic;
          followers = parseInt(ch.statistics?.subscriberCount || "0", 10);
        }
      } else {
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Google OAuth code");
      }
    } else if (platform === Platform.FACEBOOK || platform === Platform.INSTAGRAM) {
      const tokenUrlWithParams = `${meta.tokenUrl}?client_id=${creds.clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${creds.clientSecret}&code=${code}`;

      const tokenRes = await fetch(tokenUrlWithParams);
      const tokenData = await tokenRes.json();

      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        tokenExpiresIn = tokenData.expires_in || 3600 * 24 * 60; // 60 days

        // Fetch user profile & managed pages
        const userRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`);
        const userData = await userRes.json();
        if (userData.id) {
          accountId = userData.id;
          accountName = userData.name || accountName;
          username = userData.name?.toLowerCase().replace(/\s+/g, "_") || username;
          profilePic = userData.picture?.data?.url || profilePic;
        }

        // For Instagram, check linked Instagram Business Account
        if (platform === Platform.INSTAGRAM) {
          const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`);
          const pagesData = await pagesRes.json();
          const igAccount = pagesData.data?.find((p: any) => p.instagram_business_account)?.instagram_business_account;
          if (igAccount) {
            accountId = igAccount.id;
            accountName = igAccount.name || igAccount.username;
            username = igAccount.username;
            profilePic = igAccount.profile_picture_url || profilePic;
            followers = igAccount.followers_count || 0;
          }
        }
      } else {
        throw new Error(tokenData.error?.message || "Failed to exchange Meta access token");
      }
    } else if (platform === Platform.TWITTER) {
      const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
      const tokenRes = await fetch(meta.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: "challenge",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token || null;
        tokenExpiresIn = tokenData.expires_in || 7200;

        const userRes = await fetch(meta.userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userRes.json();
        if (userData.data) {
          accountId = userData.data.id;
          accountName = userData.data.name;
          username = userData.data.username;
          profilePic = userData.data.profile_image_url || profilePic;
          followers = userData.data.public_metrics?.followers_count || 0;
        }
      } else {
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Twitter code");
      }
    } else {
      // Generic OAuth 2.0 exchange (Threads, Pinterest)
      const tokenRes = await fetch(meta.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token || null;
      } else {
        throw new Error(tokenData.error_description || tokenData.message || "Failed to exchange OAuth code");
      }
    }

    // 2. Encrypt tokens with AES-256-GCM and persist to SQLite
    const expiryDate = new Date(Date.now() + tokenExpiresIn * 1000).toISOString();
    const newAcc = {
      id: `acc-${Date.now()}`,
      workspaceId: mockDB.getWorkspace().id,
      platform,
      accountId,
      accountName,
      username: username.replace("@", ""),
      profilePic,
      accessToken: encryptToken(accessToken),
      refreshToken: refreshToken ? encryptToken(refreshToken) : null,
      tokenExpiresAt: expiryDate,
      rateLimitRemaining: 1000,
      profileMeta: {
        followers,
        subscribers: platform === Platform.YOUTUBE ? followers : undefined,
        verified: true,
        oauthConnectedAt: new Date().toISOString(),
      },
      status: "ACTIVE",
    };

    mockDB.upsertAccount(newAcc);

    // 3. Redirect back to Accounts Manager with success notification
    redirectTarget.searchParams.set("success", "connected");
    redirectTarget.searchParams.set("platform", platform);
    redirectTarget.searchParams.set("accountName", accountName);
    return NextResponse.redirect(redirectTarget);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    redirectTarget.searchParams.set("error", encodeURIComponent(err.message || "OAuth exchange failed"));
    return NextResponse.redirect(redirectTarget);
  }
}
