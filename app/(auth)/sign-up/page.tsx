"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Mail, Lock, User, Building2, Sparkles,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { fetchUserByEmail, createUserInDb } from "@/lib/repositories/users";
import { createWorkspace } from "@/lib/repositories/workspaces";
import { linkAuthId } from "@/lib/repositories/users";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [company,   setCompany]   = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const emailTrimmed = email.trim();

    try {
      const { data, error: authError } = await signUpWithEmail(
        emailTrimmed,
        password,
        { name: fullName, company: company.trim() || undefined }
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const authUserId = data.user?.id;
      if (!authUserId) {
        setError("Sign-up failed — please try again.");
        setLoading(false);
        return;
      }

      if (!data.session) {
        // Email confirmation is required. Supabase will redirect to
        // /auth/callback after the user clicks the link. The store-context
        // will create the workspace + user row automatically at that point.
        // Store name/company in auth metadata so the context can use them.
        setEmailSent(true);
        setLoading(false);
        return;
      }

      // ── Session is live (email confirmation disabled) ─────────────────────
      // Link or create user record now.
      const existing = await fetchUserByEmail(emailTrimmed);

      if (existing) {
        await linkAuthId(existing.user.id, authUserId).catch(() => {/* non-fatal */});
      } else {
        const workspace = await createWorkspace(
          company.trim() || `${fullName}'s Workspace`
        );
        await createUserInDb({
          workspaceId: workspace.id,
          authId:      authUserId,
          name:        fullName,
          email:       emailTrimmed,
          role:        "admin",
          initials:    getInitials(fullName),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, Supabase redirects to /auth/callback
  }

  // ── Email sent state ───────────────────────────────────────────────────────

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Check your inbox</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="text-xs text-muted-foreground">
            Already confirmed?{" "}
            <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Main sign-up form ──────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl flex gap-12 items-start">
      {/* Left — value prop */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-center flex-1 pt-8"
      >
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-6 border border-indigo-100 w-fit">
          <Sparkles className="w-3 h-3" /> Free 14-day trial
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
          The AI that makes your team&apos;s time actually work.
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Chrona Work automatically assigns tasks, balances workloads, and keeps your team on track — without the meetings about meetings.
        </p>
        <ul className="space-y-3">
          {[
            "AI-powered task assignment and scheduling",
            "Real-time workload balancing across your team",
            "Deadline risk detection — before it's too late",
            "Analytics that actually improve planning",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-foreground/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 p-5 rounded-xl bg-white border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">SG</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Samuel Greene</p>
              <p className="text-xs text-muted-foreground">CTO, Nexlayer</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            &ldquo;Chrona Work flagged a workload imbalance that was quietly burning out two of our best engineers. Caught it two weeks before it would have become a crisis.&rdquo;
          </p>
        </div>
      </motion.div>

      {/* Right — form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full lg:max-w-md"
      >
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start your free 14-day trial. No credit card required.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-10 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-foreground transition-colors mb-5 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-muted-foreground">or with email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Last name</label>
                <input
                  type="text"
                  placeholder="Johnson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Company</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 shadow-md shadow-indigo-500/20"
            >
              {loading ? "Creating account…" : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:underline">Terms</a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
