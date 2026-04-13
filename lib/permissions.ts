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

/** Admin can manage any team; manager can manage only teams they lead. */
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

// ── Scope helpers ──────────────────────────────────────────────────────────────

/** IDs of all teams this manager leads. Empty set for non-managers. */
export function getManagedTeamIds(user: User, teams: Team[]): Set<string> {
  if (user.role !== "manager") return new Set();
  return new Set(teams.filter((t) => t.managerId === user.id).map((t) => t.id));
}

/**
 * Users this actor is allowed to assign tasks to or add as collaborators.
 *   admin    → all workspace users
 *   manager  → self + all members of their managed teams
 *   employee → self only
 */
export function getScopedUsers(
  user: User,
  users: User[],
  teams: Team[]
): User[] {
  if (user.role === "admin") return users;

  if (user.role === "manager") {
    const managedIds = getManagedTeamIds(user, teams);
    const memberIds = new Set(
      teams
        .filter((t) => managedIds.has(t.id))
        .flatMap((t) => t.memberIds)
    );
    memberIds.add(user.id);
    return users.filter((u) => memberIds.has(u.id));
  }

  // employee — self only
  return users.filter((u) => u.id === user.id);
}

/**
 * Can `actor` set a task's primary owner (or collaborator) to `targetUserId`?
 * Delegates to getScopedUsers so the rule is defined in one place.
 */
export function canAssignTaskToUser(
  actor: User,
  targetUserId: string,
  users: User[],
  teams: Team[]
): boolean {
  return getScopedUsers(actor, users, teams).some((u) => u.id === targetUserId);
}

// ── Invite / role management ───────────────────────────────────────────────────

/** Only admins may create invites. */
export function canInviteUser(inviter: User): boolean {
  return inviter.role === "admin";
}

/** Only admins may change any user's role. Prevents self-promotion. */
export function canChangeUserRole(changer: User): boolean {
  return changer.role === "admin";
}

// ── Task permissions ───────────────────────────────────────────────────────────

/**
 * Can `user` edit this task?
 *   admin    → always
 *   manager  → if task belongs to a team they manage, OR they own/collaborate
 *   employee → if they are the primary owner or a collaborator
 */
export function canEditTask(user: User, task: Task, teams: Team[]): boolean {
  if (user.role === "admin") return true;
  if (task.primaryOwnerId === user.id || task.collaboratorIds.includes(user.id)) return true;
  if (user.role === "manager") {
    return getManagedTeamIds(user, teams).has(task.teamId);
  }
  return false;
}

/**
 * Can `user` delete this task?
 * Same team-scoped rule as edit; employees may also delete tasks they created.
 */
export function canDeleteTask(user: User, task: Task, teams: Team[]): boolean {
  if (user.role === "admin") return true;
  if (task.creatorId === user.id) return true;
  if (user.role === "manager") {
    return getManagedTeamIds(user, teams).has(task.teamId);
  }
  return false;
}

/**
 * Can `user` reassign the primary owner of this task?
 * Admins always; managers only within their managed team scope.
 */
export function canReassignTask(user: User, task: Task, teams: Team[]): boolean {
  if (user.role === "admin") return true;
  if (user.role === "manager") {
    return (
      getManagedTeamIds(user, teams).has(task.teamId) ||
      task.primaryOwnerId === user.id
    );
  }
  return false;
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
    const myTeamIds = getManagedTeamIds(user, teams);
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
