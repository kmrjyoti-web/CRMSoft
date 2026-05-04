'use client';

import { Icon } from '@/components/ui';

export function TaskListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="check-square" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Tasks list is your team's central work tracker. Tasks represent
          actionable items such as follow-ups, call-backs, meetings, demos,
          approvals, and reviews. Each task has a priority, status, due date,
          and can be assigned to a team member. Tasks can also be linked to
          leads, contacts, or other entities for full traceability.
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
          <li>Click <strong>+ Create</strong> to add a new task</li>
          <li>Enter a title and select the task type (General, Follow-up, Call Back, Meeting, Demo, Approval, Review)</li>
          <li>Set priority (Low, Medium, High, Urgent, Critical) and due date</li>
          <li>Assign the task to a team member</li>
          <li>Optionally add estimated time, tags, and link to a lead or contact</li>
          <li>The assignee works the task, updating status as it progresses (Open &rarr; In Progress &rarr; Completed)</li>
          <li>For Approval-type tasks, a manager can Approve or Reject directly from the list</li>
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
            <strong>Priorities:</strong> Use Urgent and Critical sparingly.
            Color-coded priority badges make it easy to spot high-priority
            items at a glance.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Filters:</strong> Filter by status, priority, type, or due
            date to focus on what matters most. Combine filters for advanced views.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Approval Flow:</strong> Tasks with status &quot;Pending
            Approval&quot; show Approve/Reject actions directly in the row
            actions menu for quick manager decisions.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>Time Tracking:</strong> Enter estimated minutes when creating
            a task and actual minutes when completing it to track team productivity.
          </div>
        </div>
      </section>
    </div>
  );
}
