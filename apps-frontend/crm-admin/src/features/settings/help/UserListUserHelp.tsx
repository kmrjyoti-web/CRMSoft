'use client';

import { Icon } from '@/components/ui';

export function UserListUserHelp() {
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
          The Users screen is where you manage all CRM user accounts within your
          tenant. Each user has a role that determines their permissions across
          the system. From here you can create new users, assign roles, activate
          or deactivate accounts, and manage access to specific features. Users
          can be of different types (Admin, Manager, Executive) and their status
          can be toggled between Active and Inactive without deleting them.
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
          <li>Click <strong>+ Create</strong> to add a new user</li>
          <li>Enter <strong>First Name</strong>, <strong>Last Name</strong>, <strong>Email</strong>, and <strong>Phone</strong></li>
          <li>Select a <strong>Role</strong> (e.g., Admin, Sales Manager, Executive) to define the user&apos;s permissions</li>
          <li>Choose the <strong>User Type</strong> to categorize the account</li>
          <li>Save &mdash; the user can now log in and access features based on their role</li>
          <li>Use the <strong>status toggle</strong> (switch) in the table to quickly activate or deactivate a user</li>
          <li>Click a user row to open the edit panel and update their details</li>
          <li>To manage what each role can do, go to <strong>Settings &gt; Roles &amp; Permissions</strong></li>
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
            Use the <strong>filter sidebar</strong> to narrow users by role, user type,
            or active status &mdash; helpful when managing large teams.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Deactivating</strong> a user prevents login without removing their data.
            Their activities, leads, and history remain intact for auditing.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Roles</strong> control feature access. Create custom roles in
            Settings &gt; Roles with granular permissions for each module.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            Use <strong>Bulk Actions</strong> &mdash; select multiple users with checkboxes
            and perform bulk delete (soft delete to recycle bin) in one step.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            The <strong>Mass Delete</strong> option in the Actions menu lets you
            delete users in bulk from a dedicated page with additional filters.
          </div>
        </div>
      </section>
    </div>
  );
}
