"use client";

import { useEffect, useState } from "react";
import {
  User, Building2, Bell, Shield, Zap, CreditCard, Globe2,
  ChevronRight, Check, Users, UserPlus, Copy, Trash2, AlertCircle, CheckCircle2, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/lib/store-context";
import {
  fetchInvites,
  createInvite,
  revokeInvite,
  type Invite,
} from "@/lib/repositories/invites";
import type { UserRole } from "@/lib/mock-data";

// ── Sidebar sections ──────────────────────────────────────────────────────────

const settingsSections = [
  { id: "profile",      icon: User,       label: "Profile" },
  { id: "workspace",    icon: Building2,  label: "Workspace" },
  { id: "members",      icon: Users,      label: "Members" },
  { id: "notifications",icon: Bell,       label: "Notifications" },
  { id: "security",     icon: Shield,     label: "Security" },
  { id: "ai",           icon: Zap,        label: "AI & Automation" },
  { id: "billing",      icon: CreditCard, label: "Billing" },
  { id: "integrations", icon: Globe2,     label: "Integrations" },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${on ? "bg-indigo-600" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4.5" : "translate-x-0"}`} />
    </button>
  );
}

function SettingRow({ label, desc, toggle = false, defaultChecked = false, value }: {
  label: string; desc?: string; toggle?: boolean; defaultChecked?: boolean; value?: string
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {toggle ? (
        <ToggleSwitch defaultChecked={defaultChecked} />
      ) : value ? (
        <span className="text-sm text-muted-foreground">{value}</span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </div>
  );
}

const integrations = [
  { name: "Slack",           desc: "Send task updates and AI alerts to channels",  connected: true },
  { name: "Google Calendar", desc: "Sync scheduled blocks and meetings",            connected: true },
  { name: "Linear",          desc: "Import issues and sync task status",            connected: false },
  { name: "Jira",            desc: "Bi-directional task sync",                     connected: false },
  { name: "GitHub",          desc: "Link commits and PRs to tasks",                connected: false },
  { name: "Notion",          desc: "Embed Chrona views in Notion pages",           connected: false },
];

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-indigo-100 text-indigo-700",
  manager:  "bg-violet-100 text-violet-700",
  employee: "bg-slate-100 text-slate-600",
};

// ── Invite dialog ─────────────────────────────────────────────────────────────

function InviteDialog({
  onClose,
  onInviteCreated,
}: {
  onClose: () => void;
  onInviteCreated: (invite: Invite, link: string) => void;
}) {
  const { currentUser, workspaceId, teams } = useTasks();
  const [email,   setEmail]   = useState("");
  const [role,    setRole]    = useState<UserRole>("employee");
  const [teamId,  setTeamId]  = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    setLoading(true);

    try {
      const invite = await createInvite({
        workspaceId,
        email: email.trim(),
        role,
        teamId: teamId !== "none" ? teamId : undefined,
        invitedById: currentUser.id,
      });

      const link = `${window.location.origin}/invite/${invite.id}`;
      onInviteCreated(invite, link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Invite team member</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Email address</label>
            <input
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Team <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="No team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Sending…" : <><UserPlus className="w-4 h-4 mr-1" /> Generate invite link</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Invite link dialog ────────────────────────────────────────────────────────

function InviteLinkDialog({
  invite,
  link,
  onClose,
}: {
  invite: Invite;
  link: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">Invite created!</h2>
          <p className="text-sm text-muted-foreground">
            Share this link with <strong>{invite.email}</strong>. It will add them to your workspace as{" "}
            <span className="font-medium capitalize">{invite.role}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border mb-5">
          <span className="text-xs text-foreground font-mono truncate flex-1">{link}</span>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 shrink-0"
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

// ── Members section ───────────────────────────────────────────────────────────

function MembersSection() {
  const { users, teams, currentUser, workspaceId } = useTasks();
  const [invites,      setInvites]      = useState<Invite[]>([]);
  const [showDialog,   setShowDialog]   = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{ invite: Invite; link: string } | null>(null);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!workspaceId) return;
    fetchInvites(workspaceId)
      .then(setInvites)
      .catch(() => {/* non-fatal */});
  }, [workspaceId]);

  function teamNameFor(teamId: string | null) {
    if (!teamId) return null;
    return teams.find((t) => t.id === teamId)?.name ?? null;
  }

  async function handleRevoke(inviteId: string) {
    await revokeInvite(inviteId).catch(() => {/* non-fatal */});
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }

  function handleInviteCreated(invite: Invite, link: string) {
    setInvites((prev) => [invite, ...prev.filter((i) => i.id !== invite.id)]);
    setShowDialog(false);
    setCreatedInvite({ invite, link });
  }

  return (
    <div className="space-y-5">
      {/* Current members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Members ({users.length})</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowDialog(true)}>
                <UserPlus className="w-4 h-4 mr-1.5" /> Invite member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {users.map((u) => {
              const userTeams = teams.filter((t) => t.memberIds.includes(u.id));
              return (
                <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-indigo-100 text-indigo-700">
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-muted-foreground">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {userTeams.length > 0 && (
                      <span className="text-xs text-muted-foreground">{userTeams[0].name}</span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending invites */}
      {(invites.length > 0 || isAdmin) && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invites {invites.length > 0 && `(${invites.length})`}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invites.length === 0 ? (
              <div className="px-6 py-4 text-sm text-muted-foreground">No pending invites.</div>
            ) : (
              <div className="divide-y divide-border">
                {invites.map((inv) => {
                  const teamName = teamNameFor(inv.teamId);
                  return (
                    <div key={inv.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {teamName ? `${teamName} · ` : ""}{new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[inv.role]}`}>
                          {inv.role}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/invite/${inv.id}`;
                              setCreatedInvite({ invite: inv, link });
                            }}
                            title="Copy invite link"
                            className="p-1 rounded text-muted-foreground hover:text-indigo-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleRevoke(inv.id)}
                            title="Revoke invite"
                            className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {showDialog && (
        <InviteDialog
          onClose={() => setShowDialog(false)}
          onInviteCreated={handleInviteCreated}
        />
      )}
      {createdInvite && (
        <InviteLinkDialog
          invite={createdInvite.invite}
          link={createdInvite.link}
          onClose={() => setCreatedInvite(null)}
        />
      )}
    </div>
  );
}

// ── Missing import for Mail icon inside MembersSection ─────────────────────────
import { Mail } from "lucide-react";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex gap-6 max-w-[1200px] h-[calc(100vh-88px)]">
      {/* Sidebar nav */}
      <div className="w-52 shrink-0">
        <nav className="space-y-0.5">
          {settingsSections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === id ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className={`w-4 h-4 ${activeSection === id ? "text-indigo-600" : ""}`} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {activeSection === "profile" && (
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 text-xl">
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change photo</Button>
                  <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG up to 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "First name", value: "Sarah" },
                  { label: "Last name",  value: "Chen" },
                  { label: "Email",      value: "s.chen@acmecorp.com" },
                  { label: "Role",       value: "Admin" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">{label}</label>
                    <input
                      defaultValue={value}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "workspace" && (
          <Card>
            <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow label="Workspace name" value="Acme Corp" />
                <SettingRow label="Workspace URL" value="acmecorp.chrona.work" />
                <SettingRow label="Default timezone" value="UTC +1" />
                <SettingRow label="Working hours" value="09:00 – 18:00" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "members" && <MembersSection />}

        {activeSection === "notifications" && (
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow label="Task assigned to me" desc="Get notified when a task is assigned to you" toggle defaultChecked />
                <SettingRow label="Deadline approaching" desc="24h and 2h before task due dates" toggle defaultChecked />
                <SettingRow label="AI workload alerts" desc="When a team member exceeds 85% capacity" toggle defaultChecked />
                <SettingRow label="Task status changes" desc="When tasks you own are updated" toggle />
                <SettingRow label="Weekly digest" desc="Summary of team performance every Monday" toggle defaultChecked />
                <SettingRow label="Slack notifications" desc="Mirror alerts to your connected Slack" toggle defaultChecked />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "security" && (
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow label="Two-factor authentication" desc="Require 2FA for all workspace members" toggle defaultChecked />
                <SettingRow label="SSO / SAML" desc="Connect your identity provider" />
                <SettingRow label="Session timeout" value="30 days" />
                <SettingRow label="Audit log" desc="View all admin actions and logins" />
                <SettingRow label="IP allowlist" desc="Restrict access to specific IP ranges" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "ai" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI & Automation</CardTitle>
                <Badge variant="default" className="text-xs">Growth plan</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow label="AI task assignment" desc="Let AI suggest the best assignee based on skills and load" toggle defaultChecked />
                <SettingRow label="Workload rebalancing" desc="AI can proactively suggest task moves to prevent burnout" toggle defaultChecked />
                <SettingRow label="Deadline risk alerts" desc="Flag tasks likely to miss deadlines 48h in advance" toggle defaultChecked />
                <SettingRow label="Smart scheduling" desc="AI builds and adjusts the team's weekly schedule" toggle defaultChecked />
                <SettingRow label="Productivity insights" desc="Weekly AI summary of team performance trends" toggle />
                <SettingRow label="AI confidence threshold" value="High" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "billing" && (
          <Card>
            <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div>
                  <p className="text-sm font-semibold text-foreground">Growth Plan</p>
                  <p className="text-xs text-muted-foreground">8 seats · $28/seat/month · Renews May 11, 2026</p>
                </div>
                <Button variant="outline" size="sm">Upgrade</Button>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Payment method</p>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div>
                    <p className="text-sm text-foreground">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 08/2028</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto text-xs">Update</Button>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Recent invoices</p>
                {[
                  { date: "Apr 11, 2026", amount: "$224.00", status: "Paid" },
                  { date: "Mar 11, 2026", amount: "$224.00", status: "Paid" },
                  { date: "Feb 11, 2026", amount: "$224.00", status: "Paid" },
                ].map(({ date, amount, status }) => (
                  <div key={date} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{date}</span>
                    <span className="text-sm font-medium text-foreground">{amount}</span>
                    <Badge variant="success" className="text-xs">{status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "integrations" && (
          <Card>
            <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map(({ name, desc, connected }) => (
                  <div key={name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    {connected ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">Connect</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
