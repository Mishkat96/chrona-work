import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Warn at runtime (not at build time) when env vars are missing.
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[Chrona] Supabase env vars are not set. " +
    "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
    "to .env.local (dev) or Vercel Environment Variables (production)."
  );
}

// createBrowserClient (from @supabase/ssr) stores the session in cookies
// instead of localStorage, so the middleware can read it server-side.
export const supabase = createBrowserClient(
  supabaseUrl  || "https://placeholder.supabase.co",
  supabaseKey  || "placeholder-key"
);
