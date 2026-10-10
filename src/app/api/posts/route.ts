import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enqueueOrExecutePublish } from "@/lib/queue/publisher.queue";
import { PostStatus, VariantStatus, Platform } from "@prisma/client";

// GET recent Master Posts and their Variants
export async function GET() {
  try {
    const posts = await prisma.masterPost.findMany({
      include: {
        variants: {
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create a Master Post and platform variants (with immediate or scheduled publish)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      caption,
      mediaUrls = [],
      scheduledAt,
      publishNow = false,
      variants = [], // array of { platform, adaptedContent, mediaUrls, options }
    } = body;

    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Acme Media", slug: "acme-media" },
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "creator@acme.com", name: "Alex Director" },
      });
    }

    // Accounts lookup map
    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId: workspace.id },
    });
    const accountByPlatform = new Map<Platform, string>();
    accounts.forEach((acc) => accountByPlatform.set(acc.platform, acc.id));

    // 1. Create Master Post
    const masterPost = await prisma.masterPost.create({
      data: {
        workspaceId: workspace.id,
        authorId: user.id,
        title: title || "Untitled Master Post",
        rawCaption: caption,
        rawMediaUrls: mediaUrls,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: publishNow ? PostStatus.QUEUED : (scheduledAt ? PostStatus.QUEUED : PostStatus.DRAFT),
      },
    });

    // 2. Create Platform Variants
    const createdVariants = [];
    for (const v of variants) {
      const socialAccountId = accountByPlatform.get(v.platform as Platform);
      const variantRecord = await prisma.postVariant.create({
        data: {
          masterPostId: masterPost.id,
          socialAccountId: socialAccountId || null,
          platform: v.platform as Platform,
          adaptedContent: v.adaptedContent || caption,
          mediaUrls: v.mediaUrls?.length ? v.mediaUrls : mediaUrls,
          platformSpecificPayload: v.options || {},
          status: publishNow ? VariantStatus.QUEUED : VariantStatus.PENDING,
        },
      });
      createdVariants.push(variantRecord);

      // If publishNow is triggered, dispatch to queue/worker
      if (publishNow) {
        enqueueOrExecutePublish(variantRecord.id, masterPost.id).catch((err) => {
          console.error(`Failed to publish variant ${variantRecord.id}:`, err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      masterPostId: masterPost.id,
      post: masterPost,
      variants: createdVariants,
    });
  } catch (err: any) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
