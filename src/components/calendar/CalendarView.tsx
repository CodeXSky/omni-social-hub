"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Layers, 
  Sparkles,
  MoreVertical,
  CheckCircle2,
  Trash2,
  X,
  Send,
  ExternalLink,
  Flame,
  Zap,
  TrendingUp,
  RotateCw
} from "lucide-react";
import Link from "next/link";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

interface ScheduledEvent {
  id: string;
  title: string;
  time: string;
  day: number;
  scheduledAt?: string | null;
  platforms: Platform[];
  mediaThumbnail: string;
  status: "DRAFT" | "QUEUED" | "PUBLISHED";
  caption?: string;
}

export function CalendarView() {
  const [viewMode, setViewMode] = useState<"month" | "kanban">("month");
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [isPublishingNow, setIsPublishingNow] = useState(false);

  // Quick Schedule Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState(15);
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newPlatform, setNewPlatform] = useState<Platform>(Platform.TIKTOK);

  const loadEvents = () => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts && data.posts.length > 0) {
          const mapped: ScheduledEvent[] = data.posts.map((p: any) => {
            const dateObj = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt);
            const dayNum = dateObj.getDate();
            const platformList = p.variants?.map((v: any) => v.platform) || [Platform.INSTAGRAM];
            return {
              id: p.id,
              title: p.title || "Social Post",
              time: dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              day: dayNum,
              scheduledAt: p.scheduledAt,
              platforms: platformList,
              mediaThumbnail: p.rawMediaUrls?.[0] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
              status: p.status === "PUBLISHED" ? "PUBLISHED" : (p.status === "QUEUED" ? "QUEUED" : "DRAFT"),
              caption: p.rawCaption,
            };
          });
          setEvents(mapped);
        } else {
          setEvents([]);
        }
      })
      .catch(() => {
        setEvents([]);
      });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Drag and drop reschedule with persistent server update
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDropOnDay = async (day: number) => {
    if (!draggedId) return;
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), day, 10, 30, 0);

    setEvents((prev) =>
      prev.map((evt) => (evt.id === draggedId ? { ...evt, day } : evt))
    );

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          postId: draggedId,
          scheduledAt: targetDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`🗓️ Đã dời lịch đăng bài sang ngày ${day} (10:30 AM) thành công!`);
        loadEvents();
      }
    } catch (e: any) {
      setNotice(`Lỗi khi dời lịch: ${e.message}`);
    }

    setDraggedId(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleMoveStatus = (id: string, newStatus: "DRAFT" | "QUEUED" | "PUBLISHED") => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, status: newStatus } : evt))
    );
    setNotice(`Pipeline updated: Post shifted to ${newStatus}`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Immediate Publish from Calendar
  const handlePublishNow = async (postId: string) => {
    setIsPublishingNow(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          postId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice("🚀 Đã xuất bản bài viết thành công!");
        loadEvents();
        setSelectedEvent(null);
      } else {
        setNotice("Lỗi xuất bản: " + data.error);
      }
    } catch (e: any) {
      setNotice("Lỗi kết nối: " + e.message);
    } finally {
      setIsPublishingNow(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleCreateQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(Number(newDay));
      scheduledDate.setHours(10, 0, 0, 0);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          caption: newTitle,
          mediaUrls: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200"],
          scheduledAt: scheduledDate.toISOString(),
          publishNow: false,
          variants: [
            {
              platform: newPlatform,
              adaptedContent: newTitle,
              mediaUrls: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200"],
            },
          ],
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        setNotice(`✅ Đã lên lịch thành công cho bài đăng "${newTitle}" vào ngày ${newDay}!`);
        loadEvents();
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPeakTimeBadge = (day: number) => {
    if (day % 3 === 0) return { label: "19:30 Reels Peak", icon: Flame, color: "text-orange-400 bg-orange-500/10" };
    if (day % 3 === 1) return { label: "11:30 TikTok Peak", icon: Zap, color: "text-cyan-400 bg-cyan-500/10" };
    return { label: "21:00 Shorts Peak", icon: TrendingUp, color: "text-pink-400 bg-pink-500/10" };
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Omni-Scheduler Engine
            </span>
            <span className="text-zinc-500 text-xs">• Drag & Drop Rescheduling</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Content Calendar & Kanban Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Lịch đăng bài đa kênh tương tác. Kéo thả bài viết để đổi ngày xuất bản, tự động phát hành qua Cron Scheduler.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "month" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Lịch Tháng
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "kanban" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Kanban Pipeline
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Lên lịch nhanh</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {viewMode === "month" ? (
        /* Monthly Calendar Grid */
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-zinc-100">Tháng 10, 2026</h2>
              <span className="text-xs text-zinc-400">
                {events.length} bài đăng trên lịch • Kéo thả bài viết để đổi ngày hẹn giờ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadEvents} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider py-2">
            <div>Chủ Nhật</div>
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayEvents = events.filter((e) => e.day === day);
              const isToday = day === new Date().getDate();
              const peak = getPeakTimeBadge(day);
              const PeakIcon = peak.icon;

              return (
                <div
                  key={day}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnDay(day)}
                  className={`min-h-[125px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? "bg-zinc-900/90 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/30"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-bold ${
                          isToday ? "text-cyan-400 font-mono" : "text-zinc-400"
                        }`}
                      >
                        {day} {isToday && "• HÔM NAY"}
                      </span>
                    </div>

                    {/* Best Time Peak Badge */}
                    <div className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-md mb-1.5 ${peak.color}`}>
                      <PeakIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{peak.label}</span>
                    </div>

                    {/* Events list */}
                    <div className="space-y-1.5">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          draggable
                          onDragStart={() => handleDragStart(evt.id)}
                          onClick={() => setSelectedEvent(evt)}
                          className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 text-[10px] text-zinc-200 transition-all cursor-grab active:cursor-grabbing shadow-sm group select-none flex items-center gap-2"
                        >
                          {evt.mediaThumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={evt.mediaThumbnail}
                              alt="thumb"
                              className="w-6 h-6 rounded-md object-cover shrink-0"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-zinc-500 shrink-0" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-zinc-200 truncate group-hover:text-cyan-400">
                              {evt.title}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                              <span>{evt.time}</span>
                              <span>•</span>
                              <span className={evt.status === "PUBLISHED" ? "text-emerald-400" : "text-amber-400"}>
                                {evt.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            title="Ý Tưởng Nháp (Drafts)"
            count={events.filter((e) => e.status === "DRAFT").length.toString()}
            statusColor="border-zinc-700"
            onMoveStatus={handleMoveStatus}
            targetStatus="DRAFT"
            items={events.filter((e) => e.status === "DRAFT")}
          />
          <KanbanColumn
            title="Hàng Chờ (Queued / Scheduled)"
            count={events.filter((e) => e.status === "QUEUED").length.toString()}
            statusColor="border-cyan-500/50"
            onMoveStatus={handleMoveStatus}
            targetStatus="QUEUED"
            items={events.filter((e) => e.status === "QUEUED")}
          />
          <KanbanColumn
            title="Đã Xuất Bản (Published)"
            count={events.filter((e) => e.status === "PUBLISHED").length.toString()}
            statusColor="border-emerald-500/50"
            onMoveStatus={handleMoveStatus}
            targetStatus="PUBLISHED"
            items={events.filter((e) => e.status === "PUBLISHED")}
          />
        </div>
      )}

      {/* Event Details Quick Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  {selectedEvent.status}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEvent.caption && (
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 leading-relaxed font-sans">
                {selectedEvent.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Hẹn giờ: Ngày {selectedEvent.day} ({selectedEvent.time})</span>
              <span>Kênh: {selectedEvent.platforms.join(", ")}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              {selectedEvent.status !== "PUBLISHED" && (
                <button
                  onClick={() => handlePublishNow(selectedEvent.id)}
                  disabled={isPublishingNow}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishingNow ? "Đang xuất bản..." : "Xuất bản ngay"}</span>
                </button>
              )}
              <Link
                href="/composer"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                Mở trong Composer
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Lên lịch chiến dịch mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuick} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Tiêu đề bài đăng</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Review Tai Nghe Bluetooth ANC"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Ngày trong tháng</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Nền tảng</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as Platform)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    {Object.keys(PLATFORM_CONFIGS).map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_CONFIGS[p as Platform].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold"
                >
                  Lên lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  statusColor,
  items,
  onMoveStatus,
  targetStatus,
}: {
  title: string;
  count: string;
  statusColor: string;
  items: ScheduledEvent[];
  onMoveStatus: (id: string, s: "DRAFT" | "QUEUED" | "PUBLISHED") => void;
  targetStatus: "DRAFT" | "QUEUED" | "PUBLISHED";
}) {
  return (
    <div className={`bg-zinc-900/60 border ${statusColor} rounded-2xl p-4 flex flex-col h-[600px]`}>
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
        <h3 className="text-xs font-bold text-zinc-200">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
          {count}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {items.map((it) => (
          <div
            key={it.id}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-cyan-500/40 text-xs space-y-2 shadow-sm transition-all"
          >
            <div className="font-semibold text-zinc-200 line-clamp-1">{it.title}</div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Ngày {it.day} ({it.time})</span>
              <div className="flex -space-x-1">
                {it.platforms.map((p) => {
                  const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.TIKTOK;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={p}
                      className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                    >
                      <Icon className="w-2.5 h-2.5 text-zinc-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
