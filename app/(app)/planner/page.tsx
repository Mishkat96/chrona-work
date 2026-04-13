"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  AlertTriangle, Clock, CalendarDays, Users, ZapOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/lib/store-context";
import {
  getWeekStart, addWeeks, formatWeekLabel, isoDate,
  unscheduledTasksForUser, urgentUnscheduledTasks,
  teamCapacitySummary, scheduledHoursForUser,
  blockedTasksInSchedule, blockDurationHours,
} from "@/lib/planner-selectors";
import type { ScheduleBlock, BlockKind, Task, User } from "@/lib/mock-data";
import type { NewBlockDraft } from "@/lib/store-context";
import { PriorityBadge } from "@/components/app/PriorityBadge";

// ── Grid constants ─────────────────────────────────────────────────────────────

const HOUR_START  = 9;
const HOUR_END    = 18;
const HOUR_PX     = 72;
const HOURS       = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START);
const GRID_HEIGHT = HOURS.length * HOUR_PX;
const SHORT_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ── Kind styles ────────────────────────────────────────────────────────────────

const KIND_STYLE: Record<BlockKind, { bg: string; border: string; text: string }> = {
  task:    { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  focus:   { bg: "bg-blue-100",   border: "border-blue-300",   text: "text-blue-700"   },
  meeting: { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700" },
  blocked: { bg: "bg-red-100",    border: "border-red-300",    text: "text-red-600"    },
};

const KIND_LABEL: Record<BlockKind, string> = {
  task:    "Task",
  focus:   "Focus",
  meeting: "Meeting",
  blocked: "Blocked",
};

// ── Time-option helpers ────────────────────────────────────────────────────────

function makeTimeOptions(startH: number, startM: number, endH: number, endM: number) {
  const opts: { label: string; value: string }[] = [];
  let mins = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (mins <= end) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    opts.push({
      value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    });
    mins += 30;
  }
  return opts;
}

const START_TIMES = makeTimeOptions(9, 0, 17, 30);
const END_TIMES   = makeTimeOptions(9, 30, 18, 0);

// ── Block form state ───────────────────────────────────────────────────────────

interface BlockForm {
  title:     string;
  kind:      BlockKind;
  userId:    string;
  taskId:    string;
  date:      string;
  startTime: string;
  endTime:   string;
}

function defaultForm(
  currentUser: User,
  prefill?: { date?: string; hour?: number; taskId?: string; taskTitle?: string }
): BlockForm {
  const date      = prefill?.date ?? isoDate(new Date());
  const startHour = prefill?.hour ?? HOUR_START;
  const clampedEnd = Math.min(startHour + 1, HOUR_END);
  return {
    title:     prefill?.taskTitle ?? "",
    kind:      "task",
    userId:    currentUser.id,
    taskId:    prefill?.taskId ?? "",
    date,
    startTime: `${String(startHour).padStart(2, "0")}:00`,
    endTime:   `${String(clampedEnd).padStart(2, "0")}:00`,
  };
}

function blockToForm(block: ScheduleBlock): BlockForm {
  const s = new Date(block.startsAt);
  const e = new Date(block.endsAt);
  return {
    title:     block.title,
    kind:      block.kind,
    userId:    block.userId,
    taskId:    block.taskId ?? "",
    date:      isoDate(s),
    startTime: `${String(s.getHours()).padStart(2,"0")}:${String(s.getMinutes()).padStart(2,"0")}`,
    endTime:   `${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`,
  };
}

// ── Block Dialog ───────────────────────────────────────────────────────────────

interface BlockDialogProps {
  open:         boolean;
  onOpenChange: (v: boolean) => void;
  editingBlock: ScheduleBlock | null;
  prefill:      { date?: string; hour?: number; taskId?: string; taskTitle?: string } | null;
  currentUser:  User;
  plannerUsers: User[]; // users this person can assign to
  visibleTasks: Task[];
  workspaceId:  string;
  onSave:       (draft: NewBlockDraft) => Promise<unknown>;
  onUpdate:     (block: ScheduleBlock) => Promise<unknown>;
  onDelete:     (id: string) => Promise<unknown>;
}

function BlockDialog({
  open, onOpenChange, editingBlock, prefill,
  currentUser, plannerUsers, visibleTasks, workspaceId,
  onSave, onUpdate, onDelete,
}: BlockDialogProps) {
  const isEmployee = currentUser.role === "employee";
  const [form, setForm] = useState<BlockForm>(defaultForm(currentUser));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Reset form whenever the dialog opens
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editingBlock) {
      setForm(blockToForm(editingBlock));
    } else {
      setForm(defaultForm(currentUser, prefill ?? {}));
    }
  }, [open, editingBlock, prefill, currentUser]);

  // Auto-fill title from linked task
  function handleTaskChange(taskId: string) {
    const task = visibleTasks.find((t) => t.id === taskId);
    setForm((f) => ({
      ...f,
      taskId,
      title: task ? task.title : f.title,
      kind:  task ? "task" : f.kind,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    const startsAt = new Date(`${form.date}T${form.startTime}`).toISOString();
    const endsAt   = new Date(`${form.date}T${form.endTime}`).toISOString();
    if (new Date(startsAt) >= new Date(endsAt)) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    try {
      if (editingBlock) {
        await onUpdate({
          ...editingBlock,
          userId:   form.userId,
          taskId:   form.taskId || undefined,
          kind:     form.kind,
          title:    form.title.trim(),
          startsAt,
          endsAt,
        });
      } else {
        await onSave({
          workspaceId,
          userId:    form.userId,
          taskId:    form.taskId || undefined,
          kind:      form.kind,
          title:     form.title.trim(),
          startsAt,
          endsAt,
          createdBy: currentUser.id,
        });
      }
      onOpenChange(false);
    } catch {
      setError("Failed to save block. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingBlock) return;
    setSaving(true);
    try {
      await onDelete(editingBlock.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const activeTasks = visibleTasks.filter((t) => t.status !== "done");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBlock ? "Edit block" : "New schedule block"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Assign to — hidden for employees (always themselves) */}
          {!isEmployee && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Assign to
              </label>
              <Select value={form.userId} onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plannerUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-sm">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Link to task (optional) */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Link to task <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Select value={form.taskId || "_none"} onValueChange={(v) => handleTaskChange(v === "_none" ? "" : v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="No task linked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none" className="text-sm text-muted-foreground">
                  No task linked
                </SelectItem>
                {activeTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-sm">
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What are you working on?"
              required
              className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Kind */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Type</label>
            <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v as BlockKind }))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["task", "focus", "meeting", "blocked"] as BlockKind[]).map((k) => (
                  <SelectItem key={k} value={k} className="text-sm capitalize">
                    {KIND_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date + times */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground block mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Start</label>
              <Select value={form.startTime} onValueChange={(v) => setForm((f) => ({ ...f, startTime: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {START_TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">End</label>
              <Select value={form.endTime} onValueChange={(v) => setForm((f) => ({ ...f, endTime: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {END_TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center gap-2 pt-2">
            {editingBlock && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="mr-auto flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : editingBlock ? "Save changes" : "Create block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const {
    currentUser, users, teams, visibleTasks, workspaceId,
    scheduleBlocks, plannerLoading,
    loadWeekBlocks, createBlock, updateBlock, deleteBlock,
  } = useTasks();

  const [weekStart,    setWeekStart]    = useState(() => getWeekStart(new Date()));
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [prefill, setPrefill] = useState<{
    date?: string; hour?: number; taskId?: string; taskTitle?: string;
  } | null>(null);

  // Load blocks whenever the viewed week changes
  useEffect(() => {
    loadWeekBlocks(weekStart);
  }, [weekStart, loadWeekBlocks]);

  const todayStr = useMemo(() => isoDate(new Date()), []);

  // The 5 weekday Date objects for the current view
  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [weekStart]
  );

  // ── Role-based user scope ────────────────────────────────────────────────────

  const plannerUsers = useMemo((): User[] => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return users;
    if (currentUser.role === "manager") {
      const myTeamIds = new Set(
        teams.filter((t) => t.managerId === currentUser.id).map((t) => t.id)
      );
      const memberIds = new Set(
        teams
          .filter((t) => myTeamIds.has(t.id))
          .flatMap((t) => t.memberIds)
      );
      memberIds.add(currentUser.id);
      return users.filter((u) => memberIds.has(u.id));
    }
    return users.filter((u) => u.id === currentUser.id);
  }, [currentUser, users, teams]);

  const canSeeTeam = currentUser?.role !== "employee";

  // ── Filtered blocks for the grid ─────────────────────────────────────────────

  const gridBlocks = useMemo(() => {
    if (!currentUser) return [];
    const allowedIds = new Set(plannerUsers.map((u) => u.id));
    const base = scheduleBlocks.filter((b) => allowedIds.has(b.userId));
    if (filterUserId !== "all") return base.filter((b) => b.userId === filterUserId);
    return base;
  }, [scheduleBlocks, plannerUsers, filterUserId, currentUser]);

  // ── Sidebar data ─────────────────────────────────────────────────────────────

  const sidebarTasks = useMemo(() => {
    if (!currentUser) return [];
    if (filterUserId !== "all") {
      return unscheduledTasksForUser(visibleTasks, scheduleBlocks, filterUserId);
    }
    // "All members" view — show unscheduled tasks for everyone in scope
    const allowedIds = new Set(plannerUsers.map((u) => u.id));
    return visibleTasks.filter((t) => {
      if (t.status === "done") return false;
      const scheduledIds = new Set(scheduleBlocks.filter((b) => b.taskId).map((b) => b.taskId!));
      if (scheduledIds.has(t.id)) return false;
      return allowedIds.has(t.primaryOwnerId) || t.collaboratorIds.some((id) => allowedIds.has(id));
    });
  }, [visibleTasks, scheduleBlocks, filterUserId, currentUser, plannerUsers]);

  const urgentTasks = useMemo(() => {
    if (filterUserId !== "all") {
      return urgentUnscheduledTasks(visibleTasks, scheduleBlocks, filterUserId);
    }
    // "All members" view — pass undefined so selector returns all unscheduled urgent tasks in scope
    return urgentUnscheduledTasks(visibleTasks, scheduleBlocks, undefined);
  }, [visibleTasks, scheduleBlocks, filterUserId]);

  const capacitySummary = useMemo(() => {
    if (!canSeeTeam) return [];
    const scope = filterUserId !== "all"
      ? plannerUsers.filter((u) => u.id === filterUserId)
      : plannerUsers;
    return teamCapacitySummary(scope, scheduleBlocks, weekStart);
  }, [canSeeTeam, plannerUsers, scheduleBlocks, weekStart, filterUserId]);

  const blockedInSchedule = useMemo(
    () => blockedTasksInSchedule(visibleTasks, scheduleBlocks),
    [visibleTasks, scheduleBlocks]
  );

  // ── Event handlers ────────────────────────────────────────────────────────────

  function openCreate(date?: string, hour?: number) {
    setEditingBlock(null);
    setPrefill(date ? { date, hour } : null);
    setDialogOpen(true);
  }

  function openScheduleTask(task: Task) {
    setEditingBlock(null);
    setPrefill({ taskId: task.id, taskTitle: task.title });
    setDialogOpen(true);
  }

  function openEdit(block: ScheduleBlock) {
    setEditingBlock(block);
    setPrefill(null);
    setDialogOpen(true);
  }

  if (!currentUser) return null;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {canSeeTeam ? "Team Planner" : "My Week"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatWeekLabel(weekStart)}
            {plannerLoading && <span className="ml-2 opacity-50">Loading…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Week navigation */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              className="px-3 py-2 hover:bg-muted transition-colors"
              onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-x border-border"
              onClick={() => setWeekStart(getWeekStart(new Date()))}
            >
              Today
            </button>
            <button
              className="px-3 py-2 hover:bg-muted transition-colors"
              onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Button size="sm" onClick={() => openCreate()}>
            <Plus className="w-4 h-4" /> Schedule block
          </Button>
        </div>
      </div>

      {/* ── Member filter (manager / admin) ─────────────────────────────────── */}
      {canSeeTeam && plannerUsers.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterUserId("all")}
            className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
              filterUserId === "all"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> All members
          </button>
          {plannerUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setFilterUserId(filterUserId === u.id ? "all" : u.id)}
              className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                filterUserId === u.id
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Avatar className="w-4 h-4 text-[8px]">
                <AvatarFallback className="text-[8px]">{u.initials}</AvatarFallback>
              </Avatar>
              {u.name.split(" ")[0]}
              {scheduleBlocks.filter((b) => b.userId === u.id).length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded-full font-semibold">
                  {Math.round(scheduledHoursForUser(scheduleBlocks, u.id) * 10) / 10}h
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Main layout: grid + sidebar ──────────────────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* ── Weekly grid ─────────────────────────────────────────────────── */}
        <Card className="flex-1 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 640 }}>

              {/* Day headers */}
              <div
                className="grid border-b border-border"
                style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}
              >
                <div className="border-r border-border" />
                {weekDays.map((day, i) => {
                  const ds = isoDate(day);
                  const isToday = ds === todayStr;
                  return (
                    <div
                      key={i}
                      className={`py-3 text-center border-r border-border last:border-0 ${isToday ? "bg-indigo-50/40" : ""}`}
                    >
                      <p className={`text-xs font-semibold ${isToday ? "text-indigo-600" : "text-foreground"}`}>
                        {SHORT_DAYS[i]}
                      </p>
                      <p className={`text-xs mt-0.5 ${isToday ? "text-indigo-500 font-medium" : "text-muted-foreground"}`}>
                        {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      {isToday && (
                        <div className="w-1 h-1 bg-indigo-500 rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grid body */}
              <div
                className="grid"
                style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}
              >
                {/* Time labels */}
                <div
                  className="border-r border-border relative shrink-0"
                  style={{ height: GRID_HEIGHT }}
                >
                  {HOURS.map((hour, i) => (
                    <div
                      key={hour}
                      className="absolute right-2 text-[10px] text-muted-foreground font-medium"
                      style={{ top: i * HOUR_PX + 5 }}
                    >
                      {hour}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIdx) => {
                  const ds      = isoDate(day);
                  const isToday = ds === todayStr;
                  const dayBlocks = gridBlocks.filter(
                    (b) => isoDate(new Date(b.startsAt)) === ds
                  );

                  return (
                    <div
                      key={dayIdx}
                      className={`relative border-r border-border last:border-0 ${isToday ? "bg-indigo-50/10" : ""}`}
                      style={{ height: GRID_HEIGHT }}
                    >
                      {/* Hour slot click zones */}
                      {HOURS.map((hour, hIdx) => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                          style={{ top: hIdx * HOUR_PX, height: HOUR_PX, zIndex: 0 }}
                          onClick={() => openCreate(ds, hour)}
                        />
                      ))}

                      {/* Schedule blocks */}
                      {dayBlocks.map((block) => {
                        const s    = new Date(block.startsAt);
                        const e    = new Date(block.endsAt);
                        const topH = s.getHours() + s.getMinutes() / 60 - HOUR_START;
                        const durH = blockDurationHours(block);
                        const top  = Math.max(0, topH * HOUR_PX) + 2;
                        const h    = Math.max(22, durH * HOUR_PX - 4);
                        const ks   = KIND_STYLE[block.kind] ?? KIND_STYLE.task;
                        const owner = canSeeTeam
                          ? users.find((u) => u.id === block.userId)
                          : null;

                        return (
                          <div
                            key={block.id}
                            className={`absolute left-1 right-1 rounded-lg border px-2 py-1 cursor-pointer hover:brightness-95 transition-all ${ks.bg} ${ks.border} ${ks.text}`}
                            style={{ top, height: h, zIndex: 10 }}
                            onClick={(ev) => { ev.stopPropagation(); openEdit(block); }}
                          >
                            <p className="text-[11px] font-semibold leading-tight truncate">
                              {block.title}
                            </p>
                            {h > 36 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] opacity-60">{KIND_LABEL[block.kind]}</span>
                                {owner && (
                                  <>
                                    <span className="text-[10px] opacity-40">·</span>
                                    <span className="text-[10px] opacity-60">{owner.name.split(" ")[0]}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </Card>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Unscheduled tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Unscheduled this week</span>
                {sidebarTasks.length > 0 && (
                  <span className="text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {sidebarTasks.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {sidebarTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  All tasks are scheduled this week.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {sidebarTasks
                    .sort((a, b) => {
                      const p = { critical: 0, high: 1, medium: 2, low: 3 };
                      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
                    })
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 p-2 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground leading-tight truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <PriorityBadge priority={task.priority} />
                            {task.dueDate && (
                              <span className={`text-[10px] ${task.dueDate < todayStr ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                Due {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openScheduleTask(task)}
                          title="Schedule this task"
                          className="shrink-0 p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity (manager / admin) */}
          {canSeeTeam && capacitySummary.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Team capacity this week</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {capacitySummary.map(({ user, scheduledHours, capacityHours, loadPercent, overloaded }) => (
                  <div key={user.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px]">{user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                          {user.name.split(" ")[0]}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold ${overloaded ? "text-red-600" : loadPercent >= 80 ? "text-amber-600" : "text-emerald-600"}`}>
                        {scheduledHours}h / {capacityHours}h
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${overloaded ? "bg-red-500" : loadPercent >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, loadPercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Blocked tasks in schedule */}
          {blockedInSchedule.length > 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700 flex items-center gap-1.5">
                  <ZapOff className="w-3.5 h-3.5" />
                  Blocked tasks in schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-red-600 mb-2">
                  These tasks are blocked but still have scheduled time — consider rescheduling.
                </p>
                <div className="space-y-1">
                  {blockedInSchedule.map((b) => (
                    <div key={b.id} className="text-xs text-red-700 flex items-center gap-1.5 py-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{b.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Urgent unscheduled (if different from the main unscheduled list) */}
          {urgentTasks.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Urgent &amp; unscheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {urgentTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs text-amber-900 truncate flex-1">{t.title}</p>
                      <button
                        onClick={() => openScheduleTask(t)}
                        className="shrink-0 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Schedule
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.entries(KIND_LABEL) as [BlockKind, string][]).map(([kind, label]) => {
          const s = KIND_STYLE[kind];
          return (
            <div key={kind} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm border ${s.bg} ${s.border}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 ml-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Click any empty slot to schedule
        </div>
      </div>

      {/* ── Block dialog ─────────────────────────────────────────────────────── */}
      <BlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingBlock={editingBlock}
        prefill={prefill}
        currentUser={currentUser}
        plannerUsers={plannerUsers}
        visibleTasks={visibleTasks}
        workspaceId={workspaceId}
        onSave={createBlock}
        onUpdate={updateBlock}
        onDelete={deleteBlock}
      />
    </div>
  );
}
