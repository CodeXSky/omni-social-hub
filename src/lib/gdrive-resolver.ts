/**
 * Google Drive Video URL Converter & Robust Stream Resolver
 * Handles all Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - Raw FILE_ID (e.g. 1A2B3C4D5E6F7G8H9I0J)
 *
 * Generates:
 * 1. directStreamUrl: Direct raw download link for official social API pull workers (TikTok v2, Meta Graph, YouTube)
 * 2. previewThumbnailUrl: High-res image thumbnail for mockups and device live preview
 * 3. embedVideoUrl: Google Drive video preview player for native iframe preview
 */

export interface GoogleDriveFileInfo {
  isGoogleDrive: boolean;
  fileId: string | null;
  directStreamUrl: string;
  previewThumbnailUrl: string;
  embedVideoUrl: string;
  originalUrl: string;
  formatNote: string;
}

export function parseGoogleDriveUrl(url: string): GoogleDriveFileInfo {
  if (!url || typeof url !== "string") {
    return {
      isGoogleDrive: false,
      fileId: null,
      directStreamUrl: "",
      previewThumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      embedVideoUrl: "",
      originalUrl: "",
      formatNote: "Empty URL",
    };
  }

  const cleanUrl = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  // Pattern 2: drive.google.com/open?id=FILE_ID
  // Pattern 3: drive.google.com/uc?id=FILE_ID
  // Pattern 4: Raw file ID if length >= 20 and alphanumeric
  const matchFileD = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const matchIdParam = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const isRawId = !cleanUrl.includes("/") && cleanUrl.length >= 20;

  const fileId = matchFileD?.[1] || matchIdParam?.[1] || (isRawId ? cleanUrl : null);

  if (fileId) {
    const directStreamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const previewThumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    const embedVideoUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return {
      isGoogleDrive: true,
      fileId,
      directStreamUrl,
      previewThumbnailUrl,
      embedVideoUrl,
      originalUrl: cleanUrl,
      formatNote: "Google Drive Video Validated (Direct Stream & Preview Ready)",
    };
  }

  // Not a Google Drive URL, return original media URL
  return {
    isGoogleDrive: false,
    fileId: null,
    directStreamUrl: cleanUrl,
    previewThumbnailUrl: cleanUrl,
    embedVideoUrl: cleanUrl,
    originalUrl: cleanUrl,
    formatNote: "Direct media URL",
  };
}
