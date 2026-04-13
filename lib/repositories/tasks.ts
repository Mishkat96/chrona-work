import { supabase } from "@/lib/supabase/client";
import type { Task, Comment, TaskStatus, Priority } from "@/lib/mock-data";
import { todayStr } from "@/lib/store";

// ── DB row shapes ──────────────────────────────────────────────────────────────

interface DbComment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  type: string;
  created_at: string;
}

interface DbTask {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  primary_owner_id: string | null;
  creator_id: string | null;
  team_id: string | null;
  project_id: string | null;
  blocked_reason: string | null;
  tags: string[];
  estimated_hours: number;
  logged_hours: number;
  created_at: string;
  updated_at: string;
  task_collaborators: { user_id: string }[];
  task_comments: DbComment[];
}

// ── Mappers ────────────────────────────────────────────────────────────────────

function mapComment(row: DbComment): Comment {
  return {
    id: row.id,
    authorId: row.author_id,
    body: row.body,
    type: row.type as Comment["type"],
    createdAt: row.created_at,
  };
}

function mapTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    status: row.status as TaskStatus,
    priority: row.priority as Priority,
    dueDate: row.due_date ?? "",
    primaryOwnerId: row.primary_owner_id ?? "",
    collaboratorIds: (row.task_collaborators ?? []).map((tc) => tc.user_id),
    creatorId: row.creator_id ?? "",
    teamId: row.team_id ?? "",
    projectId: row.project_id ?? "",
    blockedReason: row.blocked_reason ?? undefined,
    tags: row.tags ?? [],
    estimatedHours: Number(row.estimated_hours ?? 0),
    loggedHours: Number(row.logged_hours ?? 0),
    comments: (row.task_comments ?? [])
      .map(mapComment)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
  };
}

// ── Fetch ──────────────────────────────────────────────────────────────────────

export async function fetchTasks(workspaceId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      task_collaborators ( user_id ),
      task_comments ( id, task_id, author_id, body, type, created_at )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTask);
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createTaskInDb(
  draft: Omit<Task, "id" | "comments" | "createdAt" | "updatedAt">,
  workspaceId: string,
  creatorId: string
): Promise<Task> {
  const now = new Date().toISOString();

  const { data: row, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id:     workspaceId,
      title:            draft.title,
      description:      draft.description,
      status:           draft.status,
      priority:         draft.priority,
      due_date:         draft.dueDate || null,
      primary_owner_id: draft.primaryOwnerId || null,
      creator_id:       creatorId,
      team_id:          draft.teamId || null,
      project_id:       draft.projectId || null,
      blocked_reason:   draft.blockedReason ?? null,
      tags:             draft.tags,
      estimated_hours:  draft.estimatedHours,
      logged_hours:     draft.loggedHours,
      created_at:       now,
      updated_at:       now,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert collaborators
  if (draft.collaboratorIds.length > 0) {
    await supabase.from("task_collaborators").insert(
      draft.collaboratorIds.map((uid) => ({ task_id: row.id, user_id: uid }))
    );
  }

  // Insert "created" activity comment
  const { data: commentRow } = await supabase
    .from("task_comments")
    .insert({ task_id: row.id, author_id: creatorId, body: "Task created.", type: "activity" })
    .select()
    .single();

  const createdComment: Comment = commentRow
    ? mapComment(commentRow)
    : { id: `opt_${Date.now()}`, authorId: creatorId, body: "Task created.", type: "activity", createdAt: now };

  return mapTask({
    ...row,
    task_collaborators: draft.collaboratorIds.map((uid) => ({ user_id: uid })),
    task_comments: commentRow ? [commentRow] : [],
  });
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateTaskInDb(task: Task): Promise<void> {
  const { error: taskErr } = await supabase
    .from("tasks")
    .update({
      title:            task.title,
      description:      task.description,
      status:           task.status,
      priority:         task.priority,
      due_date:         task.dueDate || null,
      primary_owner_id: task.primaryOwnerId || null,
      team_id:          task.teamId || null,
      project_id:       task.projectId || null,
      blocked_reason:   task.blockedReason ?? null,
      tags:             task.tags,
      estimated_hours:  task.estimatedHours,
      logged_hours:     task.loggedHours,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", task.id);

  if (taskErr) throw taskErr;

  // Sync collaborators: delete all then re-insert
  await supabase.from("task_collaborators").delete().eq("task_id", task.id);
  if (task.collaboratorIds.length > 0) {
    await supabase
      .from("task_collaborators")
      .insert(task.collaboratorIds.map((uid) => ({ task_id: task.id, user_id: uid })));
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function deleteTaskInDb(taskId: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

// ── Comments ───────────────────────────────────────────────────────────────────

export async function insertComment(
  taskId: string,
  authorId: string,
  body: string,
  type: "comment" | "activity" = "comment"
): Promise<Comment> {
  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, author_id: authorId, body, type })
    .select()
    .single();

  if (error) throw error;
  return mapComment(data);
}

// ── Seed reset ─────────────────────────────────────────────────────────────────

/** Delete all tasks in a workspace (cascades to collaborators + comments). */
export async function deleteAllTasksInWorkspace(workspaceId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("workspace_id", workspaceId);

  if (error) throw error;
}
