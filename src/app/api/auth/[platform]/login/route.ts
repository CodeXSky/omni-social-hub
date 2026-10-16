import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { 
  getActiveOAuthCredentials, 
  buildAuthorizationUrl 
} from "@/lib/oauth-configs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase() as Platform;

    if (!Object.values(Platform).includes(platform)) {
      return NextResponse.json({ error: "Invalid social platform" }, { status: 400 });
    }

    const creds = getActiveOAuthCredentials(platform);
    if (!creds.isConfigured) {
      const redirectUrl = new URL("/accounts", req.url);
      redirectUrl.searchParams.set("error", "missing_oauth_credentials");
      redirectUrl.searchParams.set("platform", platform);
      return NextResponse.redirect(redirectUrl);
    }

    const { origin } = new URL(req.url);
    const { url: authUrl } = buildAuthorizationUrl(platform, origin);

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("OAuth login error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
