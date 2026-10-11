import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";

export async function GET() {
  try {
    const posts = mockDB.getPosts();
    const totalPosts = posts.length;
    let totalVariants = 0;
    posts.forEach((p) => (totalVariants += p.variants.length));

    const sumViews = 142800 + totalVariants * 1420;
    const sumReach = 98500 + totalVariants * 920;
    const sumImpressions = 185400 + totalVariants * 1850;
    const sumLikes = 12840 + totalVariants * 135;
    const sumComments = 2190 + totalVariants * 24;
    const sumShares = 1820 + totalVariants * 18;

    const followerGrowth = [
      { date: "Oct 05", tiktok: 119500, instagram: 46700, twitter: 30300, threads: 18500 },
      { date: "Oct 06", tiktok: 121000, instagram: 47100, twitter: 30600, threads: 18900 },
      { date: "Oct 07", tiktok: 122200, instagram: 47400, twitter: 30800, threads: 19100 },
      { date: "Oct 08", tiktok: 123000, instagram: 47700, twitter: 30900, threads: 19300 },
      { date: "Oct 09", tiktok: 123900, instagram: 47900, twitter: 31050, threads: 19550 },
      { date: "Oct 10", tiktok: 124500, instagram: 48200, twitter: 31200, threads: 19800 },
      { date: "Oct 11", tiktok: 125100, instagram: 48450, twitter: 31320, threads: 20100 },
    ];

    const platformDistribution = [
      { platform: "YOUTUBE", share: 38, color: "#ff0000" },
      { platform: "TIKTOK", share: 28, color: "#00f2fe" },
      { platform: "INSTAGRAM", share: 16, color: "#e1306c" },
      { platform: "FACEBOOK", share: 8, color: "#1877f2" },
      { platform: "TWITTER", share: 6, color: "#1d9bf0" },
      { platform: "THREADS", share: 3, color: "#ffffff" },
      { platform: "PINTEREST", share: 1, color: "#e60023" },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts: totalPosts || 28,
        totalVariants: totalVariants || 142,
        totals: {
          views: sumViews,
          reach: sumReach,
          impressions: sumImpressions,
          likes: sumLikes,
          comments: sumComments,
          shares: sumShares,
        },
        avgEngagementRate: "4.86%",
        growthRate: "+14.2% MoM",
      },
      followerGrowth,
      platformDistribution,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
