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
  X
} from "lucide-react";
import Link from "next/link";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

interface ScheduledEvent {
  id: string;
  title: string;
  time: string;
  day: number;
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
          const mapped: ScheduledEvent[] = data.posts.map((p: any, idx: number) => {
            const dateObj = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt);
            const dayNum = (dateObj.getDate() % 30) + 1;
            const platformList = p.variants?.map((v: any) => v.platform) || [Platform.INSTAGRAM];
            return {
              id: p.id,
              title: p.title || "Social Post",
              time: "09:30 AM",
              day: dayNum,
              platforms: platformList,
              mediaThumbnail: p.rawMediaUrls?.[0] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
              status: p.status === "PUBLISHED" ? "PUBLISHED" : "QUEUED",
              caption: p.rawCaption,
            };
          });
          setEvents(mapped);
        } else {
          setEvents(getDefaultEvents());
        }
      })
      .catch(() => {
        setEvents(getDefaultEvents());
      });
  };

  function getDefaultEvents(): ScheduledEvent[] {
    return [
      {
        id: "evt-1",
        title: "AI Product Launch Keynote Highlights",
        time: "09:30 AM",
        day: 12,
        platforms: [Platform.TIKTOK, Platform.INSTAGRAM, Platform.TWITTER],
        mediaThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
        status: "QUEUED",
        caption: "Key takeaways from our keynote stream.",
      },
      {
        id: "evt-2",
        title: "Behind The Scenes: Engineering Team",
        time: "02:00 PM",
        day: 14,
        platforms: [Platform.THREADS, Platform.INSTAGRAM],
        mediaThumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100",
        status: "QUEUED",
        caption: "How our team designs scalable architecture.",
      },
      {
        id: "evt-3",
        title: "Weekly Growth Hacks Carousel",
        time: "11:15 AM",
        day: 16,
        platforms: [Platform.PINTEREST, Platform.FACEBOOK, Platform.TWITTER],
        mediaThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100",
        status: "QUEUED",
        caption: "3 frameworks for accelerating social reach.",
      },
      {
        id: "evt-4",
        title: "Viral Hook: 3 Mistakes Creators Make",
        time: "06:00 PM",
        day: 18,
        platforms: [Platform.TIKTOK],
        mediaThumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        status: "QUEUED",
        caption: "Avoid these 3 common formatting traps.",
      },
    ];
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Drag and drop reschedule
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDropOnDay = (day: number) => {
    if (!draggedId) return;
    setEvents((prev) =>
      prev.map((evt) => (evt.id === draggedId ? { ...evt, day } : evt))
    );
    setNotice(`🗓️ Post rescheduled to Day ${day} successfully!`);
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

  const handleCreateQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEvt: ScheduledEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      time: newTime,
      day: Number(newDay),
      platforms: [newPlatform],
      mediaThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      status: "QUEUED",
      caption: newTitle,
    };

    setEvents([newEvt, ...events]);
    setIsModalOpen(false);
    setNewTitle("");
    setNotice(`✅ Scheduled "${newTitle}" for Day ${newDay} at ${newTime}!`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Omni-Scheduler
            </span>
            <span className="text-zinc-500 text-xs">• Interactive Drag & Drop</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Content Calendar & Kanban Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cross-platform multi-channel publishing schedule with live drag-and-drop rescheduling.
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
              Monthly Calendar
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
            <span>Schedule Post</span>
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
              <h2 className="text-base font-bold text-zinc-100">October 2026</h2>
              <span className="text-xs text-zinc-500">
                {events.length} posts scheduled • Drag items across days to reschedule
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayEvents = events.filter((e) => e.day === day);
              const isToday = day === 11;
              return (
                <div
                  key={day}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnDay(day)}
                  className={`min-h-[110px] p-2 rounded-xl border transition-all ${
                    isToday
                      ? "bg-zinc-900/90 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? "text-cyan-400 font-mono" : "text-zinc-400"
                      }`}
                    >
                      {day} {isToday && "• TODAY"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        draggable
                        onDragStart={() => handleDragStart(evt.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-200 transition-all cursor-grab active:cursor-grabbing shadow-sm group select-none"
                      >
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="font-mono">{evt.time}</span>
                          <div className="flex -space-x-1">
                            {evt.platforms.map((p) => {
                              const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.TIKTOK;
                              const Icon = cfg.icon;
                              return (
                                <div
                                  key={p}
                                  className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                                  title={cfg.name}
                                >
                                  <Icon className="w-2.5 h-2.5 text-zinc-300" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="font-medium text-zinc-200 truncate mt-1 group-hover:text-cyan-400">
                          {evt.title}
                        </div>
                      </div>
                    ))}
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
            title="Draft Ideas"
            count={events.filter((e) => e.status === "DRAFT").length.toString()}
            statusColor="border-zinc-700"
            onMoveStatus={handleMoveStatus}
            targetStatus="DRAFT"
            items={events.filter((e) => e.status === "DRAFT")}
          />
          <KanbanColumn
            title="Queued in BullMQ (Scheduled)"
            count={events.filter((e) => e.status === "QUEUED").length.toString()}
            statusColor="border-cyan-500/50"
            onMoveStatus={handleMoveStatus}
            targetStatus="QUEUED"
            items={events.filter((e) => e.status === "QUEUED")}
          />
          <KanbanColumn
            title="Successfully Published"
            count={events.filter((e) => e.status === "PUBLISHED").length.toString()}
            statusColor="border-emerald-500/50"
            onMoveStatus={handleMoveStatus}
            targetStatus="PUBLISHED"
            items={events.filter((e) => e.status === "PUBLISHED")}
          />
        </div>
      )}

      {/* Quick Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Schedule New Campaign Post</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuick} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creator Growth Guide Part 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Day of Month</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Channel</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as Platform)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  {Object.keys(PLATFORM_CONFIGS).map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_CONFIGS[p as Platform].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, count, statusColor, items, onMoveStatus, targetStatus }: any) {
  return (
    <div className={`bg-zinc-900/60 border ${statusColor} rounded-2xl p-5 space-y-4 backdrop-blur-xl`}>
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
          {count}
        </span>
      </div>

      <div className="space-y-3 min-h-[150px]">
        {items.length === 0 ? (
          <div className="text-center text-xs text-zinc-500 py-8 border border-dashed border-zinc-800 rounded-xl">
            No items in this stage
          </div>
        ) : (
          items.map((item: any) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">{item.title}</span>
                <span className="text-[10px] font-mono text-zinc-500">Day {item.day}</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.caption || "Cross-platform scheduled campaign"}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  {item.platforms.map((p: Platform) => {
                    const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.TIKTOK;
                    const Icon = cfg.icon;
                    return (
                      <span
                        key={p}
                        className={`p-1 rounded-md ${cfg.badgeBg} flex items-center justify-center`}
                        title={cfg.name}
                      >
                        <Icon className="w-3 h-3" />
                      </span>
                    );
                  })}
                </div>

                {targetStatus !== "PUBLISHED" && (
                  <button
                    onClick={() => onMoveStatus(item.id, "PUBLISHED")}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold"
                  >
                    Mark Published
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
