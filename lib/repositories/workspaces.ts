import { supabase } from "@/lib/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
}

interface DbWorkspace {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

function mapWorkspace(row: DbWorkspace): Workspace {
  return {
    id:        row.id,
    name:      row.name,
    plan:      row.plan,
    createdAt: row.created_at,
  };
}

/**
 * Creates a new workspace (called during sign-up for the first user of a company).
 */
export async function createWorkspace(name: string): Promise<Workspace> {
  // workspaces.id has no DB default — generate UUID here
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ id, name, plan: "growth" })
    .select()
    .single();

  if (error) throw error;
  return mapWorkspace(data);
}

export async function fetchWorkspace(id: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapWorkspace(data);
}
