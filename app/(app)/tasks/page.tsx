"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ChevronDown,
  Calendar,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TaskStatusBadge,
  getStatusIcon,
  getStatusLabel,
  getStatusIconClassName,
} from "@/components/app/TaskStatusBadge";
import { PriorityBadge, getPriorityDot } from "@/components/app/PriorityBadge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { TaskDialog } from "@/components/app/TaskDialog";
import { TaskDetailPanel } from "@/components/app/TaskDetailPanel";
import { useTasks } from "@/lib/store-context";
import {
  users,
  projects,
  type Task,
  type TaskStatus,
  type Priority,
} from "@/lib/mock-data";
import { todayStr } from "@/lib/store";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_GROUPS: TaskStatus[] = ["not_started", "in_progress", "blocked", "done"];

const PRIORITY_OPTIONS: { value: Priority | "all"; label: string }[] = [
  { value: "all",      label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high",     label: "High" },
  { value: "medium",   label: "Medium" },
  { value: "low",      label: "Low" },
];

// ── TaskRow ────────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  selected,
  onClick,
}: {
  task: Task;
  selected: boolean;
  onClick: () => void;
}) {
  const owner   = users.find((u) => u.id === task.primaryOwnerId);
  const project = projects.find((p) => p.id === task.projectId);
  const today   = todayStr();
  const overdue = task.dueDate && task.dueDate < today && task.status !== "done";
  const progress =
    task.estimatedHours > 0
      ? Math.round((task.loggedHours / task.estimatedHours) * 100)
      : 0;

  return (
    <tr
      onClick={onClick}
      className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
        selected ? "bg-indigo-50/60" : "hover:bg-muted/40"
      }`}
    >
      {/* Priority dot */}
      <td className="py-3 pl-4 pr-2 w-8">
        <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`} />
      </td>

      {/* Title + tags */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <TaskStatusBadge status={task.status} variant="icon" />
          <span className="text-sm font-medium text-foreground truncate max-w-[220px]">
            {task.title}
          </span>
          {overdue && (
            <span title="Overdue">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-6">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>

      {/* Project */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{project?.name ?? "—"}</span>
      </td>

      {/* Priority badge */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <PriorityBadge priority={task.priority} className="text-[10px]" />
      </td>

      {/* Due date */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <div
          className={`flex items-center gap-1.5 text-xs ${
            overdue ? "text-red-500 font-medium" : "text-muted-foreground"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {task.dueDate || "—"}
        </div>
      </td>

      {/* Progress */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <div className="flex items-center gap-2 w-28">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
        </div>
      </td>

      {/* Owner */}
      <td className="py-3 pr-4">
        {owner && (
          <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />
        )}
      </td>

      {/* Menu */}
      <td className="py-3 pr-3">
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { tasks } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen]         = useState(false);
  const [search, setSearch]                 = useState("");
  const [filterStatus, setFilterStatus]     = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterOwner, setFilterOwner]       = useState<string>("all");
  const [filterOverdue, setFilterOverdue]   = useState(false);

  const today = todayStr();

  // Live-lookup of selected task (so panel reflects latest store state)
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  // Close panel if the selected task was deleted
  const handleSelectTask = (task: Task) => {
    setSelectedTaskId((prev) => (prev === task.id ? null : task.id));
  };

  // Filtered + searched task list
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const project = projects.find((p) => p.id === t.projectId);

      // Search
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (project?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      // Status
      const matchStatus = filterStatus === "all" || t.status === filterStatus;

      // Priority
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;

      // Owner
      const matchOwner = filterOwner === "all" || t.primaryOwnerId === filterOwner;

      // Overdue
      const isOverdue = t.dueDate && t.dueDate < today && t.status !== "done";
      const matchOverdue = !filterOverdue || isOverdue;

      return matchSearch && matchStatus && matchPriority && matchOwner && matchOverdue;
    });
  }, [tasks, search, filterStatus, filterPriority, filterOwner, filterOverdue, today]);

  // Status tile counts (from full task list, not filtered)
  const statusCounts = useMemo(
    () =>
      STATUS_GROUPS.reduce<Record<string, number>>((acc, s) => {
        acc[s] = tasks.filter((t) => t.status === s).length;
        return acc;
      }, {}),
    [tasks]
  );

  const overdueCount = useMemo(
    () => tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done").length,
    [tasks, today]
  );

  const teamMembers = users.filter((u) => u.id !== "u0");

  const hasFilters =
    filterStatus !== "all" ||
    filterPriority !== "all" ||
    filterOwner !== "all" ||
    filterOverdue ||
    search !== "";

  function clearFilters() {
    setSearch("");
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterOwner("all");
    setFilterOverdue(false);
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-88px)] max-w-[1400px]">

      {/* ── Main panel ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Status summary tiles */}
        <div className="grid grid-cols-4 gap-3">
          {STATUS_GROUPS.map((s) => {
            const Icon   = getStatusIcon(s);
            const iconCls = getStatusIconClassName(s);
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                  filterStatus === s
                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <Icon className={`w-4 h-4 ${iconCls}`} />
                <div>
                  <div className="text-xs font-bold text-foreground">{statusCounts[s] ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">{getStatusLabel(s)}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Overdue callout */}
        {overdueCount > 0 && (
          <button
            onClick={() => setFilterOverdue(!filterOverdue)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all w-fit ${
              filterOverdue
                ? "border-red-300 bg-red-50 text-red-600"
                : "border-red-200 bg-red-50/60 text-red-500 hover:bg-red-50"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {overdueCount} overdue task{overdueCount !== 1 ? "s" : ""}
            {filterOverdue ? " — showing only overdue" : " — click to filter"}
          </button>
        )}

        {/* Task table card */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks, projects, tags…"
                  className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                />
              </div>

              {/* Priority filter */}
              <Select
                value={filterPriority}
                onValueChange={(v) => setFilterPriority(v as Priority | "all")}
              >
                <SelectTrigger className="h-8 w-36 text-xs border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Owner filter */}
              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="h-8 w-36 text-xs border-border">
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All owners</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar initials={u.initials} size="xs" />
                        {u.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Clear
                </button>
              )}

              <Button size="sm" className="ml-auto" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" /> New task
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                <tr className="border-b border-border">
                  <th className="py-2.5 pl-4 pr-2 w-8" />
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground">
                    Task
                  </th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                    Project
                  </th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                    Priority
                  </th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                    Due
                  </th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                    Progress
                  </th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground">
                    Owner
                  </th>
                  <th className="py-2.5 pr-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    selected={selectedTaskId === task.id}
                    onClick={() => handleSelectTask(task)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                      {hasFilters ? (
                        <>
                          No tasks match your filters.{" "}
                          <button
                            onClick={clearFilters}
                            className="text-indigo-500 hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          No tasks yet.{" "}
                          <button
                            onClick={() => setCreateOpen(true)}
                            className="text-indigo-500 hover:underline"
                          >
                            Create your first task
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel
            key={selectedTask.id}
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Create dialog ────────────────────────────────────────────── */}
      <TaskDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
