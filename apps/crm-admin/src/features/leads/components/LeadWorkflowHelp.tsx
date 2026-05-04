"use client";

import { Icon, Badge } from "@/components/ui";

// ── Reusable sub-components ─────────────────────────────

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
      {n}
    </span>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
      <Icon name="info" size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
      <p className="text-xs text-blue-700">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
      <Icon name="alert-triangle" size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
      <p className="text-xs text-amber-700">{children}</p>
    </div>
  );
}

function NavPath({ path }: { path: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
      {path.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <Icon name="chevron-right" size={10} className="text-gray-400" />}
          <span className="rounded bg-gray-100 px-1.5 py-0.5">{p}</span>
        </span>
      ))}
    </span>
  );
}

// ── Component ───────────────────────────────────────────

export function LeadWorkflowHelpContent() {
  return (
    <div className="space-y-8 text-sm text-gray-600">
          {/* ─── Section 1: Overview ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <Icon name="activity" size={14} className="text-blue-600" />
              </span>
              What is the Lead Pipeline?
            </h3>
            <p>
              The lead pipeline is a <strong>visual workflow</strong> that tracks each lead
              through your sales process — from initial inquiry to closure. It&apos;s fully
              configurable: admins can add, remove, or reorder stages, define allowed
              transitions, set approval gates, and trigger automated actions.
            </p>
            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Default Pipeline
              </p>
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-medium">
                {[
                  { name: "New", color: "#94a3b8" },
                  { name: "Verified", color: "#60a5fa" },
                  { name: "Allocated", color: "#a78bfa" },
                  { name: "In Progress", color: "#f59e0b" },
                  { name: "Demo", color: "#f97316" },
                  { name: "Quotation", color: "#8b5cf6" },
                  { name: "Negotiation", color: "#ec4899" },
                  { name: "Won", color: "#22c55e" },
                ].map((s, i, arr) => (
                  <span key={s.name} className="flex items-center gap-1 whitespace-nowrap">
                    <span
                      className="rounded-full px-2 py-0.5 text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.name}
                    </span>
                    {i < arr.length - 1 && (
                      <Icon name="chevron-right" size={10} className="text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  Lost (terminal)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                  On Hold (paused)
                </span>
              </div>
            </div>
          </section>

          {/* ─── Section 2: Moving a Lead ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                <Icon name="arrow-right" size={14} className="text-green-600" />
              </span>
              How to Move a Lead Forward
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <StepNumber n={1} />
                <p>Open a lead&apos;s detail page from the list or Kanban board</p>
              </div>
              <div className="flex items-start gap-3">
                <StepNumber n={2} />
                <p>
                  The <strong>pipeline stepper</strong> at the top shows the current stage
                  (highlighted in blue) and all available stages
                </p>
              </div>
              <div className="flex items-start gap-3">
                <StepNumber n={3} />
                <p>
                  Click one of the <strong>transition buttons</strong> below the stepper
                  (e.g., &ldquo;Verify&rdquo;, &ldquo;Allocate&rdquo;, &ldquo;Mark as Lost&rdquo;)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <StepNumber n={4} />
                <p>
                  Optionally add a <strong>comment</strong> explaining the transition
                  (e.g., &ldquo;Customer confirmed interest after follow-up call&rdquo;)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <StepNumber n={5} />
                <p>
                  The stepper updates instantly and the change is recorded in
                  <strong> Pipeline History</strong>
                </p>
              </div>
            </div>
            <Tip>
              Only the transitions configured by your admin are shown. If a button
              you expect is missing, ask your admin to add the transition in the
              Workflow Builder.
            </Tip>
          </section>

          {/* ─── Section 3: Configure Pipeline ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <Icon name="settings" size={14} className="text-purple-600" />
              </span>
              How to Configure the Pipeline
            </h3>
            <p className="mb-3">
              Admins can fully customize the lead pipeline from the Workflow Builder.
            </p>

            {/* Navigate */}
            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-700">Navigate to:</p>
              <NavPath path={["Settings", "Workflows", "Lead Pipeline"]} />
            </div>

            {/* Sub-section: Add a Stage */}
            <div className="mb-4">
              <p className="mb-2 font-semibold text-gray-800">
                Adding a New Stage
              </p>
              <ol className="list-inside list-decimal space-y-1.5 text-gray-600">
                <li>
                  Open the Lead Pipeline workflow and click <strong>+ Add State</strong>
                </li>
                <li>
                  Enter a <strong>Name</strong> (e.g., &ldquo;Requirement Analysis&rdquo;)
                  and <strong>Code</strong> (e.g., <code className="rounded bg-gray-100 px-1 text-xs">REQ_ANALYSIS</code>)
                </li>
                <li>
                  Set <strong>State Type</strong>:
                  <div className="mt-1.5 ml-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">INITIAL</Badge>
                      <span className="text-xs text-gray-500">Starting point (only one allowed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">INTERMEDIATE</Badge>
                      <span className="text-xs text-gray-500">In-progress stages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">TERMINAL</Badge>
                      <span className="text-xs text-gray-500">End states (Won, Lost, On Hold)</span>
                    </div>
                  </div>
                </li>
                <li>
                  Pick a <strong>Color</strong> for visual identification in the pipeline
                </li>
                <li>
                  Set <strong>Sort Order</strong> to control position (lower = further left)
                </li>
                <li>Click <strong>Save</strong></li>
              </ol>
              <Tip>
                Use sort order numbers like 10, 20, 30 so you can insert new stages
                between existing ones later (e.g., 15 goes between 10 and 20).
              </Tip>
            </div>

            {/* Sub-section: Add Transitions */}
            <div className="mb-4">
              <p className="mb-2 font-semibold text-gray-800">
                Connecting Stages with Transitions
              </p>
              <p className="mb-2 text-gray-600">
                Transitions define <strong>which movements are allowed</strong>. Without a
                transition, a lead cannot move between two stages.
              </p>
              <ol className="list-inside list-decimal space-y-1.5 text-gray-600">
                <li>Click <strong>+ Add Transition</strong> (or click the arrow icon on a state card)</li>
                <li>Select the <strong>From State</strong> and <strong>To State</strong></li>
                <li>
                  Enter a <strong>Name</strong> (shown on the button, e.g., &ldquo;Verify Lead&rdquo;)
                </li>
                <li>
                  Choose a <strong>Trigger Type</strong>:
                  <div className="mt-1.5 ml-4 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Badge variant="default">MANUAL</Badge>
                      <span className="text-xs text-gray-500">User clicks a button</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="primary">AUTO</Badge>
                      <span className="text-xs text-gray-500">Triggers automatically when conditions are met</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="warning">SCHEDULED</Badge>
                      <span className="text-xs text-gray-500">Triggers at a scheduled time</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="danger">APPROVAL</Badge>
                      <span className="text-xs text-gray-500">Requires manager approval first</span>
                    </div>
                  </div>
                </li>
                <li>Optionally set <strong>Required Permission</strong> or <strong>Required Role</strong></li>
                <li>Click <strong>Save</strong></li>
              </ol>
            </div>

            {/* Sub-section: Reorder */}
            <div className="mb-4">
              <p className="mb-2 font-semibold text-gray-800">
                Reordering Stages
              </p>
              <p className="text-gray-600">
                In the Workflow Builder, <strong>drag and drop</strong> state cards using
                the grip handle (<Icon name="grip-vertical" size={12} className="inline text-gray-400" />)
                to reorder them. The sort order updates automatically.
              </p>
            </div>

            {/* Sub-section: Publish */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-1 font-semibold text-gray-800">Publishing Changes</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <StepNumber n={1} />
                  <span>Click <strong>Validate</strong> to check for errors (missing initial state, orphaned states, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <StepNumber n={2} />
                  <span>Fix any issues reported</span>
                </div>
                <div className="flex items-start gap-2">
                  <StepNumber n={3} />
                  <span>Click <strong>Publish</strong> to activate changes</span>
                </div>
              </div>
            </div>
            <Warning>
              Changes affect all future transitions. Existing leads keep their current
              stage. Always validate before publishing.
            </Warning>
          </section>

          {/* ─── Section 4: Colors ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                <Icon name="bookmark" size={14} className="text-pink-600" />
              </span>
              Understanding Pipeline Colors
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <Icon name="check" size={12} className="text-white" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Green / Completed</p>
                  <p className="text-xs text-gray-500">Lead has already passed through this stage</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Blue / Current</p>
                  <p className="text-xs text-gray-500">Where the lead is right now</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Gray / Future</p>
                  <p className="text-xs text-gray-500">Stages not yet reached</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-red-100 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                  <Icon name="x" size={12} className="text-white" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Red / Lost</p>
                  <p className="text-xs text-gray-500">Lead was marked as lost (terminal failure)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-amber-100 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400">
                  <Icon name="minus" size={12} className="text-white" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Amber / On Hold</p>
                  <p className="text-xs text-gray-500">Lead is temporarily paused</p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Section 5: Approval Gates ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                <Icon name="shield" size={14} className="text-red-600" />
              </span>
              Approval Gates
            </h3>
            <p>
              Critical transitions (e.g., <strong>Negotiation &rarr; Won</strong>) can
              require manager approval before executing.
            </p>

            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-700">How it works:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <StepNumber n={1} />
                  <p className="text-xs">
                    Admin sets the transition&apos;s trigger type to <Badge variant="danger">APPROVAL</Badge>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <StepNumber n={2} />
                  <p className="text-xs">
                    When a user requests this transition, an <strong>approval request</strong> is created
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <StepNumber n={3} />
                  <p className="text-xs">
                    An authorized approver reviews and <strong>accepts or rejects</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <StepNumber n={4} />
                  <p className="text-xs">
                    Once approved, the transition executes automatically and lead moves forward
                  </p>
                </div>
              </div>
            </div>
            <Tip>
              Set &ldquo;Required Role&rdquo; on approval transitions to restrict who can approve
              (e.g., only MANAGER or ADMIN roles).
            </Tip>
          </section>

          {/* ─── Section 6: Automated Actions ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <Icon name="zap" size={14} className="text-amber-600" />
              </span>
              Automated Actions on Transitions
            </h3>
            <p className="mb-3">
              Each transition can trigger one or more automated actions when it executes.
              Configure these in the Workflow Builder under each transition.
            </p>
            <div className="space-y-2">
              {[
                {
                  icon: "edit" as const,
                  name: "Field Update",
                  desc: "Automatically update a field (e.g., sync Lead.status to match the new stage)",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  icon: "mail" as const,
                  name: "Send Email",
                  desc: "Notify the assignee, customer, or manager via email template",
                  color: "bg-green-100 text-green-600",
                },
                {
                  icon: "bell" as const,
                  name: "Send Notification",
                  desc: "Push an in-app notification to relevant users",
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  icon: "calendar" as const,
                  name: "Create Activity",
                  desc: "Log a call, meeting, or note activity automatically",
                  color: "bg-orange-100 text-orange-600",
                },
                {
                  icon: "check-circle" as const,
                  name: "Create Task",
                  desc: "Assign a follow-up task (e.g., \"Schedule demo within 2 days\")",
                  color: "bg-pink-100 text-pink-600",
                },
                {
                  icon: "external-link" as const,
                  name: "Webhook",
                  desc: "Call an external system (ERP, Slack, Zapier, etc.)",
                  color: "bg-gray-100 text-gray-600",
                },
                {
                  icon: "user" as const,
                  name: "Assign Owner",
                  desc: "Automatically reassign the lead to a specific user or team",
                  color: "bg-teal-100 text-teal-600",
                },
              ].map((action) => (
                <div
                  key={action.name}
                  className="flex items-start gap-3 rounded-md border border-gray-100 px-3 py-2"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${action.color}`}
                  >
                    <Icon name={action.icon} size={12} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{action.name}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Tip>
              The most important action is <strong>Field Update</strong> — it keeps the
              lead&apos;s status field in sync with the workflow state. This is pre-configured
              in the default Lead Pipeline.
            </Tip>
          </section>

          {/* ─── Section 7: History ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                <Icon name="clock" size={14} className="text-cyan-600" />
              </span>
              Pipeline History &amp; Audit Trail
            </h3>
            <p>
              Every stage change is recorded in the <strong>Pipeline History</strong>
              section on each lead&apos;s detail page. The history includes:
            </p>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <strong>Who</strong> made the change (user name)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <strong>When</strong> it happened (timestamp)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <strong>From / To</strong> stages
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <strong>Comments</strong> added during the transition
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <strong>Action type</strong> (manual, auto, fast-forward, approval)
              </li>
            </ul>
          </section>

          {/* ─── Section 8: Tips & Best Practices ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                <Icon name="star" size={14} className="text-emerald-600" />
              </span>
              Tips &amp; Best Practices
            </h3>
            <div className="space-y-2.5">
              <div className="rounded-md border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">Keep it simple</p>
                <p className="text-xs text-gray-500">
                  Start with 5-7 stages. Too many stages slow down your team and make
                  the pipeline hard to read.
                </p>
              </div>
              <div className="rounded-md border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">Always have an escape path</p>
                <p className="text-xs text-gray-500">
                  Add a &ldquo;Lost&rdquo; transition from every active stage so leads can be
                  closed at any point.
                </p>
              </div>
              <div className="rounded-md border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">Use On Hold wisely</p>
                <p className="text-xs text-gray-500">
                  Add &ldquo;On Hold&rdquo; transitions from in-progress stages and
                  &ldquo;Resume&rdquo; transitions back. Great for leads waiting on external events.
                </p>
              </div>
              <div className="rounded-md border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">Clone before changing</p>
                <p className="text-xs text-gray-500">
                  Use the <strong>Clone</strong> feature to create a copy before making
                  major changes. This gives you a safety net.
                </p>
              </div>
              <div className="rounded-md border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">Set up email alerts</p>
                <p className="text-xs text-gray-500">
                  Add &ldquo;Send Email&rdquo; actions on key transitions (e.g., Won, Lost) to
                  keep your team informed automatically.
                </p>
              </div>
            </div>
          </section>

          {/* ─── Section 9: FAQ ─── */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200">
                <Icon name="help-circle" size={14} className="text-gray-600" />
              </span>
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800">
                  How do I add a new stage between existing ones?
                </p>
                <p className="mt-1 text-gray-500">
                  Go to <NavPath path={["Settings", "Workflows", "Lead Pipeline"]} />,
                  click <strong>+ Add State</strong>, give it a sort order between
                  the two existing stages (e.g., if &ldquo;Verified&rdquo; is 20 and
                  &ldquo;Allocated&rdquo; is 30, use 25). Then add transitions connecting
                  the new stage to its neighbors. Click <strong>Publish</strong>.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Can I rename a stage?
                </p>
                <p className="mt-1 text-gray-500">
                  Yes. Click the edit icon on any state card and change the name.
                  The internal code stays the same for data consistency.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  What happens to existing leads when I change the pipeline?
                </p>
                <p className="mt-1 text-gray-500">
                  Existing leads keep their current stage. New transitions become
                  available immediately. If you remove a stage that leads are in,
                  those leads will need manual attention.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Can I have multiple pipelines for different lead types?
                </p>
                <p className="mt-1 text-gray-500">
                  Yes. Create additional LEAD workflows in{" "}
                  <NavPath path={["Settings", "Workflows"]} />.
                  Mark one as <strong>Default</strong> for auto-assignment. You can
                  assign specific workflows to leads manually.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Can a lead skip stages?
                </p>
                <p className="mt-1 text-gray-500">
                  Only if you configure a direct transition. For example, to allow
                  jumping from &ldquo;In Progress&rdquo; straight to &ldquo;Won&rdquo;, add a
                  transition between those two states.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  How do existing leads get their pipeline status?
                </p>
                <p className="mt-1 text-gray-500">
                  Existing leads are <strong>lazy-initialized</strong> — when you
                  first open a lead&apos;s detail page, a workflow instance is created
                  and fast-forwarded to match the lead&apos;s current status field.
                </p>
              </div>
            </div>
          </section>

          {/* ─── Quick Reference ─── */}
          <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              Quick Reference
            </p>
            <div className="space-y-1.5 text-xs text-blue-800">
              <p>
                <strong>Configure pipeline:</strong>{" "}
                <NavPath path={["Settings", "Workflows", "Lead Pipeline"]} />
              </p>
              <p>
                <strong>Add a stage:</strong> Workflow Detail &rarr; + Add State
              </p>
              <p>
                <strong>Add a transition:</strong> Workflow Detail &rarr; + Add Transition
              </p>
              <p>
                <strong>Require approval:</strong> Edit transition &rarr; Trigger Type = APPROVAL
              </p>
              <p>
                <strong>Add automation:</strong> Edit transition &rarr; Actions tab
              </p>
              <p>
                <strong>Reorder stages:</strong> Drag state cards in Workflow Builder
              </p>
              <p>
                <strong>Activate changes:</strong> Validate &rarr; Publish
              </p>
            </div>
          </section>
    </div>
  );
}
