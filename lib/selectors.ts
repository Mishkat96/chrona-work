/**
 * Pure derived-data selectors.
 * All functions are side-effect-free and can be used anywhere.
 */

import type { Task, User, Team } from "./mock-data";

// ── Task filters ───────────────────────────────────────────────────────────────

export function getOverdueTasks(tasks: Task[], today: string): Task[] {
  return tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "done"
  );
}

export function getBlockedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status === "blocked");
}

export function getDueThisWeek(tasks: Task[], today: string): Task[] {
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  const endStr = end.toISOString().slice(0, 10);
  return tasks.filter(
    (t) =>
      t.dueDate &&
      t.dueDate >= today &&
      t.dueDate <= endStr &&
      t.status !== "done"
  );
}

export function getOpenTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== "done");
}

// ── User-scoped ────────────────────────────────────────────────────────────────

/** Tasks where userId is primary owner OR collaborator. */
export function getMyTasks(tasks: Task[], userId: string): Task[] {
  return tasks.filter(
    (t) =>
      t.primaryOwnerId === userId || t.collaboratorIds.includes(userId)
  );
}

export function getOwnedTasks(tasks: Task[], userId: string): Task[] {
  return tasks.filter((t) => t.primaryOwnerId === userId);
}

export function getCollaboratingTasks(tasks: Task[], userId: string): Task[] {
  return tasks.filter(
    (t) =>
      t.primaryOwnerId !== userId && t.collaboratorIds.includes(userId)
  );
}

/** Open (not done) tasks owned by a user. */
export function getUserOpenTaskCount(tasks: Task[], userId: string): number {
  return tasks.filter(
    (t) => t.primaryOwnerId === userId && t.status !== "done"
  ).length;
}

// ── Team-scoped ────────────────────────────────────────────────────────────────

export function getTeamTasks(tasks: Task[], teamId: string): Task[] {
  return tasks.filter((t) => t.teamId === teamId);
}

/**
 * All tasks visible to a manager:
 *   - tasks on any team they lead
 *   - tasks they are the primary owner of
 *   - tasks they collaborate on
 * Mirrors the same union used by getVisibleTasks in permissions.ts.
 */
export function getManagedTeamTasks(
  tasks: Task[],
  teams: Team[],
  managerId: string
): Task[] {
  const teamIds = new Set(
    teams.filter((t) => t.managerId === managerId).map((t) => t.id)
  );
  return tasks.filter(
    (t) =>
      teamIds.has(t.teamId) ||
      t.primaryOwnerId === managerId ||
      t.collaboratorIds.includes(managerId)
  );
}

// ── Stats ──────────────────────────────────────────────────────────────────────

export interface WorkspaceStats {
  total: number;
  done: number;
  blocked: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
}

export function getWorkspaceStats(
  tasks: Task[],
  today: string
): WorkspaceStats {
  const total          = tasks.length;
  const done           = tasks.filter((t) => t.status === "done").length;
  const blocked        = tasks.filter((t) => t.status === "blocked").length;
  const overdue        = getOverdueTasks(tasks, today).length;
  const dueToday       = tasks.filter(
    (t) => t.dueDate === today && t.status !== "done"
  ).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, blocked, overdue, dueToday, completionRate };
}

export interface TeamStats {
  total: number;
  open: number;
  blocked: number;
  overdue: number;
  avgWorkload: number;
}

export function getTeamStats(
  tasks: Task[],
  team: Team,
  users: User[],
  today: string
): TeamStats {
  const tt      = getTeamTasks(tasks, team.id);
  const members = users.filter((u) => team.memberIds.includes(u.id));
  const avgWorkload =
    members.length > 0
      ? Math.round(
          members.reduce((s, u) => s + u.workload, 0) / members.length
        )
      : 0;
  return {
    total: tt.length,
    open:  tt.filter((t) => t.status !== "done").length,
    blocked: tt.filter((t) => t.status === "blocked").length,
    overdue: getOverdueTasks(tt, today).length,
    avgWorkload,
  };
}
