import { supabase } from "@/lib/supabase/client";
import type { ScheduleBlock, BlockKind } from "@/lib/mock-data";

// ── DB row shape ───────────────────────────────────────────────────────────────

interface DbScheduleBlock {
  id: string;
  workspace_id: string;
  user_id: string;
  task_id: string | null;
  team_id: string | null;
  kind: string;
  title: string;
  starts_at: string;
  ends_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Mapper ─────────────────────────────────────────────────────────────────────

function mapBlock(row: DbScheduleBlock): ScheduleBlock {
  return {
    id:          row.id,
    workspaceId: row.workspace_id,
    userId:      row.user_id,
    taskId:      row.task_id   ?? undefined,
    teamId:      row.team_id   ?? undefined,
    kind:        row.kind      as BlockKind,
    title:       row.title,
    startsAt:    row.starts_at,
    endsAt:      row.ends_at,
    createdBy:   row.created_by ?? "",
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ── Draft type ─────────────────────────────────────────────────────────────────

export interface NewBlockDraft {
  workspaceId: string;
  userId:      string;
  taskId?:     string;
  teamId?:     string;
  kind:        BlockKind;
  title:       string;
  startsAt:    string; // ISO timestamp
  endsAt:      string; // ISO timestamp
  createdBy:   string;
}

// ── Fetch ──────────────────────────────────────────────────────────────────────

/**
 * Fetch all schedule blocks for a workspace that overlap a given week window.
 * A block is included if its starts_at falls within [weekStart, weekEnd).
 */
export async function fetchBlocksForWeek(
  workspaceId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<ScheduleBlock[]> {
  const { data, error } = await supabase
    .from("schedule_blocks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at");

  if (error) throw error;
  return (data ?? []).map(mapBlock);
}

/**
 * Fetch all schedule blocks for a specific user, optionally filtered to a week.
 */
export async function fetchBlocksForUser(
  userId: string,
  weekStart?: Date,
  weekEnd?: Date
): Promise<ScheduleBlock[]> {
  let query = supabase
    .from("schedule_blocks")
    .select("*")
    .eq("user_id", userId);

  if (weekStart) query = query.gte("starts_at", weekStart.toISOString());
  if (weekEnd)   query = query.lt("starts_at",  weekEnd.toISOString());

  const { data, error } = await query.order("starts_at");
  if (error) throw error;
  return (data ?? []).map(mapBlock);
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createBlockInDb(draft: NewBlockDraft): Promise<ScheduleBlock> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("schedule_blocks")
    .insert({
      workspace_id: draft.workspaceId,
      user_id:      draft.userId,
      task_id:      draft.taskId    ?? null,
      team_id:      draft.teamId    ?? null,
      kind:         draft.kind,
      title:        draft.title,
      starts_at:    draft.startsAt,
      ends_at:      draft.endsAt,
      created_by:   draft.createdBy || null,
      created_at:   now,
      updated_at:   now,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBlock(data);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateBlockInDb(block: ScheduleBlock): Promise<void> {
  const { error } = await supabase
    .from("schedule_blocks")
    .update({
      task_id:    block.taskId  ?? null,
      team_id:    block.teamId  ?? null,
      kind:       block.kind,
      title:      block.title,
      starts_at:  block.startsAt,
      ends_at:    block.endsAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", block.id);

  if (error) throw error;
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function deleteBlockInDb(id: string): Promise<void> {
  const { error } = await supabase
    .from("schedule_blocks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
