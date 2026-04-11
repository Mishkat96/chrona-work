"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, RefreshCw, Zap, AlertTriangle, CheckCircle2,
  Activity, ChevronRight, Users, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiInsights } from "@/lib/mock-data";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED = [
  "Who is most overloaded this week?",
  "Which tasks are at risk of missing deadlines?",
  "Suggest how to rebalance the engineering team's workload",
  "What does next week look like for marketing?",
  "Show me tasks that should be reassigned",
];

const MOCK_RESPONSES: Record<string, string> = {
  default: "Based on current data, I can see a few areas worth addressing. Olivia Chen is at 92% capacity with 14 active tasks — I'd recommend moving the Design System Audit to next week since it's not time-critical. The engineering team also has a blocked task (Safari chart bug) due in 48h with under 50% progress. Would you like me to suggest a resolution path?",
};

function getResponse(q: string): string {
  const ql = q.toLowerCase();
  if (ql.includes("overload") || ql.includes("capacity")) {
    return "Looking at this week's data:\n\n**Olivia Chen** (92% capacity, 14 tasks) is the most overloaded. Two tasks — Design System Audit and Component Review — could be moved to next week without impacting critical deadlines.\n\n**Aisha Okafor** (81% capacity, 12 tasks) is also running high. The billing refactor has a flexible deadline and could potentially be picked up by another engineer.";
  }
  if (ql.includes("risk") || ql.includes("deadline") || ql.includes("miss")) {
    return "I've identified **2 tasks at high risk**:\n\n1. **Fix dashboard chart bug** (Sofia Alvarez) — Due April 12, status: Blocked, 50% progress. This is 24h away with a blocker unresolved.\n\n2. **API rate limiting** (James Kwon) — Due April 13, 37% complete. At current pace, this will slip by ~1 day.\n\nI recommend prioritising unblocking Sofia first as that task is on the critical path.";
  }
  if (ql.includes("rebalanc") || ql.includes("engineering")) {
    return "Here's my recommended rebalancing plan for the engineering team:\n\n**Move from Aisha → Sofia:**\n- Billing module refactor (low urgency, Sofia has 33% spare capacity)\n\n**Move from James → Aisha:**\n- Documentation update (can be deprioritised)\n\n**Keep as-is:**\n- API rate limiting (James is the domain expert)\n- Auth migration (Aisha's specialty)\n\nEstimated result: Aisha drops to 68%, Sofia to 75%, James to 71%. All within healthy range.";
  }
  if (ql.includes("marketing")) {
    return "Marketing team next week looks manageable. Marcus Reid is at 38% capacity — well under the healthy ceiling.\n\n**Unassigned tasks that fit his profile:**\n- Social campaign brief (currently unowned)\n- Competitor content review\n\n**Suggestion:** Assign both tasks to Marcus next week. This brings him to ~65% — healthy range — and clears two bottlenecked items.";
  }
  if (ql.includes("reassign")) {
    return "Based on current workloads, I recommend reassigning:\n\n1. **Design System Audit** (Olivia → defer or assign to junior designer)\n2. **Competitor Feature Analysis** (Priya → can be handled async next sprint)\n3. **Social Campaign Brief** (Unassigned → Marcus Reid, 38% capacity)\n\nShall I draft the reassignment plan and notify the affected team members?";
  }
  return MOCK_RESPONSES.default;
}

function InsightCard({ insight }: { insight: typeof aiInsights[0] }) {
  const icons = {
    warning: AlertTriangle,
    suggestion: Sparkles,
    info: Activity,
    success: CheckCircle2,
  };
  const colors = {
    warning: { bg: "bg-amber-50 border-amber-200", icon: "text-amber-500" },
    suggestion: { bg: "bg-indigo-50 border-indigo-200", icon: "text-indigo-500" },
    info: { bg: "bg-blue-50 border-blue-200", icon: "text-blue-500" },
    success: { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-500" },
  };
  const Icon = icons[insight.type];
  const style = colors[insight.type];

  return (
    <div className={`rounded-xl border p-4 ${style.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.icon}`} />
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground mb-0.5">{insight.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
          {insight.action && (
            <button className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              {insight.action} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Chrona Work AI assistant. I have full visibility into your team's workload, tasks, schedules, and performance metrics. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(q?: string) {
    const text = (q ?? input).trim();
    if (!text) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }]);
      setLoading(false);
    }, 900);
  }

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-88px)] max-w-[1400px]">
      {/* Chat */}
      <div className="col-span-12 lg:col-span-8 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Work Assistant</h2>
            <p className="text-xs text-muted-foreground">Connected to your team workspace</p>
          </div>
          <Badge variant="success" className="ml-auto text-xs">Live</Badge>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                      SC
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-foreground"
                      }`}
                  >
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.div
                      key={delay}
                      className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.7, delay }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <div className="px-5 pb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-indigo-200 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about workload, deadlines, team capacity..."
                className="flex-1 h-10 px-4 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
              <Button
                size="icon"
                disabled={!input.trim() || loading}
                onClick={() => send()}
                className="h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right panel */}
      <div className="col-span-12 lg:col-span-4 space-y-4 overflow-y-auto">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <CardTitle>Live Insights</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Updated in real time</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: Users, label: "Rebalance workload", desc: "AI-suggest task moves" },
              { icon: Calendar, label: "Reschedule blocked tasks", desc: "Find free slots" },
              { icon: RefreshCw, label: "Run capacity analysis", desc: "Next 2 weeks" },
            ].map(({ icon: Icon, label, desc }) => (
              <button
                key={label}
                onClick={() => send(label)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted hover:border-indigo-200 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
