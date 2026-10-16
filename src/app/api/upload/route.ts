import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * GET /api/upload - Retrieve all uploaded media assets (Media Library)
 */
export async function GET() {
  try {
    ensureUploadDir();
    const files = fs.readdirSync(UPLOAD_DIR);

    const mediaList = files
      .map((fileName) => {
        const filePath = path.join(UPLOAD_DIR, fileName);
        const stats = fs.statSync(filePath);
        const ext = path.extname(fileName).toLowerCase();
        const isVideo = [".mp4", ".mov", ".webm", ".mkv"].includes(ext);
        const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);

        return {
          fileName,
          url: `/uploads/${fileName}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          isVideo,
          isImage,
          ext,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      media: mediaList,
      count: mediaList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/upload - Handles direct file upload from computer (images/videos)
 */
export async function POST(req: Request) {
  try {
    ensureUploadDir();
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy file nào để upload." }, { status: 400 });
    }

    const uploadedResults = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename and make unique
      const rawExt = path.extname(file.name) || ".mp4";
      const cleanName = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueFileName = `${cleanName}_${Date.now()}${rawExt}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const isVideo = [".mp4", ".mov", ".webm", ".mkv"].includes(rawExt.toLowerCase());
      const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(rawExt.toLowerCase());

      uploadedResults.push({
        originalName: file.name,
        fileName: uniqueFileName,
        url: `/uploads/${uniqueFileName}`,
        size: file.size,
        mimeType: file.type,
        isVideo,
        isImage,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
      count: uploadedResults.length,
      primaryUrl: uploadedResults[0]?.url,
    });
  } catch (err: any) {
    console.error("Upload file error:", err);
    return NextResponse.json({ error: err.message || "Lỗi khi lưu file." }, { status: 500 });
  }
}
