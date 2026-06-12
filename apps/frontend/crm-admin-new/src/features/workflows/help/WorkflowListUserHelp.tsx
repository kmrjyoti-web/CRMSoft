'use client';

import { Icon } from '@/components/ui';

export function WorkflowListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="git-branch" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Workflows screen lets you define and manage the lifecycle of
          entities in your CRM &mdash; Leads, Quotations, Invoices,
          Installations, and Tickets. Each workflow is built from
          <strong> States</strong> (stages an entity passes through) and
          <strong> Transitions</strong> (allowed movements between states).
          Workflows automate status tracking, enforce business rules, and
          trigger actions like sending emails or assigning tasks when entities
          move between states.
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
          <li>Click <strong>Add Workflow</strong> to create a new workflow</li>
          <li>Enter a <strong>Name</strong>, unique <strong>Code</strong>, and select the <strong>Entity Type</strong> (Lead, Quotation, etc.)</li>
          <li>Optionally mark it as <strong>Default</strong> so new entities of that type use it automatically</li>
          <li>Add <strong>States</strong> &mdash; define an Initial state, Intermediate states, and Terminal states (Success/Failure/Paused)</li>
          <li>Add <strong>Transitions</strong> &mdash; define which state movements are allowed (e.g., New &rarr; Verified)</li>
          <li>Configure <strong>Trigger Types</strong>: Manual (user clicks), Auto (condition-based), Scheduled, or Approval</li>
          <li>Attach <strong>Actions</strong> to transitions (Send Email, Update Field, Create Task, etc.)</li>
          <li>Click <strong>Validate</strong> to check for errors, then <strong>Publish</strong> to activate</li>
          <li>Use <strong>Clone</strong> to duplicate a workflow for creating variations without modifying the original</li>
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
            Use the <strong>entity type filter buttons</strong> to narrow workflows by type &mdash;
            especially useful when you have multiple workflows across different entities.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Every workflow needs exactly <strong>one Initial state</strong>. The validation
            check will flag this if missing before you can publish.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Use <strong>sort order</strong> numbers like 10, 20, 30 for states to leave room
            for inserting new stages later without renumbering everything.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>Approval transitions</strong> require a manager or admin to approve before
            the entity moves to the next state &mdash; great for high-value deals.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Click the <strong>Help</strong> button on the list page to open a detailed guide
            covering states, transitions, automated actions, and FAQs.
          </div>
        </div>
      </section>
    </div>
  );
}
