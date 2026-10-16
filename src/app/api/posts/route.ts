import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { PublishingDispatcher } from "@/lib/publishing-dispatcher";
import { PostStatus, VariantStatus } from "@prisma/client";

export async function GET() {
  try {
    const posts = mockDB.getPosts();
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: true, posts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Retry a single failed variant
    if (body.action === "retry_variant" && body.variantId) {
      const retryRes = await PublishingDispatcher.retryVariant(body.variantId);
      return NextResponse.json({
        success: true,
        variant: retryRes.variant,
        result: retryRes.result,
        post: retryRes.masterPost,
      });
    }

    // 2. Retry all failed variants for a post
    if (body.action === "retry_failed_variants" && body.postId) {
      const dispatchSummary = await PublishingDispatcher.retryFailedVariants(body.postId);
      const post = mockDB.getPostById(body.postId);
      return NextResponse.json({
        success: true,
        masterPostId: body.postId,
        post,
        dispatchSummary,
      });
    }

    // 3. Sync live metrics from social APIs
    if (body.action === "sync_metrics") {
      const syncRes = await PublishingDispatcher.syncMetrics({
        masterPostId: body.postId,
        variantId: body.variantId,
      });
      return NextResponse.json({
        success: true,
        updatedCount: syncRes.updatedCount,
        posts: mockDB.getPosts(),
      });
    }

    // 4. Publish existing draft/queued post
    if (body.action === "publish" && body.postId) {
      const dispatchSummary = await PublishingDispatcher.dispatch(body.postId);
      const post = mockDB.getPostById(body.postId);
      return NextResponse.json({
        success: true,
        masterPostId: body.postId,
        post,
        dispatchSummary,
      });
    }

    // 5. Reschedule an existing post (Calendar Drag & Drop)
    if (body.action === "reschedule" && body.postId && body.scheduledAt) {
      const updated = mockDB.updatePost(body.postId, {
        scheduledAt: body.scheduledAt,
        status: PostStatus.QUEUED,
      });
      if (updated) {
        for (const v of updated.variants) {
          if (v.status !== VariantStatus.PUBLISHED) {
            mockDB.updateVariant(v.id, { status: VariantStatus.QUEUED });
          }
        }
      }
      return NextResponse.json({ success: true, post: updated });
    }

    // 5. Create new post
    const {
      title,
      caption,
      mediaUrls = [],
      scheduledAt,
      publishNow = false,
      variants = [],
    } = body;

    const newPost = mockDB.createPost({
      title,
      caption,
      mediaUrls,
      scheduledAt,
      publishNow,
      variants,
    });

    let dispatchSummary = null;
    if (publishNow) {
      dispatchSummary = await PublishingDispatcher.dispatch(newPost.id);
    }

    const finalPost = mockDB.getPostById(newPost.id) || newPost;

    return NextResponse.json({
      success: true,
      masterPostId: finalPost.id,
      post: finalPost,
      variants: finalPost.variants,
      dispatchSummary,
    });
  } catch (err: any) {
    console.error("Posts API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      mockDB.deletePost(id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
