"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signInWithEmail(email.trim(), password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, Supabase redirects to /auth/callback — no manual push needed.
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl border border-border shadow-sm p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-3 h-3" /> AI-powered workspace
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1.5">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your Chrona Work account</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 h-10 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-foreground transition-colors mb-6 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Email / password form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 shadow-md shadow-indigo-500/20"
          >
            {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-indigo-600 font-semibold hover:text-indigo-500">
            Start free trial
          </Link>
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {["SOC 2", "GDPR", "99.9% uptime"].map((badge) => (
          <span key={badge} className="text-xs text-muted-foreground font-medium">{badge}</span>
        ))}
      </div>
    </motion.div>
  );
}
