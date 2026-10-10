import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:5432")) {
      try {
        const posts = await prisma.masterPost.findMany({
          include: {
            variants: {
              include: { socialAccount: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        if (posts.length > 0) {
          return NextResponse.json({ success: true, posts });
        }
      } catch (e) {
        // Fallback
      }
    }

    const posts = mockDB.getPosts();
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: true, posts: mockDB.getPosts() });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    return NextResponse.json({
      success: true,
      masterPostId: newPost.id,
      post: newPost,
      variants: newPost.variants,
    });
  } catch (err: any) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
