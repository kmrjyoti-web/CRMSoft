'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function LeadListDevHelp() {
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
          <p className="font-semibold text-gray-700">model Lead {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, leadNumber (auto-generated)</p>
          <p className="ml-4 text-gray-500">status LeadStatus (NEW | VERIFIED | ALLOCATED | ...)</p>
          <p className="ml-4 text-gray-500">priority LeadPriority (LOW | MEDIUM | HIGH | URGENT)</p>
          <p className="ml-4 text-gray-500">expectedValue? Decimal, expectedCloseDate? DateTime</p>
          <p className="ml-4 text-gray-500">lostReason? String, notes? String</p>
          <p className="ml-4 text-gray-500">contactId &rarr; Contact (required)</p>
          <p className="ml-4 text-gray-500">organizationId? &rarr; Organization</p>
          <p className="ml-4 text-gray-500">allocatedToId? &rarr; User, allocatedAt? DateTime</p>
          <p className="ml-4 text-gray-500">createdById &rarr; User</p>
          <p className="ml-4 text-gray-500">isActive Boolean (soft toggle)</p>
          <p className="ml-4 text-gray-500">filters[] &rarr; LeadFilter (lookup-based tags)</p>
          <p className="ml-4 text-gray-500">activities[], demos[], quotations[] (relations)</p>
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
            { method: 'GET', path: '/api/v1/leads', desc: 'List (paginated, filter by status/priority/assignee)' },
            { method: 'POST', path: '/api/v1/leads', desc: 'Create lead (contactId required)' },
            { method: 'POST', path: '/api/v1/leads/quick-create', desc: 'Create with inline contact/org' },
            { method: 'GET', path: '/api/v1/leads/:id', desc: 'Detail (includes validNextStatuses, isTerminal)' },
            { method: 'PUT', path: '/api/v1/leads/:id', desc: 'Update (priority, expectedValue, notes, filterIds)' },
            { method: 'POST', path: '/api/v1/leads/:id/status', desc: 'Change status (state machine transition)' },
            { method: 'POST', path: '/api/v1/leads/:id/allocate', desc: 'Assign to sales rep (allocatedToId)' },
            { method: 'GET', path: '/api/v1/leads/:id/transitions', desc: 'Valid next statuses for lead' },
            { method: 'POST', path: '/api/v1/leads/:id/deactivate', desc: 'Deactivate (soft toggle off)' },
            { method: 'POST', path: '/api/v1/leads/:id/reactivate', desc: 'Reactivate (soft toggle on)' },
            { method: 'POST', path: '/api/v1/leads/:id/soft-delete', desc: 'Move to recycle bin' },
            { method: 'POST', path: '/api/v1/leads/:id/restore', desc: 'Restore from recycle bin' },
            { method: 'DELETE', path: '/api/v1/leads/:id/permanent', desc: 'Permanent delete' },
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
          <p className="text-gray-500">app/(main)/leads/page.tsx</p>
          <p className="ml-4 text-blue-700">&larr; LeadList.tsx</p>
          <p className="ml-8 text-gray-500">&boxvr;&horbar; TableFull (tableKey=&quot;leads&quot;, kanbanCategoryOptions)</p>
          <p className="ml-8 text-gray-500">&boxvr;&horbar; useEntityPanel &rarr; LeadForm / LeadDashboard</p>
          <p className="ml-8 text-gray-500">&boxvr;&horbar; useOpenDashboard &rarr; ContactDashboard / OrganizationDashboard</p>
          <p className="ml-8 text-gray-500">&boxvr;&horbar; BulkActionsBar + BulkEditPanel (priority, expectedCloseDate)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; ActionsMenu (Mass Update, Mass Delete)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>leadsService</Code> in leads.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;leads&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useLeadsList</Code>, <Code>useLeadDetail</Code>, <Code>useCreateLead</Code>, <Code>useQuickCreateLead</Code>, <Code>useUpdateLead</Code></p>
          <p className="text-gray-500">Status hooks: <Code>useChangeLeadStatus</Code>, <Code>useAllocateLead</Code>, <Code>useLeadTransitions</Code></p>
          <p className="text-gray-500">Lifecycle hooks: <Code>useDeactivateLead</Code>, <Code>useReactivateLead</Code>, <Code>useSoftDeleteLead</Code>, <Code>useRestoreLead</Code></p>
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
            <span>Lead status uses a <strong>state machine</strong> &mdash; <Code>GET /:id/transitions</Code> returns valid next statuses; <Code>POST /:id/status</Code> enforces transitions</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>10 statuses: NEW &rarr; VERIFIED &rarr; ALLOCATED &rarr; IN_PROGRESS &rarr; DEMO_SCHEDULED &rarr; QUOTATION_SENT &rarr; NEGOTIATION &rarr; WON / LOST / ON_HOLD</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>LeadDetail</Code> includes <Code>validNextStatuses</Code> and <Code>isTerminal</Code> flags from the backend</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Quick Create (<Code>POST /quick-create</Code>) accepts <Code>inlineContact</Code> and <Code>inlineOrganization</Code> &mdash; invalidates contacts + orgs query caches</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Kanban view driven by <Code>kanbanCategoryOptions</Code> with all 10 status values as columns</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Active toggle uses <Code>POST /deactivate</Code> and <Code>POST /reactivate</Code> (not PATCH/PUT)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Soft delete moves leads to recycle bin; invalidates both <Code>[&quot;leads&quot;]</Code> and <Code>[&quot;recycle-bin&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>flattenLeads()</Code> denormalizes nested contact/org/assignee into flat table rows with <Code>_maskingMeta</Code> passthrough</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
