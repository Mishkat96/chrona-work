"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, CheckCircle2, BarChart3, Users, Calendar,
  Zap, Shield, Globe2, TrendingUp, Clock, AlertTriangle, Star,
  Play, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { testimonials, pricingPlans } from "@/lib/mock-data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }
  }),
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
        <Zap className="w-4 h-4 text-white" fill="currentColor" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Chrona <span className="text-indigo-600">Work</span>
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {["Product", "Solutions", "Pricing", "Blog"].map((item) => (
              <a key={item} href="#" className="hover:text-foreground transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="shadow-md shadow-indigo-500/20">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-violet-50/40 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1.5 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 inline-flex items-center border border-indigo-100">
              <Sparkles className="w-3 h-3" />
              Now with AI workload rebalancing
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-5xl md:text-[64px] font-bold tracking-tight leading-[1.1] text-foreground"
          >
            AI that understands<br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
              your team&apos;s time.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Chrona Work assigns tasks intelligently, balances workloads in real time,
            and builds schedules your team can actually execute — not just plan.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/sign-up">
              <Button size="xl" className="shadow-xl shadow-indigo-500/25 text-base">
                Start free 14-day trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="gap-2">
              <Play className="w-4 h-4 fill-current text-indigo-600" />
              Watch demo
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-4 text-xs text-muted-foreground"
          >
            No credit card required · Setup in under 5 minutes · Cancel anytime
          </motion.p>
        </div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const }}
          className="mt-20 mx-auto max-w-6xl"
        >
          <div className="rounded-2xl border border-border/60 shadow-2xl shadow-indigo-100/50 overflow-hidden bg-[#f8f9fb]">
            {/* mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-muted rounded-md h-5 w-56 flex items-center px-2.5 text-xs text-muted-foreground">
                  app.chrona.work/dashboard
                </div>
              </div>
            </div>
            {/* mock dashboard */}
            <div className="grid grid-cols-12 gap-0 min-h-[420px]">
              {/* sidebar */}
              <div className="col-span-2 bg-white border-r border-border p-4 hidden lg:block">
                <div className="flex flex-col gap-1">
                  {["Dashboard", "Tasks", "Planner", "Team", "Analytics", "Assistant"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground"}`}>
                      <div className="w-3.5 h-3.5 rounded bg-current opacity-30" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* content */}
              <div className="col-span-12 lg:col-span-10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-5 w-36 bg-foreground/10 rounded-md mb-1" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted rounded-lg" />
                    <div className="h-8 w-28 bg-indigo-600/80 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Tasks", val: "72", color: "bg-indigo-500" },
                    { label: "Due Today", val: "8", color: "bg-amber-500" },
                    { label: "Completion", val: "84%", color: "bg-emerald-500" },
                    { label: "At Risk", val: "3", color: "bg-red-500" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white border border-border rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-1">{label}</div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">{val}</span>
                        <div className={`w-2 h-2 rounded-full ${color} mb-1`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-white border border-border rounded-xl p-4">
                    <div className="h-3 w-32 bg-foreground/10 rounded mb-3" />
                    <div className="flex items-end gap-1.5 h-24">
                      {[60, 80, 55, 90, 70, 85, 65, 95, 75, 88].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-indigo-100 flex flex-col justify-end" style={{ height: `${h}%` }}>
                          <div className="w-full bg-indigo-500 rounded-sm" style={{ height: "70%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
                      <Sparkles className="w-3 h-3" /> AI Insights
                    </div>
                    {["Olivia is overloaded", "Move review to Thu", "Marketing has capacity"].map((insight) => (
                      <div key={insight} className="bg-white/80 rounded-lg px-2.5 py-2 text-xs text-foreground/80 border border-white">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────── */}
      <section className="py-12 border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Meridian Health", "Nexlayer", "Clearbridge", "Axiom Labs", "Forgepoint", "Stratera"].map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/70 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="ghost" className="mb-4 text-xs font-semibold uppercase tracking-widest">How it works</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">A smarter way to run your team</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Chrona Work connects tasks, people, and time into a single intelligent system.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Users, title: "Connect your team", body: "Import your team, set roles and availability. Chrona builds a live model of who can do what — and when." },
              { step: "02", icon: BarChart3, title: "AI assigns and schedules", body: "Our AI engine distributes tasks based on skills, capacity, and deadlines. No more manual juggling or guesswork." },
              { step: "03", icon: TrendingUp, title: "Adapt in real time", body: "When priorities shift, Chrona rebalances automatically and surfaces what needs attention before it becomes a problem." },
            ].map(({ step, icon: Icon, title, body }, i) => (
              <motion.div
                key={step}
                variants={fadeUp} initial="hidden" whileInView="show" custom={i} viewport={{ once: true }}
                className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <span className="text-5xl font-black text-indigo-50 absolute top-6 right-6 leading-none select-none">{step}</span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="ghost" className="mb-4 text-xs font-semibold uppercase tracking-widest">Features</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything your team needs</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From task assignment to workload analytics — built for teams that can&apos;t afford to miss deadlines.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "AI Task Assignment", body: "Intelligently routes tasks to the right person based on skills, load, and availability." },
              { icon: BarChart3, title: "Workload Analytics", body: "Visualise who is over-capacity and who has room — before it becomes a problem." },
              { icon: Calendar, title: "Smart Scheduling", body: "AI builds a realistic schedule that accounts for meetings, focus time, and deadlines." },
              { icon: AlertTriangle, title: "Risk Detection", body: "Get proactive alerts when tasks are at risk of missing deadlines — days in advance." },
              { icon: Users, title: "Team Visibility", body: "A single view of your entire team's work, status, and progress in real time." },
              { icon: Globe2, title: "Integrations", body: "Works with Slack, Jira, Linear, Google Calendar, and the tools your team already uses." },
              { icon: TrendingUp, title: "Performance Insights", body: "Track velocity, completion rates, and team throughput across sprints and quarters." },
              { icon: Shield, title: "Enterprise Security", body: "SOC 2 Type II, SSO, SAML, and role-based access controls built in from day one." },
              { icon: Clock, title: "Time Tracking", body: "Log hours against tasks and compare estimates to actuals to improve future planning." },
            ].map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="show" custom={i % 3} viewport={{ once: true }}
                className="flex gap-4 p-6 rounded-xl border border-border bg-card hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="ghost" className="mb-4 text-xs font-semibold uppercase tracking-widest">Use Cases</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for every layer of your organisation</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "For individual contributors",
                items: ["See your tasks prioritised automatically", "Know what to work on next", "Log time with one click", "Get notified before deadlines slip"],
                border: "border-indigo-100",
                bg: "from-indigo-50/60 to-white",
                check: "text-indigo-500",
              },
              {
                title: "For team managers",
                items: ["Spot overloaded team members instantly", "Rebalance work in seconds", "Get AI suggestions before problems escalate", "Track team velocity over time"],
                border: "border-violet-100",
                bg: "from-violet-50/60 to-white",
                check: "text-violet-500",
              },
              {
                title: "For executives & ops",
                items: ["Company-wide workload visibility", "Real-time delivery risk indicators", "Cross-team capacity planning", "ROI reporting on headcount utilisation"],
                border: "border-blue-100",
                bg: "from-blue-50/60 to-white",
                check: "text-blue-500",
              },
            ].map(({ title, items, border, bg, check }) => (
              <div key={title} className={`p-8 rounded-2xl border ${border} bg-gradient-to-b ${bg}`}>
                <h3 className="text-base font-semibold text-foreground mb-5">{title}</h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 ${check} shrink-0 mt-0.5`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="ghost" className="mb-4 text-xs font-semibold uppercase tracking-widest">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-foreground">What our customers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, title, company, initials }, i) => (
              <motion.div
                key={name}
                variants={fadeUp} initial="hidden" whileInView="show" custom={i * 0.5} viewport={{ once: true }}
                className="flex flex-col justify-between p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{title}, {company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="ghost" className="mb-4 text-xs font-semibold uppercase tracking-widest">Pricing</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Per team member. No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map(({ name, price, description, features, cta, highlighted }) => (
              <div
                key={name}
                className={`relative rounded-2xl border p-8 ${highlighted
                  ? "border-indigo-300 bg-gradient-to-b from-indigo-50 to-white shadow-xl shadow-indigo-100/50"
                  : "border-border bg-card"
                  }`}
              >
                {highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" /> Most popular
                    </span>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">{name}</h3>
                <div className="mb-3">
                  {price ? (
                    <span className="text-4xl font-bold text-foreground">${price}<span className="text-base font-normal text-muted-foreground">/mo</span></span>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{description}</p>
                <Link href="/sign-up">
                  <Button
                    variant={highlighted ? "default" : "outline"}
                    className={`w-full mb-7 ${highlighted ? "shadow-lg shadow-indigo-500/25" : ""}`}
                  >
                    {cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <ul className="space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-16 text-center shadow-2xl shadow-indigo-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
                Stop managing work.<br />Start delivering it.
              </h2>
              <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
                Join 3,000+ companies using Chrona Work to eliminate planning waste and ship faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/sign-up">
                  <Button size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl font-semibold">
                    Start your free trial <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="xl" variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  Talk to sales <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="mt-6 text-sm text-indigo-200">14-day free trial · No credit card · Full access</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-14 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                AI-powered workplace productivity. Built for teams that care about how work actually gets done.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Dashboard", "Tasks", "Planner", "Analytics", "Integrations"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "SOC 2"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 Chrona, Inc. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Made with precision for teams that ship.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
