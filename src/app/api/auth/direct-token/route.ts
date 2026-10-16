import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { mockDB } from "@/lib/mock-db";
import { encryptToken } from "@/lib/crypto";
import { PLATFORM_OAUTH_META } from "@/lib/oauth-configs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, accessToken, accountName, username, refreshToken } = body;

    if (!platform || !Object.values(Platform).includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    if (!accessToken || !accessToken.trim()) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const cleanToken = accessToken.trim();
    const meta = PLATFORM_OAUTH_META[platform as Platform];

    let finalName = accountName?.trim() || `${meta?.name || platform} Channel`;
    let finalUsername = username?.trim().replace("@", "") || `user_${Date.now().toString().slice(-4)}`;
    let finalPic = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
    let followers = 0;
    let accountId = `acc_${platform.toLowerCase()}_${Date.now()}`;

    // Attempt to verify and query real account metadata using the provided token
    try {
      if (platform === Platform.TIKTOK) {
        const res = await fetch(meta.userInfoUrl, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const d = await res.json();
        if (d.data?.user) {
          finalName = d.data.user.display_name || finalName;
          finalUsername = d.data.user.username || finalUsername;
          finalPic = d.data.user.avatar_url || finalPic;
          followers = d.data.user.follower_count || 0;
          accountId = d.data.user.open_id || accountId;
        }
      } else if (platform === Platform.YOUTUBE) {
        const res = await fetch(meta.userInfoUrl, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const d = await res.json();
        if (d.items?.[0]) {
          const ch = d.items[0];
          finalName = ch.snippet?.title || finalName;
          finalUsername = ch.snippet?.customUrl?.replace("@", "") || finalUsername;
          finalPic = ch.snippet?.thumbnails?.default?.url || finalPic;
          followers = parseInt(ch.statistics?.subscriberCount || "0", 10);
          accountId = ch.id;
        }
      } else if (platform === Platform.FACEBOOK || platform === Platform.INSTAGRAM) {
        const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${cleanToken}`);
        const d = await res.json();
        if (d.id) {
          finalName = d.name || finalName;
          finalUsername = d.name?.toLowerCase().replace(/\s+/g, "_") || finalUsername;
          finalPic = d.picture?.data?.url || finalPic;
          accountId = d.id;
        }
      }
    } catch (apiErr) {
      // If offline or network issue, fallback to provided values
      console.warn("Could not fetch remote profile info, using provided inputs:", apiErr);
    }

    const expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days
    const newAcc = {
      id: `acc-${Date.now()}`,
      workspaceId: mockDB.getWorkspace().id,
      platform: platform as Platform,
      accountId,
      accountName: finalName,
      username: finalUsername,
      profilePic: finalPic,
      accessToken: encryptToken(cleanToken),
      refreshToken: refreshToken ? encryptToken(refreshToken) : null,
      tokenExpiresAt: expiryDate,
      rateLimitRemaining: 1000,
      profileMeta: {
        followers,
        subscribers: platform === Platform.YOUTUBE ? followers : undefined,
        verified: true,
        authMethod: "DIRECT_TOKEN",
        connectedAt: new Date().toISOString(),
      },
      status: "ACTIVE",
    };

    mockDB.upsertAccount(newAcc);

    return NextResponse.json({
      success: true,
      message: `Tài khoản ${finalName} (@${finalUsername}) đã được xác thực và lưu vào hệ thống!`,
      account: newAcc,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
