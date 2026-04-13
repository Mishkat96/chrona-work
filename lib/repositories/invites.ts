import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/mock-data";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Invite {
  /** UUID — also serves as the one-time invite token in the URL. */
  id: string;
  workspaceId: string;
  email: string;
  role: UserRole;
  teamId: string | null;
  invitedBy: string | null;
  accepted: boolean;
  createdAt: string;
}

interface DbInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  team_id: string | null;
  invited_by: string | null;
  accepted: boolean;
  created_at: string;
}

function mapInvite(row: DbInvite): Invite {
  return {
    id:          row.id,
    workspaceId: row.workspace_id,
    email:       row.email,
    role:        row.role as UserRole,
    teamId:      row.team_id,
    invitedBy:   row.invited_by,
    accepted:    row.accepted,
    createdAt:   row.created_at,
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** Fetch all pending (not yet accepted) invites for a workspace. */
export async function fetchInvites(workspaceId: string): Promise<Invite[]> {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("accepted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapInvite);
}

/**
 * Fetch a single invite by its token (the UUID id).
 * Called on the /invite/[token] page before the user has authenticated.
 */
export async function fetchInviteByToken(token: string): Promise<Invite | null> {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("id", token)
    .single();

  if (error || !data) return null;
  return mapInvite(data);
}

// ── Write ─────────────────────────────────────────────────────────────────────

export interface InviteDraft {
  workspaceId: string;
  email: string;
  role: UserRole;
  teamId?: string;
  invitedById: string;
}

/**
 * Creates a new invite.  If a pending invite already exists for this email in
 * this workspace, the existing one is returned (so re-sending is idempotent).
 */
export async function createInvite(draft: InviteDraft): Promise<Invite> {
  // Check for existing pending invite
  const { data: existing } = await supabase
    .from("invites")
    .select("*")
    .eq("workspace_id", draft.workspaceId)
    .eq("email", draft.email.toLowerCase())
    .eq("accepted", false)
    .single();

  if (existing) return mapInvite(existing as DbInvite);

  const { data, error } = await supabase
    .from("invites")
    .insert({
      workspace_id: draft.workspaceId,
      email:        draft.email.toLowerCase(),
      role:         draft.role,
      team_id:      draft.teamId ?? null,
      invited_by:   draft.invitedById,
      accepted:     false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInvite(data);
}

/** Mark an invite as accepted (called after the invited user creates their account). */
export async function acceptInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from("invites")
    .update({ accepted: true })
    .eq("id", inviteId);

  if (error) throw error;
}

/** Delete a pending invite (admin revoke). */
export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId);

  if (error) throw error;
}
