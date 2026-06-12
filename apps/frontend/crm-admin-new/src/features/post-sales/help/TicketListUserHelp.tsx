'use client';

import { Icon } from '@/components/ui';

export function TicketListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="life-buoy" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Tickets list is your support desk for tracking customer issues,
          requests, and bugs. Each ticket captures a subject, priority (Low to
          Urgent), category (Installation, Product, Billing, General, Feature
          Request, Bug), assignment, resolution details, and a comment thread.
          Use this screen to log, triage, resolve, and close support tickets.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Click <strong>+ Create</strong> to log a new support ticket</li>
          <li>Enter a subject, description, and select a priority and category</li>
          <li>Link the ticket to a contact and organization</li>
          <li>Assign the ticket to a team member for resolution</li>
          <li>Save &mdash; the ticket appears with status <strong>Open</strong></li>
          <li>The assignee moves the ticket to <strong>In Progress</strong> when work begins</li>
          <li>If waiting on external input, set the ticket to <strong>On Hold</strong></li>
          <li>Once fixed, mark as <strong>Resolved</strong> and enter the resolution summary</li>
          <li>After the customer confirms, <strong>Close</strong> the ticket</li>
          <li>If the issue recurs, <strong>Reopen</strong> the ticket to resume work</li>
          <li>Use the comment thread to log updates and communicate with the team</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Use the <strong>filter sidebar</strong> to narrow tickets by status,
            priority, category, assigned agent, contact, or date range.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Each ticket receives an auto-generated <strong>Ticket No</strong> for
            easy reference when communicating with customers.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Use <strong>tags</strong> to group related tickets (e.g., &ldquo;v2-upgrade&rdquo;,
            &ldquo;hardware&rdquo;) for quick filtering and reporting.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            The <strong>resolution</strong> field is captured when resolving &mdash; write a clear
            summary so future agents can reference it for similar issues.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Tickets support a full lifecycle: <strong>Open &rarr; In Progress &rarr;
            On Hold &rarr; Resolved &rarr; Closed</strong>, with the ability to reopen at any time.
          </div>
        </div>
      </section>
    </div>
  );
}
