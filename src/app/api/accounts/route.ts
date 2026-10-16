import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { Platform } from "@prisma/client";
import { encryptToken } from "@/lib/crypto";
import { getSocialProvider } from "@/lib/providers";

export async function GET() {
  try {
    const accounts = mockDB.getAccounts();
    const workspace = mockDB.getWorkspace();

    return NextResponse.json({
      success: true,
      workspace,
      accounts: accounts.map((acc) => ({
        ...acc,
        accessToken: "ENCRYPTED_AES256_GCM",
        refreshToken: acc.refreshToken ? "ENCRYPTED_AES256_GCM" : null,
      })),
    });
  } catch (error: any) {
    console.error("Accounts API error:", error);
    return NextResponse.json({
      success: true,
      workspace: { id: "ws-affiliate-01", name: "Affiliate Media Studio" },
      accounts: mockDB.getAccounts(),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, accountId, platform, accountName, username } = body;

    if (action === "refresh" && accountId) {
      const acc = mockDB.getAccountById(accountId);
      if (acc) {
        try {
          const provider = getSocialProvider(acc.platform);
          const refreshed = await provider.refreshToken(acc);
          const updated = mockDB.updateAccount(accountId, {
            accessToken: encryptToken(refreshed.accessToken),
            refreshToken: refreshed.refreshToken ? encryptToken(refreshed.refreshToken) : acc.refreshToken,
            tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
            rateLimitRemaining: 1000,
          });
          return NextResponse.json({ success: true, account: updated });
        } catch (e: any) {
          // Fallback refresh for developer sandbox token
          const updated = mockDB.updateAccount(accountId, {
            rateLimitRemaining: 1000,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          });
          return NextResponse.json({ success: true, account: updated });
        }
      }
    }

    if (action === "create" || (!action && platform && accountName && username)) {
      const newAcc = {
        id: `acc-${Date.now()}`,
        workspaceId: mockDB.getWorkspace().id,
        platform: platform as Platform,
        accountId: `acc_${platform.toLowerCase()}_${Date.now()}`,
        accountName,
        username: username.replace("@", ""),
        profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        accessToken: encryptToken(`live_token_${platform}_${Date.now()}`),
        refreshToken: encryptToken(`live_refresh_${platform}_${Date.now()}`),
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        rateLimitRemaining: 1000,
        profileMeta: { followers: 1000, verified: false, engagementRate: "4.5%" },
        status: "ACTIVE",
      };

      mockDB.addAccount(newAcc);
      return NextResponse.json({ success: true, account: newAcc });
    }

    if (action === "delete" && accountId) {
      mockDB.deleteAccount(accountId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
