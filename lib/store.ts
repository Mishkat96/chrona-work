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
