import { supabase } from "@/lib/supabase/client";
import type { Notification } from "@/lib/mock-data";

// ── DB row shape ───────────────────────────────────────────────────────────────

interface DbNotification {
  id: string;
  workspace_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapNotification(row: DbNotification): Notification {
  return {
    id:          row.id,
    workspaceId: row.workspace_id,
    userId:      row.user_id,
    type:        row.type as Notification["type"],
    title:       row.title,
    body:        row.body,
    taskId:      row.task_id ?? undefined,
    read:        row.read,
    createdAt:   row.created_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function fetchNotifications(
  userId: string,
  workspaceId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllNotificationsRead(
  userId: string,
  workspaceId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("read", false);

  if (error) throw error;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface NewNotificationDraft {
  workspaceId: string;
  userId: string;
  type: Notification["type"];
  title: string;
  body: string;
  taskId?: string;
}

export async function createNotificationInDb(
  draft: NewNotificationDraft
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    workspace_id: draft.workspaceId,
    user_id:      draft.userId,
    type:         draft.type,
    title:        draft.title,
    body:         draft.body,
    task_id:      draft.taskId ?? null,
  });

  if (error) throw error;
}
