'use client';

import { Icon } from '@/components/ui';

export function LeadListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="target" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Leads list is your sales pipeline at a glance. Every potential deal starts
          as a lead and progresses through stages &mdash; from <strong>New</strong> to
          <strong> Won</strong> or <strong>Lost</strong>. You can view leads as a
          traditional table or switch to Kanban board mode to drag leads between stages.
          Each lead is tied to a Contact and optionally to an Organization, with a priority
          level and an expected close date.
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
          <li>Click <strong>+ Create</strong> to capture a new lead (select or quick-create a Contact)</li>
          <li>Set the <strong>priority</strong> (Low / Medium / High / Urgent) and an expected close date</li>
          <li>The lead enters the <strong>New</strong> stage and is ready for verification</li>
          <li>Verify the lead, then allocate it to a sales rep &mdash; status moves to <strong>Allocated</strong></li>
          <li>The assignee progresses the lead: schedule demos, send quotations, negotiate</li>
          <li>Mark the lead as <strong>Won</strong> (convert to deal) or <strong>Lost</strong> (with reason)</li>
          <li>Use <strong>Kanban view</strong> to visually drag leads across stages for quick updates</li>
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
            <strong>Lead stages</strong> follow a defined workflow: NEW &rarr; VERIFIED &rarr;
            ALLOCATED &rarr; IN_PROGRESS &rarr; DEMO_SCHEDULED &rarr; QUOTATION_SENT &rarr;
            NEGOTIATION &rarr; WON / LOST. You can also put a lead ON_HOLD at any point.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Use <strong>Quick Create</strong> to add a lead with a brand-new contact in one step &mdash;
            no need to visit the Contacts page first.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Schedule <strong>follow-ups and activities</strong> directly from the lead dashboard
            to keep your pipeline moving. Overdue follow-ups are highlighted automatically.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            Use the <strong>Active toggle</strong> to deactivate stale leads without deleting them.
            Reactivate later if the prospect re-engages.
          </div>
        </div>
      </section>
    </div>
  );
}
