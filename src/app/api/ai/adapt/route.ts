import { NextResponse } from "next/server";
import { adaptContentWithAI } from "@/lib/ai/adapt-engine";
import { Platform } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      masterCaption, 
      targetPlatforms, 
      tone, 
      niche,
      affiliateLink,
      affiliateProductName
    } = body;

    if (!masterCaption) {
      return NextResponse.json({ error: "Master caption is required" }, { status: 400 });
    }

    const platforms = (targetPlatforms && targetPlatforms.length > 0)
      ? targetPlatforms
      : [
          Platform.YOUTUBE,
          Platform.INSTAGRAM,
          Platform.TIKTOK,
          Platform.TWITTER,
          Platform.THREADS,
          Platform.FACEBOOK,
          Platform.PINTEREST,
        ];

    const variants = await adaptContentWithAI({
      masterCaption,
      targetPlatforms: platforms,
      tone,
      nicheOrTopic: niche,
      affiliateLink,
      affiliateProductName,
    });

    return NextResponse.json({ success: true, variants });
  } catch (error: any) {
    console.error("AI Adaptation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI adaptations" }, { status: 500 });
  }
}
