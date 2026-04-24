'use client';

import { Icon } from '@/components/ui';

export function InstallationListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="tool" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Installations list tracks all product installation jobs for your
          customers. Each installation record captures scheduling details,
          assigned technician, customer contact, organization, location address,
          and status progression from Scheduled through In Progress to Completed.
          Use this screen to plan, monitor, and close out installation work.
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
          <li>Click <strong>+ Create</strong> to schedule a new installation</li>
          <li>Enter a title, select the contact and organization, and set the scheduled date</li>
          <li>Optionally link to a lead, quotation, or invoice for traceability</li>
          <li>Fill in the site address (address, city, state, pincode) and assign a technician</li>
          <li>Save &mdash; the installation appears with status <strong>Scheduled</strong></li>
          <li>When the technician begins work, mark the installation as <strong>In Progress</strong></li>
          <li>Once finished, mark it as <strong>Completed</strong> &mdash; or <strong>Cancel</strong> if no longer needed</li>
          <li>Use internal notes to record observations visible only to your team</li>
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
            Use the <strong>filter sidebar</strong> to narrow installations by status,
            contact, organization, assigned technician, or date range.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Each installation receives an auto-generated <strong>Installation No</strong> for
            easy reference in conversations and reports.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Link installations to <strong>quotations or invoices</strong> so you can trace
            the full sales-to-delivery journey from one record.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            The <strong>internal notes</strong> field is only visible to your team &mdash; use
            it for site-specific instructions or access details.
          </div>
        </div>
      </section>
    </div>
  );
}
