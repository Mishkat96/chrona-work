import { supabase } from "@/lib/supabase/client";
import type { User, UserRole, OnlineStatus } from "@/lib/mock-data";

// ── DB row shape ───────────────────────────────────────────────────────────────

interface DbUser {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: string;
  job_title: string;
  department: string;
  initials: string;
  online_status: string;
  workload: number;
  tasks_assigned: number;
  tasks_completed: number;
  availability: number;
  auth_id: string | null;
  created_at: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapUser(row: DbUser): User {
  return {
    id:             row.id,
    name:           row.name,
    email:          row.email,
    role:           row.role as UserRole,
    jobTitle:       row.job_title,
    department:     row.department,
    initials:       row.initials,
    onlineStatus:   row.online_status as OnlineStatus,
    workload:       row.workload,
    tasksAssigned:  row.tasks_assigned,
    tasksCompleted: row.tasks_completed,
    availability:   row.availability,
    authId:         row.auth_id ?? undefined,
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchUsers(workspaceId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapUser);
}

export async function fetchUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data ? mapUser(data) : null;
}

/**
 * Look up a user by their Supabase auth ID (across all workspaces).
 * Returns the user + their workspace_id so the store can load the correct data.
 */
export async function fetchUserByAuthId(
  authId: string
): Promise<{ user: User; workspaceId: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error || !data) return null;
  return { user: mapUser(data), workspaceId: data.workspace_id };
}

/**
 * Look up a user by email (across all workspaces).
 * Used to link seed / invited users on their first sign-in.
 */
export async function fetchUserByEmail(
  email: string
): Promise<{ user: User; workspaceId: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) return null;
  return { user: mapUser(data), workspaceId: data.workspace_id };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateUserRoleInDb(
  userId: string,
  role: UserRole
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
}

/**
 * Sets auth_id on an existing user row (called on first sign-in for seed / invited users).
 */
export async function linkAuthId(
  userId: string,
  authId: string
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ auth_id: authId })
    .eq("id", userId);

  if (error) throw error;
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface NewUserDraft {
  workspaceId: string;
  authId: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle?: string;
  department?: string;
  initials: string;
}

/**
 * Creates a new user row linked to an existing workspace.
 * Used during sign-up when no existing user matches the email.
 */
export async function createUserInDb(draft: NewUserDraft): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      workspace_id:    draft.workspaceId,
      auth_id:         draft.authId,
      name:            draft.name,
      email:           draft.email,
      role:            draft.role,
      job_title:       draft.jobTitle    ?? "",
      department:      draft.department  ?? "",
      initials:        draft.initials,
      online_status:   "online",
      workload:        0,
      tasks_assigned:  0,
      tasks_completed: 0,
      availability:    40,
    })
    .select()
    .single();

  if (error) throw error;
  return mapUser(data);
}
