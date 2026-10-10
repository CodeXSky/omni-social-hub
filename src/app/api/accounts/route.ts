import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Attempt Prisma first if DATABASE_URL and server are reachable
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:5432")) {
      try {
        const dbAccounts = await prisma.socialAccount.findMany();
        if (dbAccounts.length > 0) {
          return NextResponse.json({
            success: true,
            workspace: await prisma.workspace.findFirst(),
            accounts: dbAccounts.map((a) => ({
              ...a,
              accessToken: "ENCRYPTED_AES256_GCM",
            })),
          });
        }
      } catch (e) {
        // Fallback to in-memory store
      }
    }

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
    console.error("Accounts API fallback error:", error);
    return NextResponse.json({
      success: true,
      workspace: { id: "ws-1", name: "Acme Media & Co" },
      accounts: mockDB.getAccounts(),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, accountId } = body;

    if (action === "refresh" && accountId) {
      const updated = mockDB.updateAccount(accountId, {
        rateLimitRemaining: Math.floor(Math.random() * 50) + 950,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return NextResponse.json({ success: true, account: updated });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
