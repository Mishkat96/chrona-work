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
