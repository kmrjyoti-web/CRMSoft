'use client';

import { Icon } from '@/components/ui';

export function ContactListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="users" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Contacts list is your central directory for managing all people in
          your CRM. Each contact stores names, email addresses, phone numbers,
          designations, departments, and links to organizations. Use this screen
          to find, create, edit, and deactivate contacts across your business.
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
          <li>Click <strong>+ Create</strong> to add a new contact</li>
          <li>Enter first name, last name, and at least one communication (email or phone)</li>
          <li>Link the contact to an organization and set the relationship type (e.g., Employee, Director)</li>
          <li>Optionally set designation, department, and notes</li>
          <li>Save &mdash; the contact is now searchable and available for leads, activities, and quotations</li>
          <li>Click a contact name to open the dashboard with full details, linked leads, and activity history</li>
          <li>Use the status toggle to deactivate or reactivate contacts without deleting them</li>
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
            Use the <strong>filter sidebar</strong> to narrow contacts by designation, department,
            organization, or active status &mdash; great for finding specific groups quickly.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Deleting a contact performs a <strong>soft delete</strong> (moves to recycle bin).
            You can restore it later from Settings &gt; Recycle Bin.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Click an <strong>organization name</strong> in the table to open the organization
            dashboard without leaving the contacts page.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            Use <strong>Bulk Actions</strong> &mdash; select multiple contacts with checkboxes,
            then bulk edit fields like designation/department or bulk delete in one step.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Designation and department values come from <strong>Settings &gt; Lookups</strong>.
            Add new values there if the dropdown options are missing what you need.
          </div>
        </div>
      </section>
    </div>
  );
}
