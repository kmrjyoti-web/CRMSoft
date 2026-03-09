'use client';

import { Icon } from '@/components/ui';

export function OrganizationListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="building" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Organizations list is your central directory of companies, firms, and
          institutions you do business with. Each organization record stores key
          details such as industry, address, phone, website, and GST number. You can
          link contacts to organizations (as employees, directors, partners, etc.)
          and track associated leads and deals.
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
          <li>Click <strong>+ Create</strong> to add a new organization</li>
          <li>Enter the organization name, industry, and address details</li>
          <li>Add phone, email, website, and GST number if available</li>
          <li>Save the organization — it is now available for linking</li>
          <li>Open the organization to link contacts (employees, directors, partners)</li>
          <li>Create leads and deals associated with the organization</li>
          <li>Use filters to search by city, industry, or active status</li>
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
            <strong>Link contacts</strong> to organizations to build a complete picture
            of who you work with at each company. Contacts can be linked as Primary
            Contact, Employee, Consultant, Partner, Vendor, Director, or Founder.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Use the <strong>active/inactive toggle</strong> in the Status column to
            quickly deactivate organizations you no longer work with, without deleting
            them.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Bulk actions</strong> are available — select multiple rows to mass
            update fields like industry, city, or country, or bulk delete to the
            recycle bin.
          </div>
        </div>
      </section>
    </div>
  );
}
