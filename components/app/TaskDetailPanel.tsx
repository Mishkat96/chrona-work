"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Pencil,
  Trash2,
  Send,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskStatusBadge, getStatusLabel } from "@/components/app/TaskStatusBadge";
import { PriorityBadge } from "@/components/app/PriorityBadge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { TaskDialog } from "@/components/app/TaskDialog";
import { useTasks } from "@/lib/store-context";
import { users, projects, type Task, type TaskStatus } from "@/lib/mock-data";
import { todayStr, nowIso, genId } from "@/lib/store";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked",     label: "Blocked" },
  { value: "done",        label: "Done" },
];

function formatCommentTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)  return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  task: Task;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: Props) {
  const { updateTask, deleteTask, addComment, currentUser } = useTasks();

  const [editOpen, setEditOpen]       = useState(false);
  const [commentText, setCommentText] = useState("");
  const [confirmDel, setConfirmDel]   = useState(false);
  // Inline blocked reason capture when changing status to "blocked"
  const [pendingBlocked, setPendingBlocked] = useState(false);
  const [blockedInput, setBlockedInput]     = useState("");

  const owner         = users.find((u) => u.id === task.primaryOwnerId);
  const project       = projects.find((p) => p.id === task.projectId);
  const collaborators = task.collaboratorIds
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as (typeof users)[number][];

  const progress =
    task.estimatedHours > 0
      ? Math.round((task.loggedHours / task.estimatedHours) * 100)
      : 0;

  const today   = todayStr();
  const overdue = task.dueDate && task.dueDate < today && task.status !== "done";

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleStatusChange(newStatus: TaskStatus) {
    if (newStatus === "blocked") {
      setPendingBlocked(true);
      setBlockedInput(task.blockedReason ?? "");
      return;
    }
    applyStatusChange(newStatus, undefined);
  }

  function applyStatusChange(newStatus: TaskStatus, blockedReason: string | undefined) {
    const oldLabel = getStatusLabel(task.status);
    const newLabel = getStatusLabel(newStatus);
    const activityEntry = {
      id: genId("c"),
      authorId: currentUser.id,
      body: `Status changed from "${oldLabel}" to "${newLabel}".`,
      createdAt: nowIso(),
      type: "activity" as const,
    };
    updateTask({
      ...task,
      status: newStatus,
      blockedReason: newStatus === "blocked" ? blockedReason : undefined,
      comments: [...task.comments, activityEntry],
    });
    setPendingBlocked(false);
    setBlockedInput("");
  }

  function handleUnblock() {
    applyStatusChange("in_progress", undefined);
  }

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    addComment(task.id, commentText);
    setCommentText("");
  }

  function handleDelete() {
    deleteTask(task.id);
    onClose();
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-80 shrink-0 bg-white border-l border-border flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <span className="text-xs font-semibold text-foreground">Task detail</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Edit task"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Title + description */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            {/* Blocked reason alert */}
            {task.status === "blocked" && task.blockedReason && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-600 mb-0.5">Blocker</p>
                    <p className="text-xs text-red-500 leading-relaxed">{task.blockedReason}</p>
                    <button
                      onClick={handleUnblock}
                      className="mt-2 text-[11px] font-semibold text-red-600 hover:text-red-700 underline"
                    >
                      Mark as unblocked →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending: enter blocker reason */}
            {pendingBlocked && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
                <p className="text-xs font-semibold text-red-600">Enter blocker reason</p>
                <textarea
                  value={blockedInput}
                  onChange={(e) => setBlockedInput(e.target.value)}
                  rows={2}
                  placeholder="What is blocking this task?"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-red-200 bg-white focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-6 px-3 text-xs bg-red-500 hover:bg-red-600"
                    onClick={() => applyStatusChange("blocked", blockedInput)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-3 text-xs"
                    onClick={() => { setPendingBlocked(false); setBlockedInput(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Status selector */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Status
              </p>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue>
                    <TaskStatusBadge status={task.status} variant="icon" />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      <TaskStatusBadge status={s.value} variant="icon" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Priority</p>
                <PriorityBadge priority={task.priority} className="text-[10px]" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Project</p>
                <p className="text-xs font-medium text-foreground truncate">{project?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Due date</p>
                <p className={`text-xs font-medium ${overdue ? "text-red-500" : "text-foreground"}`}>
                  {overdue && <Clock3 className="w-3 h-3 inline mr-1" />}
                  {task.dueDate || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Est. hours</p>
                <p className="text-xs font-medium text-foreground">
                  {task.loggedHours}h / {task.estimatedHours}h
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {task.estimatedHours > 0 && (
              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {/* Owner */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Owner</p>
              {owner ? (
                <div className="flex items-center gap-2">
                  <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{owner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{owner.jobTitle}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Unassigned</p>
              )}
            </div>

            {/* Collaborators */}
            {collaborators.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Collaborators
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
                      <UserAvatar initials={c.initials} size="xs" />
                      <span className="text-[10px] text-foreground">{c.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Activity */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Comments & activity
              </p>

              {/* List */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {[...task.comments].reverse().map((c) => {
                  const author = users.find((u) => u.id === c.authorId);
                  const isActivity = c.type === "activity";
                  return (
                    <div
                      key={c.id}
                      className={`flex gap-2 ${isActivity ? "opacity-60" : ""}`}
                    >
                      <UserAvatar
                        initials={author?.initials ?? "?"}
                        size="xs"
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] font-semibold text-foreground">
                            {author?.name ?? "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatCommentTime(c.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed mt-0.5 ${
                            isActivity ? "text-muted-foreground italic" : "text-foreground"
                          }`}
                        >
                          {c.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {task.comments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No activity yet.
                  </p>
                )}
              </div>

              {/* Add comment */}
              <div className="flex gap-2 mt-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  placeholder="Add a comment…"
                  className="flex-1 h-8 px-3 text-xs rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                />
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-border">
              {confirmDel ? (
                <div className="space-y-2">
                  <p className="text-xs text-red-500 font-medium">
                    Delete this task permanently?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-red-500 hover:bg-red-600"
                      onClick={handleDelete}
                    >
                      Yes, delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => setConfirmDel(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDel(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete task
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <TaskDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
