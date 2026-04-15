import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/mock-data";

// ── DB row shape ───────────────────────────────────────────────────────────────

interface DbProject {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  created_at: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapProject(row: DbProject): Project {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    color:       row.color,
    status:      row.status as Project["status"],
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function fetchProjects(workspaceId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapProject);
}
