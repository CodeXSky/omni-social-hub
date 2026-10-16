"use client";

import React, { useEffect, useState } from "react";
import { 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpRight,
  X,
  Copy,
  Check,
  Calendar,
  Radio,
  FileText,
  Video,
  Hash,
  ShoppingBag,
  RotateCw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

interface PostRecord {
  id: string;
  masterPostId: string;
  postTitle: string;
  rawCaption?: string;
  scheduledAt?: string | null;
  createdAt?: string;
  platform: Platform;
  accountName: string;
  username: string;
  adaptedContent: string;
  mediaUrl: string;
  allMediaUrls?: string[];
  platformSpecificPayload?: Record<string, any>;
  status: "PUBLISHED" | "QUEUED" | "PENDING" | "FAILED" | "PUBLISHING";
  externalPostId: string | null;
  publishedAt: string | null;
  errorLog?: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export function PostRecordsView() {
  const [records, setRecords] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Modal State for Record Detail
  const [selectedRecord, setSelectedRecord] = useState<PostRecord | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Sync Live Metrics from Social APIs
  const handleSyncMetrics = async (target?: { masterPostId?: string; variantId?: string }) => {
    setSyncing(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_metrics",
          postId: target?.masterPostId,
          variantId: target?.variantId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Đã đồng bộ số liệu thành công cho ${data.updatedCount || 0} bài đăng!`);
        await loadRecords();
      } else {
        showFeedback("Lỗi khi đồng bộ số liệu: " + (data.error || "Không xác định"));
      }
    } catch (err: any) {
      showFeedback("Lỗi kết nối khi đồng bộ: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Retry a single failed variant
  const handleRetryVariant = async (e: React.MouseEvent, variantId: string) => {
    e.stopPropagation();
    setRetryingId(variantId);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "retry_variant",
          variantId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("Đã gửi yêu cầu xuất bản lại! Trạng thái: " + data.result?.status);
        await loadRecords();
        if (selectedRecord && selectedRecord.id === variantId) {
          setSelectedRecord(data.variant);
        }
      } else {
        showFeedback("Thử lại thất bại: " + (data.error || "Chưa thể kết nối API"));
      }
    } catch (err: any) {
      showFeedback("Lỗi: " + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const getExternalUrl = (record: PostRecord): string | null => {
    if (!record.externalPostId) return null;
    const id = record.externalPostId;
    const user = record.username || "user";
    switch (record.platform) {
      case "YOUTUBE":
        return `https://www.youtube.com/shorts/${id}`;
      case "TIKTOK":
        return `https://www.tiktok.com/@${user}/video/${id}`;
      case "FACEBOOK":
        return `https://www.facebook.com/${id}`;
      case "INSTAGRAM":
        return `https://www.instagram.com/p/${id}/`;
      case "TWITTER":
        return `https://x.com/${user}/status/${id}`;
      case "THREADS":
        return `https://www.threads.net/@${user}/post/${id}`;
      case "PINTEREST":
        return `https://www.pinterest.com/pin/${id}/`;
      default:
        return null;
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.adaptedContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform = platformFilter === "ALL" || r.platform === platformFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-medium">{feedbackMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Database Records (SQLite Engine)
            </span>
            <span className="text-zinc-500 text-xs">• Real-Time Multi-Channel Dispatch</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Post Records & Platform Dispatch Status
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Theo dõi tình trạng xuất bản, đồng bộ số liệu thật và khắc phục lỗi đăng bài theo từng mạng xã hội độc lập.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Live Metrics Button */}
          <button
            onClick={() => handleSyncMetrics()}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-950/40"
          >
            <TrendingUp className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-cyan-400" : ""}`} />
            <span>{syncing ? "Đang đồng bộ views..." : "Đồng bộ số liệu thật"}</span>
          </button>

          {/* Refresh Table Button */}
          <button
            onClick={loadRecords}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Làm mới danh sách</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung, kênh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">Tất cả nền tảng ({records.length})</option>
            {Object.keys(PLATFORM_CONFIGS).map((p) => (
              <option key={p} value={p}>
                {PLATFORM_CONFIGS[p as Platform].name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
            <option value="QUEUED">Hàng chờ (QUEUED)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
            <option value="PUBLISHING">Đang xử lý (PUBLISHING)</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Bài đăng & Nội dung</th>
                <th className="py-3.5 px-4">Nền tảng & Kênh</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thời gian</th>
                <th className="py-3.5 px-4 text-right">Lượt xem & Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="w-8 h-8 text-zinc-600 mb-1" />
                      <p className="text-zinc-400 font-medium">
                        {records.length === 0
                          ? "Chưa có bản ghi bài đăng nào trong hệ thống."
                          : "Không tìm thấy bài đăng nào phù hợp với bộ lọc."}
                      </p>
                      {records.length === 0 && (
                        <p className="text-xs text-zinc-600">
                          Hãy tạo và xuất bản bài viết đầu tiên từ tab Composer Studio!
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const cfg = PLATFORM_CONFIGS[r.platform] || PLATFORM_CONFIGS.TIKTOK;
                  const Icon = cfg.icon;
                  const externalUrl = getExternalUrl(r);

                  return (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRecord(r)}
                      className="hover:bg-cyan-500/[0.04] active:bg-cyan-500/[0.08] cursor-pointer transition-colors group"
                    >
                      {/* Title & Content */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          {r.mediaUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.mediaUrl}
                              alt="media"
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0 border border-zinc-700/50 group-hover:border-cyan-500/50 transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:border-cyan-500/50 transition-colors">
                              <Layers className="w-5 h-5 text-zinc-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-100 line-clamp-1 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                              <span>{r.postTitle}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 shrink-0" />
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                              {r.adaptedContent}
                            </p>
                            {r.errorLog && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-red-400 font-sans line-clamp-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{r.errorLog}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Platform & Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${cfg.badgeBg} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-200">{r.accountName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">@{r.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {r.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã đăng tải</span>
                          </span>
                        ) : r.status === "QUEUED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>Hàng chờ</span>
                          </span>
                        ) : r.status === "PUBLISHING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Đang đẩy API</span>
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                              <AlertCircle className="w-3 h-3" />
                              <span>Thất bại</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Published Time */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-zinc-400 text-[11px] font-mono">
                        {r.publishedAt
                          ? new Date(r.publishedAt).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : r.scheduledAt
                          ? `Hẹn: ${new Date(r.scheduledAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}`
                          : "Chưa lên lịch"}
                      </td>

                      {/* Stats & Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "PUBLISHED" ? (
                            <div className="text-right mr-1">
                              <div className="font-bold text-cyan-400 font-mono text-xs">
                                {(r.views || 0).toLocaleString()} views
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-end gap-1.5">
                                <span>❤️ {r.likes || 0}</span>
                                <span>💬 {r.comments || 0}</span>
                              </div>
                            </div>
                          ) : null}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Retry Button if Failed */}
                            {r.status === "FAILED" && (
                              <button
                                onClick={(e) => handleRetryVariant(e, r.id)}
                                disabled={retryingId === r.id}
                                title="Thử lại xuất bản cho kênh này"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white transition-colors"
                              >
                                <RotateCw className={`w-3.5 h-3.5 ${retryingId === r.id ? "animate-spin" : ""}`} />
                              </button>
                            )}

                            {/* Open External Post Link */}
                            {externalUrl && (
                              <a
                                href={externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở bài viết thật trên mạng xã hội"
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500/20 border border-zinc-700/60 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = PLATFORM_CONFIGS[selectedRecord.platform] || PLATFORM_CONFIGS.TIKTOK;
                  const Icon = cfg.icon;
                  return (
                    <div className={`p-3 rounded-2xl ${cfg.badgeBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {PLATFORM_CONFIGS[selectedRecord.platform]?.name}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400 font-mono">
                      @{selectedRecord.username}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {selectedRecord.postTitle}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner if Failed */}
            {selectedRecord.status === "FAILED" && selectedRecord.errorLog && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Chi tiết lỗi xuất bản từ máy chủ API:</span>
                </div>
                <p className="text-xs text-red-300 font-mono bg-red-950/60 p-2.5 rounded-xl border border-red-900/50">
                  {selectedRecord.errorLog}
                </p>
                <div className="pt-1">
                  <button
                    onClick={(e) => handleRetryVariant(e, selectedRecord.id)}
                    disabled={retryingId === selectedRecord.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${retryingId === selectedRecord.id ? "animate-spin" : ""}`} />
                    <span>Thử xuất bản lại ngay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Performance Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lượt Xem Thật</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {(selectedRecord.views || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Lượt Thích</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {(selectedRecord.likes || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bình Luận</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {(selectedRecord.comments || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chia Sẻ</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {(selectedRecord.shares || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Media Preview & Adapted Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Media Preview */}
              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Media Attached</span>
                </label>
                <div className="w-full aspect-[9/12] rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden relative group">
                  {selectedRecord.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedRecord.mediaUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <Layers className="w-8 h-8" />
                      <span className="text-xs">Không có media</span>
                    </div>
                  )}

                  {selectedRecord.mediaUrl && (
                    <a
                      href={selectedRecord.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-md border border-white/10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span>Mở media gốc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Adapted Content */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-violet-400" />
                      <span>Nội dung ({PLATFORM_CONFIGS[selectedRecord.platform]?.name})</span>
                    </label>
                    <button
                      onClick={() => handleCopyCaption(selectedRecord.adaptedContent)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã copy!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {selectedRecord.adaptedContent}
                  </div>
                </div>

                {/* Audit & Technical Specs */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Mã Variant ID</span>
                    <span className="text-zinc-300 font-mono text-[10px]">{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Mã External Dispatch</span>
                    <span className="text-cyan-400 font-mono text-[10px]">
                      {selectedRecord.externalPostId || "N/A (Chưa xuất bản)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Trạng thái phát hành</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {selectedRecord.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Thời gian đăng tải</span>
                    <span className="text-zinc-300 font-mono text-[10px]">
                      {selectedRecord.publishedAt
                        ? new Date(selectedRecord.publishedAt).toLocaleString("vi-VN")
                        : "Hàng chờ lên lịch"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800">
              <div>
                {getExternalUrl(selectedRecord) && (
                  <a
                    href={getExternalUrl(selectedRecord)!}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all"
                  >
                    <span>Mở bài viết trực tiếp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncMetrics({ variantId: selectedRecord.id })}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                >
                  <TrendingUp className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-cyan-400" : ""}`} />
                  <span>Làm mới số liệu</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
