'use client';

import { Icon } from '@/components/ui';

export function ActivityListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="calendar" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Activities list tracks every interaction your team has with leads
          and contacts. Activities include phone calls, emails, in-person
          meetings, WhatsApp messages, SMS, site visits, and internal notes.
          Each activity is linked to a lead or contact so you have a complete
          communication timeline.
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
          <li>Click <strong>+ Create</strong> to log a new activity</li>
          <li>Select the activity type (Call, Email, Meeting, Visit, etc.)</li>
          <li>Enter a subject and optional description</li>
          <li>Link the activity to a <strong>Lead</strong> or <strong>Contact</strong></li>
          <li>Set the scheduled date/time and expected duration</li>
          <li>After completing the activity, mark it as done and record the outcome</li>
          <li>Use filters to review activities by type, date range, or linked entity</li>
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
            <strong>Follow-ups:</strong> After logging a call or meeting, create a
            follow-up activity to ensure no lead falls through the cracks.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Tour Plans:</strong> Use the Visit type to log field visits.
            Location name and GPS coordinates are captured automatically when available.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Bulk Operations:</strong> Select multiple activities to bulk
            edit type/subject or bulk delete in one action using the floating
            action bar.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>Active Toggle:</strong> Use the switch in the Active column
            to deactivate activities without deleting them. Deactivated activities
            are hidden from default views.
          </div>
        </div>
      </section>
    </div>
  );
}
