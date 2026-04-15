"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User, Mail, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpWithEmail, signInWithEmail } from "@/lib/auth";
import { fetchInviteByToken, acceptInvite, type Invite } from "@/lib/repositories/invites";
import { fetchUserByEmail, createUserInDb, linkAuthId } from "@/lib/repositories/users";
import { addTeamMemberInDb } from "@/lib/repositories/teams";

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

const ROLE_LABELS: Record<string, string> = {
  admin:    "Admin",
  manager:  "Manager",
  employee: "Employee",
};

// ── Loading / error states ─────────────────────────────────────────────────────

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl border border-border shadow-sm p-10">
        {children}
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();

  const [invite,    setInvite]    = useState<Invite | null>(null);
  const [status,    setStatus]    = useState<"loading" | "ready" | "invalid" | "accepted">("loading");
  const [mode,      setMode]      = useState<"signup" | "signin">("signup");
  const [name,      setName]      = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch invite on mount ──────────────────────────────────────────────────

  useEffect(() => {
    fetchInviteByToken(token).then((inv) => {
      if (!inv) { setStatus("invalid"); return; }
      if (inv.accepted) { setStatus("accepted"); return; }
      setInvite(inv);
      setStatus("ready");
    });
  }, [token]);

  // ── Form submit ────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        // ── New user path ──────────────────────────────────────────────────
        const { data, error: authError } = await signUpWithEmail(
          invite.email,
          password,
          { name: name.trim() }
        );

        if (authError) {
          // Already registered → switch to sign-in mode
          if (authError.message.toLowerCase().includes("already")) {
            setMode("signin");
            setError("You already have an account. Enter your password to sign in and accept the invite.");
            setSubmitting(false);
            return;
          }
          throw authError;
        }

        const authUserId = data.user?.id;
        if (!authUserId) throw new Error("Sign-up failed — please try again.");

        // Create user row in the invited workspace
        const newUser = await createUserInDb({
          workspaceId: invite.workspaceId,
          authId:      authUserId,
          name:        name.trim(),
          email:       invite.email,
          role:        invite.role,
          initials:    getInitials(name.trim()),
        });

        // Add to the designated team if the invite specified one
        if (invite.teamId) {
          await addTeamMemberInDb(invite.teamId, newUser.id).catch(() => {/* non-fatal */});
        }

        await acceptInvite(invite.id);

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          // Email confirmation required
          setStatus("accepted");
          setSubmitting(false);
        }
      } else {
        // ── Existing user path (sign in + link to workspace) ───────────────
        const { data, error: authError } = await signInWithEmail(invite.email, password);
        if (authError) throw authError;

        const authUserId = data.session?.user.id ?? data.user?.id;
        if (!authUserId) throw new Error("Sign-in failed.");

        // Check if they already have a user row in this workspace
        const existing = await fetchUserByEmail(invite.email);
        let targetUserId: string | null = existing?.user.id ?? null;

        if (!existing || existing.workspaceId !== invite.workspaceId) {
          // Add them to the invited workspace
          const created = await createUserInDb({
            workspaceId: invite.workspaceId,
            authId:      authUserId,
            name:        data.user?.user_metadata?.name ?? invite.email,
            email:       invite.email,
            role:        invite.role,
            initials:    getInitials(data.user?.user_metadata?.name ?? invite.email),
          }).catch(async () => {
            // Row may already exist (e.g. seed data) — just link auth_id
            if (existing) await linkAuthId(existing.user.id, authUserId).catch(() => {/* ignore */});
            return null;
          });
          if (created) targetUserId = created.id;
        }

        // Add to the designated team if the invite specified one
        if (invite.teamId && targetUserId) {
          await addTeamMemberInDb(invite.teamId, targetUserId).catch(() => {/* non-fatal */});
        }

        await acceptInvite(invite.id);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  // ── States ─────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <InviteShell>
        <div className="text-center py-6 text-sm text-muted-foreground">Loading invite…</div>
      </InviteShell>
    );
  }

  if (status === "invalid") {
    return (
      <InviteShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-2">Invite not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This invite link is invalid or has already been used.
          </p>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </InviteShell>
    );
  }

  if (status === "accepted") {
    return (
      <InviteShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <strong>{invite?.email}</strong>. Click it to activate your account and you&apos;ll be taken to the workspace.
          </p>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </InviteShell>
    );
  }

  // ── Ready — show the form ──────────────────────────────────────────────────

  return (
    <InviteShell>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
          <Sparkles className="w-3 h-3" /> You&apos;ve been invited
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1.5">
          {mode === "signup" ? "Create your account" : "Sign in to accept"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Joining as{" "}
          <span className="font-semibold text-indigo-600">
            {ROLE_LABELS[invite!.role]}
          </span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name — only shown for sign-up */}
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Email — pre-filled, read-only */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={invite!.email}
              readOnly
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signup" ? 6 : 1}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full h-10 shadow-md shadow-indigo-500/20">
          {submitting
            ? (mode === "signup" ? "Creating account…" : "Signing in…")
            : <>{mode === "signup" ? "Accept invite & create account" : "Sign in & accept invite"} <ArrowRight className="w-4 h-4" /></>
          }
        </Button>
      </form>

      {/* Toggle mode */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {mode === "signup" ? (
          <>Already have an account?{" "}
            <button onClick={() => { setMode("signin"); setError(null); }} className="text-indigo-600 font-semibold hover:text-indigo-500">
              Sign in instead
            </button>
          </>
        ) : (
          <>New to Chrona Work?{" "}
            <button onClick={() => { setMode("signup"); setError(null); }} className="text-indigo-600 font-semibold hover:text-indigo-500">
              Create account
            </button>
          </>
        )}
      </p>
    </InviteShell>
  );
}
