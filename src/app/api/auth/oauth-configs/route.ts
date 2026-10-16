import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { mockDB } from "@/lib/mock-db";
import { 
  PLATFORM_OAUTH_META, 
  getActiveOAuthCredentials, 
  getCallbackUri 
} from "@/lib/oauth-configs";

export async function GET(req: Request) {
  try {
    const { origin } = new URL(req.url);
    const platforms = Object.values(Platform);

    const configs = platforms.map((p) => {
      const creds = getActiveOAuthCredentials(p);
      const meta = PLATFORM_OAUTH_META[p];
      const callbackUri = getCallbackUri(p, origin);

      // Mask client secret if present
      const maskedSecret = creds.clientSecret 
        ? `${creds.clientSecret.slice(0, 3)}••••••••${creds.clientSecret.slice(-4)}`
        : "";

      return {
        platform: p,
        name: meta.name,
        isConfigured: creds.isConfigured,
        isInheritedFromMeta: creds.isInheritedFromMeta,
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        maskedSecret,
        scopes: creds.scopes,
        callbackUri,
        devPortalUrl: meta.devPortalUrl,
        docsUrl: meta.docsUrl,
        instructions: meta.instructions,
        hasDbOverride: creds.hasDbOverride,
      };
    });

    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, platform, clientId, clientSecret, scopes, syncMetaAll } = body;

    if (!platform || !Object.values(Platform).includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    if (action === "delete") {
      mockDB.deleteOAuthConfig(platform as Platform);
      if (syncMetaAll && (platform === Platform.FACEBOOK || platform === Platform.INSTAGRAM || platform === Platform.THREADS)) {
        mockDB.deleteOAuthConfig(Platform.FACEBOOK);
        mockDB.deleteOAuthConfig(Platform.INSTAGRAM);
        mockDB.deleteOAuthConfig(Platform.THREADS);
      }
      return NextResponse.json({ success: true, message: `Deleted config for ${platform}` });
    }

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const cleanClientId = clientId.trim();
    const cleanClientSecret = (clientSecret || "").trim();

    mockDB.saveOAuthConfig({
      platform: platform as Platform,
      clientId: cleanClientId,
      clientSecret: cleanClientSecret,
      scopes: scopes || PLATFORM_OAUTH_META[platform as Platform]?.defaultScopes,
    });

    // If user asked to sync across Meta ecosystem (or configuring Facebook by default with syncMetaAll)
    if (syncMetaAll || platform === Platform.FACEBOOK) {
      mockDB.saveOAuthConfig({
        platform: Platform.INSTAGRAM,
        clientId: cleanClientId,
        clientSecret: cleanClientSecret,
        scopes: PLATFORM_OAUTH_META[Platform.INSTAGRAM]?.defaultScopes,
      });
      mockDB.saveOAuthConfig({
        platform: Platform.THREADS,
        clientId: cleanClientId,
        clientSecret: cleanClientSecret,
        scopes: PLATFORM_OAUTH_META[Platform.THREADS]?.defaultScopes,
      });
    }

    return NextResponse.json({
      success: true,
      message: (syncMetaAll || platform === Platform.FACEBOOK)
        ? `Đã lưu và đồng bộ App ID cho cả bộ 3 Meta: Facebook, Instagram & Threads!`
        : `Saved OAuth credentials for ${PLATFORM_OAUTH_META[platform as Platform]?.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
