"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Layers, 
  Sparkles,
  MoreVertical,
  CheckCircle2
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
  status: "QUEUED" | "PUBLISHED";
}

const SAMPLE_EVENTS: ScheduledEvent[] = [
  {
    id: "1",
    title: "AI Product Launch Keynote Highlights",
    time: "09:30 AM",
    day: 12,
    platforms: [Platform.TIKTOK, Platform.INSTAGRAM, Platform.TWITTER],
    mediaThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
    status: "QUEUED",
  },
  {
    id: "2",
    title: "Behind The Scenes: Engineering Team",
    time: "02:00 PM",
    day: 14,
    platforms: [Platform.THREADS, Platform.INSTAGRAM],
    mediaThumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100",
    status: "QUEUED",
  },
  {
    id: "3",
    title: "Weekly Growth Hacks Carousel",
    time: "11:15 AM",
    day: 16,
    platforms: [Platform.PINTEREST, Platform.FACEBOOK, Platform.TWITTER],
    mediaThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100",
    status: "QUEUED",
  },
  {
    id: "4",
    title: "Viral Hook: 3 Mistakes Creators Make",
    time: "06:00 PM",
    day: 18,
    platforms: [Platform.TIKTOK],
    mediaThumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    status: "QUEUED",
  },
];

export function CalendarView() {
  const [viewMode, setViewMode] = useState<"month" | "kanban">("month");
  const [events, setEvents] = useState<ScheduledEvent[]>(SAMPLE_EVENTS);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Omni-Scheduler
            </span>
            <span className="text-zinc-500 text-xs">• Drag & Drop Dispatcher</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Content Calendar & Kanban Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cross-platform multi-channel publishing schedule and status pipelines.
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

          <Link
            href="/composer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </Link>
        </div>
      </div>

      {viewMode === "month" ? (
        /* Monthly Calendar Grid */
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-zinc-100">October 2026</h2>
              <span className="text-xs text-zinc-500">4 posts scheduled across 6 platforms</span>
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
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-200 transition-all cursor-pointer shadow-sm group"
                      >
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="font-mono">{evt.time}</span>
                          <div className="flex -space-x-1">
                            {evt.platforms.map((p) => {
                              const cfg = PLATFORM_CONFIGS[p];
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
            count="2"
            statusColor="border-zinc-700"
            items={[
              {
                title: "Q4 Roadmap Sneak Peek Carousel",
                caption: "5 major features dropping this November. Swipe to preview.",
                platforms: [Platform.INSTAGRAM, Platform.TWITTER],
              },
              {
                title: "Creator Monetization Deep Dive",
                caption: "How we scale our organic reach to 500K monthly impressions without ad spend.",
                platforms: [Platform.THREADS, Platform.TIKTOK],
              },
            ]}
          />
          <KanbanColumn
            title="Queued in BullMQ (Scheduled)"
            count="4"
            statusColor="border-cyan-500/50"
            items={events.map((e) => ({
              title: e.title,
              caption: `Scheduled for ${e.time} on Day ${e.day}`,
              platforms: e.platforms,
            }))}
          />
          <KanbanColumn
            title="Successfully Published"
            count="18"
            statusColor="border-emerald-500/50"
            items={[
              {
                title: "OmniSocial Hub 2.0 Product Launch",
                caption: "We just rolled out the all-new OmniSocial Hub 2.0 with instant cross-platform AI adaptation!",
                platforms: [Platform.TIKTOK, Platform.INSTAGRAM, Platform.TWITTER, Platform.FACEBOOK],
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, count, statusColor, items }: any) {
  return (
    <div className={`bg-zinc-900/60 border ${statusColor} rounded-2xl p-5 space-y-4 backdrop-blur-xl`}>
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">{item.title}</span>
              <MoreVertical className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
              {item.caption}
            </p>
            <div className="flex items-center gap-1 pt-1">
              {item.platforms.map((p: Platform) => {
                const cfg = PLATFORM_CONFIGS[p];
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
          </div>
        ))}
      </div>
    </div>
  );
}
