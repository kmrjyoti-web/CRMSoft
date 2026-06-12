'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function ContactListDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Contact {'{'}</p>
          <p className="ml-4 text-gray-500">id             String        @id @default(uuid())</p>
          <p className="ml-4 text-gray-500">tenantId       String        @map(&quot;tenant_id&quot;)</p>
          <p className="ml-4 text-gray-500">firstName      String        @map(&quot;first_name&quot;)</p>
          <p className="ml-4 text-gray-500">lastName       String        @map(&quot;last_name&quot;)</p>
          <p className="ml-4 text-gray-500">designation    String?</p>
          <p className="ml-4 text-gray-500">department     String?</p>
          <p className="ml-4 text-gray-500">notes          String?</p>
          <p className="ml-4 text-gray-500">isActive       Boolean       @default(true)</p>
          <p className="ml-4 text-gray-500">isDeleted      Boolean       @default(false)</p>
          <p className="ml-4 text-gray-500">organizationId String?       @map(&quot;organization_id&quot;)</p>
          <p className="ml-4 text-gray-500">createdById    String        @map(&quot;created_by_id&quot;)</p>
          <p className="ml-4 text-gray-500">createdAt      DateTime      @default(now())</p>
          <p className="ml-4 text-gray-500">updatedAt      DateTime      @updatedAt</p>
          <p className="ml-4 text-gray-400 italic">// Relations: leads, filters, activities,</p>
          <p className="ml-4 text-gray-400 italic">// communications, contactOrganizations</p>
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
            { method: 'GET', path: '/api/v1/contacts', desc: 'List with search, pagination, filters' },
            { method: 'GET', path: '/api/v1/contacts/:id', desc: 'Get by ID (includes comms, orgs, leads, counts)' },
            { method: 'POST', path: '/api/v1/contacts', desc: 'Create contact with communications' },
            { method: 'PUT', path: '/api/v1/contacts/:id', desc: 'Update contact fields' },
            { method: 'POST', path: '/api/v1/contacts/:id/deactivate', desc: 'Set isActive=false' },
            { method: 'POST', path: '/api/v1/contacts/:id/reactivate', desc: 'Set isActive=true' },
            { method: 'POST', path: '/api/v1/contacts/:id/soft-delete', desc: 'Move to recycle bin (isDeleted=true)' },
            { method: 'POST', path: '/api/v1/contacts/:id/restore', desc: 'Restore from recycle bin' },
            { method: 'DELETE', path: '/api/v1/contacts/:id/permanent', desc: 'Permanent delete (irreversible)' },
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
          <p className="text-gray-500">app/(main)/contacts/page.tsx</p>
          <p className="ml-4 text-blue-700">&bull; ContactList.tsx</p>
          <p className="ml-8 text-gray-500">&bull; TableFull (tableKey=&quot;contacts&quot;)</p>
          <p className="ml-8 text-gray-500">&bull; useEntityPanel &rarr; ContactForm / ContactDashboard</p>
          <p className="ml-8 text-gray-500">&bull; useBulkSelect + BulkActionsBar + BulkEditPanel</p>
          <p className="ml-8 text-gray-500">&bull; useSoftDeleteContact (recycle bin)</p>
          <p className="ml-8 text-gray-500">&bull; useDeactivateContact / useReactivateContact (toggle)</p>
          <p className="ml-8 text-gray-500">&bull; useOpenDashboard &rarr; OrganizationDashboard (inline)</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="code" size={14} className="text-amber-600" />
          </span>
          Hooks &amp; Service
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex gap-2"><Code>useContactsList(params)</Code> <span className="text-gray-400">GET list with filters</span></div>
          <div className="flex gap-2"><Code>useContactDetail(id)</Code> <span className="text-gray-400">GET single (enabled when id truthy)</span></div>
          <div className="flex gap-2"><Code>useCreateContact()</Code> <span className="text-gray-400">POST mutation</span></div>
          <div className="flex gap-2"><Code>useUpdateContact()</Code> <span className="text-gray-400">PUT mutation</span></div>
          <div className="flex gap-2"><Code>useDeactivateContact()</Code> <span className="text-gray-400">POST deactivate</span></div>
          <div className="flex gap-2"><Code>useReactivateContact()</Code> <span className="text-gray-400">POST reactivate</span></div>
          <div className="flex gap-2"><Code>useSoftDeleteContact()</Code> <span className="text-gray-400">POST soft-delete (invalidates recycle-bin)</span></div>
          <div className="flex gap-2"><Code>useRestoreContact()</Code> <span className="text-gray-400">POST restore (invalidates recycle-bin)</span></div>
          <div className="flex gap-2"><Code>usePermanentDeleteContact()</Code> <span className="text-gray-400">DELETE permanent</span></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Service: <Code>features/contacts/services/contacts.service.ts</Code> &rarr; <Code>contactsService</Code>
        </p>
        <p className="text-xs text-gray-500">
          Query key: <Code>[&quot;contacts&quot;, params]</Code>
        </p>
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
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Communications are flattened before display: <Code>getPrimaryComm(contact, &quot;EMAIL&quot;)</Code> picks the primary email/phone</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Contact names are clickable links that open <Code>ContactDashboard</Code> via <Code>useEntityPanel</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Organization column opens <Code>OrganizationDashboard</Code> inline via <Code>useOpenDashboard</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Status column uses <Code>Switch</Code> toggle for deactivate/reactivate (not a text badge)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Soft-delete invalidates both <Code>[&quot;contacts&quot;]</Code> and <Code>[&quot;recycle-bin&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Filters use <Code>useDynamicFilterConfig</Code> with lookup mappings from <Code>contact-filters.ts</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Types: <Code>ContactListItem</Code> (list), <Code>ContactDetail</Code> (detail with leads/counts), <Code>ContactCreateData</Code> / <Code>ContactUpdateData</Code> (DTOs)</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
