'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function OrganizationListDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Model (key fields)
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Organization {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name</p>
          <p className="ml-4 text-gray-500">website?, email?, phone?, gstNumber?</p>
          <p className="ml-4 text-gray-500">address?, city?, state?, country?, pincode?</p>
          <p className="ml-4 text-gray-500">industry?, annualRevenue? (Decimal), numberOfEmployees? (Int)</p>
          <p className="ml-4 text-gray-500">notes?, isActive Boolean</p>
          <p className="ml-4 text-gray-500">contacts[] &rarr; OrganizationContact (relationType, isPrimary)</p>
          <p className="ml-4 text-gray-500">leads[] &rarr; Lead (leadNumber, status, priority, expectedValue)</p>
          <p className="ml-4 text-gray-500">filters[] &rarr; OrganizationFilter (lookupValueId)</p>
          <p className="ml-4 text-gray-500">createdBy? &rarr; User, createdAt, updatedAt, deletedAt?</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/organizations', desc: 'List (paginated, filter by city/industry/isActive)' },
            { method: 'GET', path: '/api/v1/organizations/:id', desc: 'Detail with contacts[], leads[], _count' },
            { method: 'POST', path: '/api/v1/organizations', desc: 'Create (name required, filterIds optional)' },
            { method: 'PUT', path: '/api/v1/organizations/:id', desc: 'Update (partial, all fields optional)' },
            { method: 'POST', path: '/api/v1/organizations/:id/deactivate', desc: 'Set isActive = false' },
            { method: 'POST', path: '/api/v1/organizations/:id/reactivate', desc: 'Set isActive = true' },
            { method: 'POST', path: '/api/v1/organizations/:id/soft-delete', desc: 'Move to recycle bin (sets deletedAt)' },
            { method: 'POST', path: '/api/v1/organizations/:id/restore', desc: 'Restore from recycle bin' },
            { method: 'DELETE', path: '/api/v1/organizations/:id/permanent', desc: 'Permanent hard delete' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/organizations/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; OrganizationList.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; TableFull (tableKey=&quot;organizations&quot;)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; useEntityPanel &rarr; OrganizationForm / OrganizationDashboard</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; BulkActionsBar + BulkEditPanel (industry, city, country)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; ActionsMenu (Mass Update, Mass Delete)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>organizationsService</Code> in organizations.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;organizations&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useOrganizationsList</Code>, <Code>useOrganizationDetail</Code>, <Code>useCreateOrganization</Code>, <Code>useUpdateOrganization</Code></p>
          <p className="text-gray-500">Mutations: <Code>useDeactivateOrganization</Code>, <Code>useReactivateOrganization</Code>, <Code>useSoftDeleteOrganization</Code>, <Code>useRestoreOrganization</Code></p>
          <p className="text-gray-500">Columns: name, industry, city, phone, website, status (Switch toggle), createdAt</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
            <Icon name="alert-triangle" size={14} className="text-red-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Status toggle uses <Code>POST /organizations/:id/deactivate</Code> and <Code>/reactivate</Code> (not PATCH)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Soft delete sets <Code>deletedAt</Code> and invalidates both <Code>[&quot;organizations&quot;]</Code> and <Code>[&quot;recycle-bin&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Response unwrap: nested <Code>data.data</Code> pattern handled in <Code>flattenOrganizations</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Contact relations use <Code>OrgRelationType</Code> enum: PRIMARY_CONTACT, EMPLOYEE, CONSULTANT, PARTNER, VENDOR, DIRECTOR, FOUNDER</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Bulk edit limited to three fields: <Code>industry</Code>, <Code>city</Code>, <Code>country</Code></span>
          </li>
        </ul>
      </section>
    </div>
  );
}
