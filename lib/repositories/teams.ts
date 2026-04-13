import { supabase } from "@/lib/supabase/client";
import type { Team } from "@/lib/mock-data";

// ── DB row shape ───────────────────────────────────────────────────────────────

interface DbTeam {
  id: string;
  workspace_id: string;
  name: string;
  department: string;
  manager_id: string | null;
  team_members: { user_id: string }[];
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapTeam(row: DbTeam): Team {
  return {
    id:        row.id,
    name:      row.name,
    department: row.department,
    managerId: row.manager_id ?? "",
    memberIds: row.team_members.map((m) => m.user_id),
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchTeams(workspaceId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(user_id)")
    .eq("workspace_id", workspaceId)
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapTeam);
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createTeamInDb(
  draft: { name: string; department: string; managerId: string },
  workspaceId: string
): Promise<Team> {
  const { data: row, error } = await supabase
    .from("teams")
    .insert({
      workspace_id: workspaceId,
      name:         draft.name,
      department:   draft.department,
      manager_id:   draft.managerId || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Add the manager as a team member automatically
  if (draft.managerId) {
    await supabase
      .from("team_members")
      .insert({ team_id: row.id, user_id: draft.managerId })
      .select();
  }

  return mapTeam({ ...row, team_members: draft.managerId ? [{ user_id: draft.managerId }] : [] });
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateTeamInDb(
  team: { id: string; name: string; department: string; managerId: string }
): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .update({
      name:       team.name,
      department: team.department,
      manager_id: team.managerId || null,
    })
    .eq("id", team.id);

  if (error) throw error;
}

// ── Member management ─────────────────────────────────────────────────────────

export async function addTeamMemberInDb(
  teamId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: userId });

  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function removeTeamMemberInDb(
  teamId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
}
