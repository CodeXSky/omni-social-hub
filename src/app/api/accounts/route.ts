import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";
import { Platform } from "@prisma/client";

// Ensure a default demo workspace and seed accounts exist
export async function GET() {
  try {
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Acme Media & Co",
          slug: "acme-media",
        },
      });
    }

    let accounts = await prisma.socialAccount.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { platform: "asc" },
    });

    if (accounts.length === 0) {
      const defaultAccounts = [
        {
          platform: Platform.INSTAGRAM,
          accountId: "ig_acme_official",
          accountName: "Acme Creators",
          username: "acme.official",
          profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_meta_ig_token_demo_mode"),
          profileMeta: { followers: 48200, verified: true },
          rateLimitRemaining: 980,
        },
        {
          platform: Platform.TIKTOK,
          accountId: "tt_acme_viral",
          accountName: "Acme Daily",
          username: "acmedaily",
          profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_tiktok_token_demo_mode"),
          profileMeta: { followers: 124500, verified: true },
          rateLimitRemaining: 95,
        },
        {
          platform: Platform.TWITTER,
          accountId: "tw_acme_news",
          accountName: "Acme Hub",
          username: "AcmeHub",
          profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_x_token_demo_mode"),
          profileMeta: { followers: 31200, verified: true },
          rateLimitRemaining: 48,
        },
        {
          platform: Platform.THREADS,
          accountId: "th_acme_threads",
          accountName: "Acme Threads",
          username: "acme.official",
          profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_threads_token_demo_mode"),
          profileMeta: { followers: 19800, verified: false },
          rateLimitRemaining: 240,
        },
        {
          platform: Platform.FACEBOOK,
          accountId: "fb_page_109384",
          accountName: "Acme Global Page",
          username: "AcmeGlobalOfficial",
          profilePic: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_fb_token_demo_mode"),
          profileMeta: { followers: 89400, pageId: "109384" },
          rateLimitRemaining: 990,
        },
        {
          platform: Platform.PINTEREST,
          accountId: "pin_acme_boards",
          accountName: "Acme Design Boards",
          username: "acmedesign",
          profilePic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
          accessToken: encryptToken("mock_pin_token_demo_mode"),
          profileMeta: { monthlyViews: 540000, defaultBoardId: "board_tech_trends" },
          rateLimitRemaining: 1000,
        },
      ];

      for (const item of defaultAccounts) {
        await prisma.socialAccount.create({
          data: {
            workspaceId: workspace.id,
            platform: item.platform,
            accountId: item.accountId,
            accountName: item.accountName,
            username: item.username,
            profilePic: item.profilePic,
            accessToken: item.accessToken,
            profileMeta: item.profileMeta,
            rateLimitRemaining: item.rateLimitRemaining,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days ahead
          },
        });
      }

      accounts = await prisma.socialAccount.findMany({
        where: { workspaceId: workspace.id },
      });
    }

    return NextResponse.json({
      success: true,
      workspace,
      accounts: accounts.map((acc) => ({
        ...acc,
        accessToken: "ENCRYPTED_AES256_GCM", // Safe redact
        refreshToken: acc.refreshToken ? "ENCRYPTED_AES256_GCM" : null,
      })),
    });
  } catch (error: any) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
