import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Warn at runtime (not at build time) when env vars are missing.
// The store-context already falls back to mock data when requests fail,
// so missing vars in dev just means offline mode — not a crash.
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[Chrona] Supabase env vars are not set. " +
    "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
    "to .env.local (dev) or Vercel Environment Variables (production)."
  );
}

export const supabase = createClient(
  supabaseUrl  || "https://placeholder.supabase.co",
  supabaseKey  || "placeholder-key"
);
