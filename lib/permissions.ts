/**
 * Role-based permission helpers.
 * Keep all permission logic here — never scatter it across components.
 */

import type { User, Task, Team } from "./mock-data";

// ── Role predicates ────────────────────────────────────────────────────────────

export const isAdmin    = (u: User): boolean => u.role === "admin";
export const isManager  = (u: User): boolean => u.role === "manager";
export const isEmployee = (u: User): boolean => u.role === "employee";

// ── Workspace / team management ────────────────────────────────────────────────

export function canManageWorkspace(user: User): boolean {
  return user.role === "admin";
}

/** Admin can manage any team; manager can manage a team they lead. */
export function canManageTeam(
  user: User,
  teamId: string,
  teams: Team[]
): boolean {
  if (user.role === "admin") return true;
  if (user.role === "manager") {
    return teams.some((t) => t.id === teamId && t.managerId === user.id);
  }
  return false;
}

// ── Task permissions ───────────────────────────────────────────────────────────

export function canEditTask(user: User, task: Task): boolean {
  if (user.role === "admin" || user.role === "manager") return true;
  return (
    task.primaryOwnerId === user.id ||
    task.collaboratorIds.includes(user.id)
  );
}

export function canDeleteTask(user: User, task: Task): boolean {
  if (user.role === "admin" || user.role === "manager") return true;
  return task.creatorId === user.id;
}

/** Only admin and manager can reassign the primary owner of a task. */
export function canReassignTask(user: User): boolean {
  return user.role === "admin" || user.role === "manager";
}

// ── Task visibility ────────────────────────────────────────────────────────────

/**
 * Returns the subset of tasks this user should see.
 *
 * admin    → all tasks in the workspace
 * manager  → tasks on any team they manage + tasks they own or collaborate on
 * employee → tasks they own or collaborate on
 */
export function getVisibleTasks(
  user: User,
  tasks: Task[],
  teams: Team[]
): Task[] {
  if (user.role === "admin") return tasks;

  if (user.role === "manager") {
    const myTeamIds = new Set(
      teams.filter((t) => t.managerId === user.id).map((t) => t.id)
    );
    return tasks.filter(
      (t) =>
        myTeamIds.has(t.teamId) ||
        t.primaryOwnerId === user.id ||
        t.collaboratorIds.includes(user.id)
    );
  }

  // employee
  return tasks.filter(
    (t) =>
      t.primaryOwnerId === user.id || t.collaboratorIds.includes(user.id)
  );
}
