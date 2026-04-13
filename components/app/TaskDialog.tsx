"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Task,
  type TaskStatus,
  type Priority,
} from "@/lib/mock-data";
import { useTasks, type NewTaskDraft } from "@/lib/store-context";
import { getScopedUsers } from "@/lib/permissions";
import { todayStr } from "@/lib/store";
import { UserAvatar } from "@/components/app/UserAvatar";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked",     label: "Blocked" },
  { value: "done",        label: "Done" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high",     label: "High" },
  { value: "medium",   label: "Medium" },
  { value: "low",      label: "Low" },
];

function buildDefault(currentUserId: string): NewTaskDraft {
  return {
    title: "",
    description: "",
    status: "not_started",
    priority: "medium",
    dueDate: "",
    primaryOwnerId: currentUserId,
    collaboratorIds: [],
    creatorId: currentUserId,
    teamId: "",
    projectId: "",
    tags: [],
    estimatedHours: 0,
    loggedHours: 0,
  };
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog opens in edit mode. */
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, task }: Props) {
  const { createTask, updateTask, currentUser, users, teams, projects } = useTasks();
  const isEdit = !!task;

  const scopedUsers        = currentUser ? getScopedUsers(currentUser, users, teams) : [];
  const scopedCollaborators = scopedUsers.filter((u) => u.id !== currentUser?.id);

  const [form, setForm] = useState<NewTaskDraft>(() => buildDefault(currentUser?.id ?? ""));
  const [tagsInput, setTagsInput] = useState("");

  // Sync form when dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, comments: _cm, ...draft } = task;
        setForm(draft);
        setTagsInput(task.tags.join(", "));
      } else {
        setForm(buildDefault(currentUser?.id ?? ""));
        setTagsInput("");
      }
    }
  }, [open, task, currentUser?.id]);

  // Auto-fill teamId when project changes
  function handleProjectChange(projectId: string) {
    const proj = projects.find((p) => p.id === projectId);
    setForm((f) => ({ ...f, projectId, teamId: proj?.teamId ?? "" }));
  }

  function toggleCollaborator(userId: string) {
    setForm((f) => ({
      ...f,
      collaboratorIds: f.collaboratorIds.includes(userId)
        ? f.collaboratorIds.filter((id) => id !== userId)
        : [...f.collaboratorIds, userId],
    }));
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload: NewTaskDraft = { ...form, tags };

    if (isEdit && task) {
      updateTask({ ...task, ...payload });
    } else {
      createTask(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        {/* ── Form body ──────────────────────────────────────────────────── */}
        <div className="px-6 py-4 space-y-5">

          {/* Title */}
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
            />
          </Field>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority">
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Due date + Estimated hours */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date">
              <input
                type="date"
                value={form.dueDate}
                min={todayStr()}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </Field>

            <Field label="Estimated hours">
              <input
                type="number"
                min={0}
                value={form.estimatedHours || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estimatedHours: Number(e.target.value) }))
                }
                placeholder="0"
                className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </Field>
          </div>

          {/* Primary owner + Project */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary owner">
              <Select
                value={form.primaryOwnerId}
                onValueChange={(v) => setForm((f) => ({ ...f, primaryOwnerId: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopedUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={u.initials} size="xs" />
                        {u.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Project">
              <Select
                value={form.projectId}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Collaborators */}
          <Field label="Collaborators">
            <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-card min-h-[42px]">
              {scopedCollaborators.map((u) => {
                const active = form.collaboratorIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleCollaborator(u.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      active
                        ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <UserAvatar initials={u.initials} size="xs" />
                    {u.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Blocked reason — only shown when status is blocked */}
          {form.status === "blocked" && (
            <Field label="Blocked reason *">
              <textarea
                value={form.blockedReason ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, blockedReason: e.target.value }))}
                placeholder="Describe what is blocking this task…"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors resize-none placeholder:text-red-300"
              />
            </Field>
          )}

          {/* Logged hours — only in edit mode */}
          {isEdit && (
            <Field label="Logged hours">
              <input
                type="number"
                min={0}
                value={form.loggedHours || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, loggedHours: Number(e.target.value) }))
                }
                placeholder="0"
                className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </Field>
          )}

          {/* Tags */}
          <Field label="Tags (comma-separated)">
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="design, ux, frontend"
              className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </Field>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!form.title.trim()}>
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
