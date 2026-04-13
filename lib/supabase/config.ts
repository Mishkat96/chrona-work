/**
 * Deterministic UUIDs for seed entities.
 * These match the values in supabase/seed.sql exactly.
 * Used by the app to scope queries and map legacy mock-data IDs to real DB IDs.
 */

// ── Workspace ─────────────────────────────────────────────────────────────────

export const WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";

// ── Dev current user (Sarah Chen / admin) ─────────────────────────────────────
// Phase 3: no real auth — the app runs as this user.

export const DEV_USER_ID = "22222222-2222-2222-2222-000000000001";

// ── User ID map: mock-data short IDs → Supabase UUIDs ────────────────────────

export const USER_ID_MAP: Record<string, string> = {
  u0: "22222222-2222-2222-2222-000000000001", // Sarah Chen  (admin)
  u1: "22222222-2222-2222-2222-000000000002", // Olivia Chen (employee)
  u2: "22222222-2222-2222-2222-000000000003", // James Kwon  (manager)
  u3: "22222222-2222-2222-2222-000000000004", // Priya Nair  (manager)
  u4: "22222222-2222-2222-2222-000000000005", // Marcus Reid (manager)
  u5: "22222222-2222-2222-2222-000000000006", // Sofia Alvarez (employee)
  u6: "22222222-2222-2222-2222-000000000007", // Ethan Brooks (employee)
  u7: "22222222-2222-2222-2222-000000000008", // Aisha Okafor (employee)
  u8: "22222222-2222-2222-2222-000000000009", // David Park   (employee)
};

// ── Team ID map: mock-data slug IDs → Supabase UUIDs ─────────────────────────

export const TEAM_ID_MAP: Record<string, string> = {
  "team-eng":     "33333333-3333-3333-3333-000000000001",
  "team-design":  "33333333-3333-3333-3333-000000000002",
  "team-product": "33333333-3333-3333-3333-000000000003",
  "team-mkt":     "33333333-3333-3333-3333-000000000004",
  "team-data":    "33333333-3333-3333-3333-000000000005",
  "team-cs":      "33333333-3333-3333-3333-000000000006",
};

// ── Project ID map: mock-data slug IDs → Supabase UUIDs ──────────────────────

export const PROJECT_ID_MAP: Record<string, string> = {
  "proj-platform-v24": "44444444-4444-4444-4444-000000000001",
  "proj-platform-sec": "44444444-4444-4444-4444-000000000002",
  "proj-product-v24":  "44444444-4444-4444-4444-000000000003",
  "proj-design-sys":   "44444444-4444-4444-4444-000000000004",
  "proj-q-plan":       "44444444-4444-4444-4444-000000000005",
  "proj-mkt-q2":       "44444444-4444-4444-4444-000000000006",
  "proj-data-plat":    "44444444-4444-4444-4444-000000000007",
  "proj-cs-q2":        "44444444-4444-4444-4444-000000000008",
};

/** Resolve any ID through all maps. Returns the ID unchanged if not found. */
export function resolveId(
  id: string,
  ...maps: Record<string, string>[]
): string {
  for (const map of maps) {
    if (id in map) return map[id];
  }
  return id;
}
