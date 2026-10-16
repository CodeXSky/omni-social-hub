"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  Plus, 
  Loader2, 
  CheckCircle, 
  FolderOpen, 
  X, 
  ExternalLink,
  Play,
  Layers,
  Sparkles
} from "lucide-react";

interface MediaItem {
  fileName: string;
  url: string;
  size: number;
  createdAt: string;
  isVideo: boolean;
  isImage: boolean;
  ext: string;
}

interface MediaUploaderProps {
  mediaUrls: string[];
  onAddMedia: (url: string) => void;
  onRemoveMedia: (index: number) => void;
}

export function MediaUploader({
  mediaUrls,
  onAddMedia,
  onRemoveMedia,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Library Items from /api/upload
  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      if (data.media) {
        setLibraryItems(data.media);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleOpenLibrary = () => {
    setShowLibrary(true);
    fetchLibrary();
  };

  // Upload Files to /api/upload
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.files) {
        data.files.forEach((f: any) => {
          onAddMedia(f.url);
        });
      } else {
        setUploadError(data.error || "Lỗi upload file.");
      }
    } catch (err: any) {
      setUploadError("Lỗi kết nối upload: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and Drop Event Handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onAddMedia(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
        }}
      />

      {/* Drag & Drop Upload Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 relative ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
            : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900/50"
        }`}
      >
        {isUploading ? (
          <div className="py-4 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-xs text-zinc-300 font-medium">Đang tải media lên server...</span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-200">
                Kéo thả Video / Ảnh từ máy tính vào đây
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Hỗ trợ MP4, MOV, PNG, JPG (Tối ưu cho TikTok, Reels, Shorts)
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 transition-colors"
              >
                Chọn từ máy
              </button>
              <span className="text-zinc-600 text-[10px]">•</span>
              <button
                type="button"
                onClick={handleOpenLibrary}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Thư viện Media</span>
              </button>
            </div>
          </>
        )}
      </div>

      {uploadError && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-2 rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Fallback Direct URL Input */}
      <form onSubmit={handleAddUrl} className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Hoặc dán URL media công khai / link ảnh..."
          className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!urlInput.trim()}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 transition-colors"
        >
          Thêm link
        </button>
      </form>

      {/* Attached Media Previews Grid */}
      {mediaUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Media đã đính kèm ({mediaUrls.length})</span>
            <span className="text-[10px] text-zinc-500 font-mono">Được gán vào các kênh</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mediaUrls.map((url, idx) => {
              const isVideo = url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".webm") || url.includes("video");

              return (
                <div
                  key={idx}
                  className="aspect-[9/12] rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative group"
                >
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="media" className="w-full h-full object-cover" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white uppercase font-mono">
                        {isVideo ? "VIDEO" : "ẢNH"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveMedia(idx)}
                        className="p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-1 font-mono line-clamp-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span>Xem gốc</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Thư Viện Media Đã Tải Lên</h3>
                  <p className="text-[11px] text-zinc-400">
                    Bấm vào bất kỳ file nào để chèn ngay vào bài đăng đang soạn thảo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {loadingLibrary ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <Layers className="w-8 h-8" />
                  <span className="text-xs">Chưa có file nào trong thư viện upload.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {libraryItems.map((item) => (
                    <div
                      key={item.fileName}
                      onClick={() => {
                        onAddMedia(item.url);
                        setShowLibrary(false);
                      }}
                      className="group cursor-pointer rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-cyan-400 overflow-hidden transition-all hover:scale-[1.02] aspect-[9/12] relative flex flex-col justify-end"
                    >
                      {item.isVideo ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover absolute inset-0"
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      )}

                      <div className="relative z-10 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <div className="text-[10px] text-white font-bold line-clamp-1">
                          {item.fileName}
                        </div>
                        <div className="text-[9px] text-cyan-400 font-mono">
                          {item.isVideo ? "Video" : "Ảnh"} • {(item.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowLibrary(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
