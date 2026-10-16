import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { PublishingDispatcher } from "@/lib/publishing-dispatcher";

export const dynamic = "force-dynamic";

/**
 * Background Cron Job: Scans and auto-publishes posts when scheduledAt <= now
 */
export async function GET() {
  return await handleScheduledCron();
}

export async function POST() {
  return await handleScheduledCron();
}

async function handleScheduledCron() {
  try {
    const duePosts = mockDB.getDueScheduledPosts();

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled posts due for publishing.",
        processedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const summaries = [];
    for (const post of duePosts) {
      try {
        const summary = await PublishingDispatcher.dispatch(post.id);
        summaries.push(summary);
      } catch (err: any) {
        console.error(`[CronPublisher] Error dispatching scheduled post ${post.id}:`, err);
        summaries.push({
          masterPostId: post.id,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${duePosts.length} scheduled posts.`,
      processedCount: duePosts.length,
      summaries,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CronPublisher] Unexpected cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
