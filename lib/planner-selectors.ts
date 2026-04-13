/**
 * Planner selectors — all pure functions, no side-effects, no DB calls.
 * Import these in pages and components that need derived planning data.
 */

import type { ScheduleBlock, Task, User } from "./mock-data";

// ── Date utilities ─────────────────────────────────────────────────────────────

/** Returns Monday 00:00:00 local time for the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the Monday 00:00:00 exactly 7 days after weekStart (exclusive upper bound). */
export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 7);
  return d;
}

/** Add / subtract N whole weeks from a date. */
export function addWeeks(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
}

/** YYYY-MM-DD in local time. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "Apr 14 – Apr 18, 2026" for a given week start (Monday). */
export function formatWeekLabel(weekStart: Date): string {
  const friday = new Date(weekStart);
  friday.setDate(friday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const yearOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} – ${friday.toLocaleDateString("en-US", yearOpts)}`;
}

// ── Block duration ─────────────────────────────────────────────────────────────

/** Duration of a block in fractional hours. */
export function blockDurationHours(block: ScheduleBlock): number {
  return (
    (new Date(block.endsAt).getTime() - new Date(block.startsAt).getTime()) / 3_600_000
  );
}

// ── Scheduled hours ────────────────────────────────────────────────────────────

/**
 * Total scheduled hours for a user across the given block array.
 * Pass `day` (YYYY-MM-DD) to narrow to a single day.
 */
export function scheduledHoursForUser(
  blocks: ScheduleBlock[],
  userId: string,
  day?: string
): number {
  return blocks
    .filter((b) => {
      if (b.userId !== userId) return false;
      if (day) return isoDate(new Date(b.startsAt)) === day;
      return true;
    })
    .reduce((sum, b) => sum + blockDurationHours(b), 0);
}

/**
 * Scheduled hours broken down by day for a single user in the visible week.
 * Returns an object keyed by YYYY-MM-DD, initialised for all 5 weekdays.
 */
export function scheduledHoursByDay(
  blocks: ScheduleBlock[],
  userId: string,
  weekStart: Date
): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    result[isoDate(d)] = 0;
  }
  blocks
    .filter((b) => b.userId === userId)
    .forEach((b) => {
      const key = isoDate(new Date(b.startsAt));
      if (key in result) result[key] = (result[key] ?? 0) + blockDurationHours(b);
    });
  return result;
}

// ── Capacity ───────────────────────────────────────────────────────────────────

const DEFAULT_WEEKLY_HOURS = 40;

/**
 * Remaining capacity (hours) for a user given their availability setting
 * and their already-scheduled blocks for the week.
 */
export function remainingCapacityHours(
  blocks: ScheduleBlock[],
  user: User,
  weekStart: Date
): number {
  const weekEnd = getWeekEnd(weekStart);
  const weekBlocks = blocks.filter((b) => {
    const t = new Date(b.startsAt).getTime();
    return (
      b.userId === user.id &&
      t >= weekStart.getTime() &&
      t < weekEnd.getTime()
    );
  });
  const scheduled = weekBlocks.reduce((s, b) => s + blockDurationHours(b), 0);
  const capacity = user.availability ?? DEFAULT_WEEKLY_HOURS;
  return Math.max(0, capacity - scheduled);
}

/** Days in the current week where a user has > `threshold` hours scheduled (default 8 h). */
export function overloadedDays(
  blocks: ScheduleBlock[],
  userId: string,
  weekStart: Date,
  threshold = 8
): string[] {
  const byDay = scheduledHoursByDay(blocks, userId, weekStart);
  return Object.entries(byDay)
    .filter(([, h]) => h > threshold)
    .map(([day]) => day);
}

// ── Task scheduling links ──────────────────────────────────────────────────────

/** Set of task IDs that have at least one schedule block in the given array. */
export function scheduledTaskIds(blocks: ScheduleBlock[]): Set<string> {
  const ids = new Set<string>();
  blocks.forEach((b) => { if (b.taskId) ids.add(b.taskId); });
  return ids;
}

/** Total hours already scheduled specifically for a task. */
export function scheduledHoursForTask(blocks: ScheduleBlock[], taskId: string): number {
  return blocks
    .filter((b) => b.taskId === taskId)
    .reduce((s, b) => s + blockDurationHours(b), 0);
}

/**
 * Remaining work for a task:
 *   estimated_hours − logged_hours − already_scheduled_hours
 * Clamped to 0 so it never goes negative.
 */
export function taskRemainingWork(task: Task, blocks: ScheduleBlock[]): number {
  return Math.max(
    0,
    task.estimatedHours - task.loggedHours - scheduledHoursForTask(blocks, task.id)
  );
}

// ── Unscheduled task selectors ─────────────────────────────────────────────────

/**
 * Tasks assigned to `userId` that are not done and still have remaining work
 * after accounting for already-scheduled blocks.
 * A task with any blocks but remaining hours > 0 is still "needs scheduling".
 */
export function unscheduledTasksForUser(
  tasks: Task[],
  blocks: ScheduleBlock[],
  userId: string
): Task[] {
  return tasks.filter(
    (t) =>
      (t.primaryOwnerId === userId || t.collaboratorIds.includes(userId)) &&
      t.status !== "done" &&
      taskRemainingWork(t, blocks) > 0
  );
}

/**
 * Critical or high-priority tasks across all visible tasks that are not done
 * and still have remaining work. Pass `userId` to narrow to a specific person.
 */
export function urgentUnscheduledTasks(
  tasks: Task[],
  blocks: ScheduleBlock[],
  userId?: string
): Task[] {
  return tasks.filter(
    (t) =>
      (t.priority === "critical" || t.priority === "high") &&
      t.status !== "done" &&
      taskRemainingWork(t, blocks) > 0 &&
      (userId === undefined ||
        t.primaryOwnerId === userId ||
        t.collaboratorIds.includes(userId))
  );
}

/**
 * Tasks due within `daysAhead` days from today that are not done
 * and have no schedule block.
 */
export function dueSoonUnscheduledTasks(
  tasks: Task[],
  blocks: ScheduleBlock[],
  daysAhead: number,
  userId?: string
): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return tasks.filter((t) => {
    if (t.status === "done" || !t.dueDate) return false;
    if (taskRemainingWork(t, blocks) === 0) return false;
    const due = new Date(t.dueDate);
    if (due < today || due > cutoff) return false;
    if (userId && t.primaryOwnerId !== userId && !t.collaboratorIds.includes(userId))
      return false;
    return true;
  });
}

/**
 * Schedule blocks that are linked to tasks currently in "blocked" status.
 * Useful for surfacing wasted planning.
 */
export function blockedTasksInSchedule(
  tasks: Task[],
  blocks: ScheduleBlock[]
): ScheduleBlock[] {
  const blockedIds = new Set(
    tasks.filter((t) => t.status === "blocked").map((t) => t.id)
  );
  return blocks.filter((b) => b.taskId && blockedIds.has(b.taskId));
}

// ── Capacity summary ───────────────────────────────────────────────────────────

export interface UserCapacitySummary {
  user:           User;
  scheduledHours: number;
  capacityHours:  number;
  remainingHours: number;
  loadPercent:    number;
  overloaded:     boolean;
}

/**
 * Per-user capacity summary for the current week.
 * `users`  — the subset to include (already role-filtered by caller)
 * `blocks` — the blocks loaded for this week
 */
export function teamCapacitySummary(
  users: User[],
  blocks: ScheduleBlock[],
  weekStart: Date
): UserCapacitySummary[] {
  const weekEnd = getWeekEnd(weekStart);
  return users.map((user) => {
    const userBlocks = blocks.filter((b) => {
      const t = new Date(b.startsAt).getTime();
      return b.userId === user.id && t >= weekStart.getTime() && t < weekEnd.getTime();
    });
    const scheduledHours = Math.round(
      userBlocks.reduce((s, b) => s + blockDurationHours(b), 0) * 10
    ) / 10;
    const capacityHours  = user.availability ?? DEFAULT_WEEKLY_HOURS;
    const remainingHours = Math.round(Math.max(0, capacityHours - scheduledHours) * 10) / 10;
    const loadPercent    = capacityHours > 0
      ? Math.round((scheduledHours / capacityHours) * 100)
      : 0;
    return {
      user,
      scheduledHours,
      capacityHours,
      remainingHours,
      loadPercent,
      overloaded: loadPercent > 100,
    };
  });
}
