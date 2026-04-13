import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth + magic-link callback handler.
 *
 * Supabase redirects here after Google OAuth or email confirmation.
 * We exchange the code for a session and redirect to the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Allow the caller to specify a post-auth destination (defaults to /dashboard)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send the user back to sign-in with an error flag.
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
