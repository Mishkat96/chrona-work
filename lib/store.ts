import { tasks as seedTasks, type Task } from "./mock-data";

export const STORAGE_KEY = "chrona:tasks:v1";

// ── Persistence ────────────────────────────────────────────────────────────────

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [...seedTasks];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedTasks];
    return JSON.parse(raw) as Task[];
  } catch {
    return [...seedTasks];
  }
}

export function persistTasks(tasks: Task[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}

export function clearPersistedTasks(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ── ID generation ──────────────────────────────────────────────────────────────

export function genId(prefix = "t"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Date helpers ───────────────────────────────────────────────────────────────

/** Returns today as YYYY-MM-DD in local time. */
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns ISO timestamp string. */
export function nowIso(): string {
  return new Date().toISOString();
}
