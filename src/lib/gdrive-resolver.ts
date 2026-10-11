/**
 * Google Drive Video URL Converter & Validator
 * Converts shareable Google Drive links (e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
 * into high-speed direct streamable/downloadable endpoints for social media API containers
 * (TikTok pull URL, Meta Graph API video_url, YouTube API upload streams).
 */

export interface GoogleDriveFileInfo {
  isGoogleDrive: boolean;
  fileId: string | null;
  directStreamUrl: string;
  previewThumbnailUrl: string;
  originalUrl: string;
  formatNote: string;
}

export function parseGoogleDriveUrl(url: string): GoogleDriveFileInfo {
  if (!url || typeof url !== "string") {
    return {
      isGoogleDrive: false,
      fileId: null,
      directStreamUrl: url || "",
      previewThumbnailUrl: url || "",
      originalUrl: url || "",
      formatNote: "Standard media URL",
    };
  }

  const cleanUrl = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  // Pattern 2: drive.google.com/open?id=FILE_ID
  // Pattern 3: drive.google.com/uc?id=FILE_ID
  const fileIdMatch =
    cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // Direct stream link bypassing web viewer
    const directStreamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    // Fast thumbnail preview for UI mockup
    const previewThumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

    return {
      isGoogleDrive: true,
      fileId,
      directStreamUrl,
      previewThumbnailUrl,
      originalUrl: cleanUrl,
      formatNote: "Converted Google Drive video stream (TikTok / YouTube / Reel API Ready)",
    };
  }

  return {
    isGoogleDrive: false,
    fileId: null,
    directStreamUrl: cleanUrl,
    previewThumbnailUrl: cleanUrl,
    originalUrl: cleanUrl,
    formatNote: "Standard media URL",
  };
}
