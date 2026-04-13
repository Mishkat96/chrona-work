/**
 * Browser-side Supabase auth utilities.
 * All functions use the browser client — safe to call from Client Components.
 */

import { supabase } from "./supabase/client";

// ── Sign-in ────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback";

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}

// ── Sign-up ────────────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback";

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo,
    },
  });
}

// ── Sign-out ───────────────────────────────────────────────────────────────────

export async function signOut() {
  return supabase.auth.signOut();
}

// ── Session ────────────────────────────────────────────────────────────────────

export async function getSession() {
  return supabase.auth.getSession();
}

// ── Password reset ─────────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string) {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/settings`
      : "/auth/callback?next=/settings";

  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}
