"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { teamMembers, scheduleBlocks } from "@/lib/mock-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9–17

const blockColors: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  violet: { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700" },
  blue: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700" },
  red: { bg: "bg-red-100", border: "border-red-300", text: "text-red-600" },
  emerald: { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700" },
};

const typeLabel: Record<string, string> = {
  task: "Task",
  meeting: "Meeting",
  focus: "Focus block",
  blocked: "Blocked",
};

const typeBadge: Record<string, string> = {
  task: "bg-indigo-50 text-indigo-600",
  meeting: "bg-violet-50 text-violet-600",
  focus: "bg-blue-50 text-blue-600",
  blocked: "bg-red-50 text-red-600",
};

export default function PlannerPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const visibleBlocks = selectedMember
    ? scheduleBlocks.filter((b) => b.member === selectedMember)
    : scheduleBlocks;

  const weekLabel = "Apr 14 – Apr 18, 2026";

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Team Planner</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly scheduling · {weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button className="px-3 py-2 hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground px-3 border-x border-border">{weekLabel}</span>
            <button className="px-3 py-2 hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Button size="sm"><Plus className="w-4 h-4" /> Schedule block</Button>
        </div>
      </div>

      {/* Member filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedMember(null)}
          className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${!selectedMember ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-border text-muted-foreground hover:bg-muted"}`}
        >
          All members
        </button>
        {teamMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(selectedMember === m.id ? null : m.id)}
            className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${selectedMember === m.id ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            <Avatar className="w-4 h-4 text-[8px]">
              <AvatarFallback>{m.initials}</AvatarFallback>
            </Avatar>
            {m.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: "64px repeat(5, 1fr)" }}>
              <div className="border-r border-border" />
              {DAYS.map((day, i) => (
                <div key={day} className={`py-3 px-4 text-center border-r border-border last:border-0 ${i === 0 ? "bg-indigo-50/50" : ""}`}>
                  <p className="text-xs font-semibold text-foreground">{SHORT_DAYS[i]}</p>
                  <p className="text-xs text-muted-foreground">{day}</p>
                </div>
              ))}
            </div>

            {/* Time rows */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: "64px repeat(5, 1fr)", minHeight: 72 }}>
                  <div className="border-r border-border flex items-start justify-end pr-3 pt-1.5">
                    <span className="text-xs text-muted-foreground font-medium">{hour}:00</span>
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const blocksHere = visibleBlocks.filter(
                      (b) => b.day === dayIdx && b.startHour <= hour && b.startHour + b.duration > hour
                    );
                    const isBlockStart = (b: typeof visibleBlocks[0]) => b.startHour === hour;

                    return (
                      <div
                        key={dayIdx}
                        className={`relative border-r border-border last:border-0 p-1 ${dayIdx === 0 ? "bg-indigo-50/20" : ""}`}
                      >
                        {blocksHere.filter(isBlockStart).map((block) => {
                          const colors = blockColors[block.color] ?? blockColors.indigo;
                          const member = teamMembers.find((m) => m.id === block.member);
                          return (
                            <div
                              key={block.id}
                              className={`rounded-lg border ${colors.bg} ${colors.border} ${colors.text} p-2 cursor-pointer hover:brightness-95 transition-all`}
                              style={{ height: `${block.duration * 72 - 6}px`, position: "absolute", top: 3, left: 4, right: 4, zIndex: 10 }}
                            >
                              <p className="text-xs font-semibold leading-tight truncate">{block.title}</p>
                              <p className="text-[10px] opacity-70 mt-0.5">{typeLabel[block.type]}</p>
                              {block.duration >= 2 && member && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <Avatar className="w-4 h-4 text-[8px]">
                                    <AvatarFallback>{member.initials}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] opacity-60">{member.name.split(" ")[0]}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(typeLabel).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${typeBadge[type]}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
