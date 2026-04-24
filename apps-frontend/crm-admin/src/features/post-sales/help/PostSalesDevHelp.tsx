'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function PostSalesDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* ── Prisma Models ──────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Models (key fields)
        </h3>

        {/* Installation */}
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Installation {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, installationNo (auto-generated)</p>
          <p className="ml-4 text-gray-500">title, description?, status (InstallationStatus enum)</p>
          <p className="ml-4 text-gray-500">leadId? &rarr; Lead, contactId? &rarr; Contact, organizationId? &rarr; Organization</p>
          <p className="ml-4 text-gray-500">quotationId? &rarr; Quotation, invoiceId? &rarr; Invoice</p>
          <p className="ml-4 text-gray-500">scheduledDate, startedDate?, completedDate?</p>
          <p className="ml-4 text-gray-500">address?, city?, state?, pincode?</p>
          <p className="ml-4 text-gray-500">assignedToId? &rarr; User</p>
          <p className="ml-4 text-gray-500">notes?, internalNotes?</p>
          <p className="ml-4 text-gray-500">createdById &rarr; User, createdAt, updatedAt</p>
          <p className="text-gray-700">{'}'}</p>
          <p className="mt-1 text-gray-400">Status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED</p>
        </div>

        {/* Training */}
        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Training {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, trainingNo (auto-generated)</p>
          <p className="ml-4 text-gray-500">title, description?, topics?, status (TrainingStatus enum)</p>
          <p className="ml-4 text-gray-500">mode (TrainingMode: ONSITE | REMOTE | HYBRID)</p>
          <p className="ml-4 text-gray-500">leadId? &rarr; Lead, contactId? &rarr; Contact, organizationId? &rarr; Organization</p>
          <p className="ml-4 text-gray-500">scheduledDate, startTime?, endTime?, duration?</p>
          <p className="ml-4 text-gray-500">completedDate?</p>
          <p className="ml-4 text-gray-500">trainerName?, trainerContact?, location?, meetingLink?</p>
          <p className="ml-4 text-gray-500">maxAttendees?, actualAttendees?, feedback?, rating?</p>
          <p className="ml-4 text-gray-500">notes?, internalNotes?</p>
          <p className="ml-4 text-gray-500">createdById &rarr; User, createdAt, updatedAt</p>
          <p className="text-gray-700">{'}'}</p>
          <p className="mt-1 text-gray-400">Status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED</p>
        </div>

        {/* Ticket */}
        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Ticket {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, ticketNo (auto-generated)</p>
          <p className="ml-4 text-gray-500">subject, description?, status (TicketStatus enum)</p>
          <p className="ml-4 text-gray-500">priority (LOW | MEDIUM | HIGH | URGENT)</p>
          <p className="ml-4 text-gray-500">category (INSTALLATION | PRODUCT | BILLING | GENERAL | FEATURE_REQUEST | BUG)</p>
          <p className="ml-4 text-gray-500">contactId? &rarr; Contact, organizationId? &rarr; Organization, leadId? &rarr; Lead</p>
          <p className="ml-4 text-gray-500">assignedToId? &rarr; User</p>
          <p className="ml-4 text-gray-500">resolvedAt?, resolvedById?, resolution?</p>
          <p className="ml-4 text-gray-500">closedAt?, closedById?</p>
          <p className="ml-4 text-gray-500">tags?, notes?, internalNotes?</p>
          <p className="ml-4 text-gray-500">comments[] &rarr; TicketComment</p>
          <p className="ml-4 text-gray-500">createdById &rarr; User, createdAt, updatedAt</p>
          <p className="text-gray-700">{'}'}</p>
          <p className="mt-1 text-gray-400">Status: OPEN | IN_PROGRESS | ON_HOLD | RESOLVED | CLOSED | REOPENED</p>
        </div>
      </section>

      {/* ── API Endpoints ──────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>

        <p className="mb-2 text-xs font-semibold text-gray-700">Installations</p>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/installations', desc: 'Create installation' },
            { method: 'GET', path: '/api/v1/installations', desc: 'List (paginated, filterable)' },
            { method: 'GET', path: '/api/v1/installations/:id', desc: 'Detail by ID' },
            { method: 'PUT', path: '/api/v1/installations/:id', desc: 'Update installation' },
            { method: 'POST', path: '/api/v1/installations/:id/start', desc: 'Mark as In Progress' },
            { method: 'POST', path: '/api/v1/installations/:id/complete', desc: 'Mark as Completed' },
            { method: 'POST', path: '/api/v1/installations/:id/cancel', desc: 'Cancel installation' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'warning'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs font-semibold text-gray-700">Trainings</p>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/trainings', desc: 'Create training' },
            { method: 'GET', path: '/api/v1/trainings', desc: 'List (paginated, filterable)' },
            { method: 'GET', path: '/api/v1/trainings/:id', desc: 'Detail by ID' },
            { method: 'PUT', path: '/api/v1/trainings/:id', desc: 'Update training' },
            { method: 'POST', path: '/api/v1/trainings/:id/start', desc: 'Mark as In Progress' },
            { method: 'POST', path: '/api/v1/trainings/:id/complete', desc: 'Mark as Completed' },
            { method: 'POST', path: '/api/v1/trainings/:id/cancel', desc: 'Cancel training' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'warning'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs font-semibold text-gray-700">Tickets</p>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/tickets', desc: 'Create ticket' },
            { method: 'GET', path: '/api/v1/tickets', desc: 'List (paginated, filterable)' },
            { method: 'GET', path: '/api/v1/tickets/:id', desc: 'Detail with comments' },
            { method: 'PUT', path: '/api/v1/tickets/:id', desc: 'Update ticket' },
            { method: 'POST', path: '/api/v1/tickets/:id/assign', desc: 'Assign to agent' },
            { method: 'POST', path: '/api/v1/tickets/:id/resolve', desc: 'Resolve with summary' },
            { method: 'POST', path: '/api/v1/tickets/:id/close', desc: 'Close ticket' },
            { method: 'POST', path: '/api/v1/tickets/:id/reopen', desc: 'Reopen closed ticket' },
            { method: 'POST', path: '/api/v1/tickets/:id/comments', desc: 'Add comment to thread' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'warning'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Frontend Architecture ──────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">src/features/post-sales/</p>
          <p className="ml-4 text-gray-500">components/</p>
          <p className="ml-8 text-blue-700">InstallationList.tsx &mdash; TableFull list view</p>
          <p className="ml-8 text-blue-700">InstallationForm.tsx &mdash; create/edit sidebar form</p>
          <p className="ml-8 text-blue-700">TrainingList.tsx &mdash; TableFull list view</p>
          <p className="ml-8 text-blue-700">TrainingForm.tsx &mdash; create/edit sidebar form</p>
          <p className="ml-8 text-blue-700">TicketList.tsx &mdash; TableFull list view</p>
          <p className="ml-8 text-blue-700">TicketForm.tsx &mdash; create/edit sidebar form</p>
          <p className="ml-4 text-gray-500">hooks/</p>
          <p className="ml-8 text-green-700">usePostSales.ts &mdash; all TanStack Query hooks</p>
          <p className="ml-4 text-gray-500">services/</p>
          <p className="ml-8 text-green-700">post-sales.service.ts &mdash; API client wrappers</p>
          <p className="ml-4 text-gray-500">types/</p>
          <p className="ml-8 text-amber-700">post-sales.types.ts &mdash; all interfaces &amp; type unions</p>
          <p className="ml-4 text-gray-500">utils/</p>
          <p className="ml-8 text-amber-700">installation-filters.ts, training-filters.ts, ticket-filters.ts</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>installationService</Code>, <Code>trainingService</Code>, <Code>ticketService</Code></p>
          <p className="text-gray-500">Query keys: <Code>[&quot;installations&quot;, params]</Code>, <Code>[&quot;trainings&quot;, params]</Code>, <Code>[&quot;tickets&quot;, params]</Code></p>
          <p className="text-gray-500">All three lists use <Code>useEntityPanel</Code> for sidebar CRUD with <Code>useTableFilters</Code></p>
        </div>
      </section>

      {/* ── Key Patterns ───────────────────────────────────── */}
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
            <span>Status transitions use dedicated <strong>POST action endpoints</strong> (start, complete, cancel, resolve, close, reopen) &mdash; not PATCH on the status field</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Installations and Trainings share the same lifecycle: <Code>SCHEDULED &rarr; IN_PROGRESS &rarr; COMPLETED | CANCELLED</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Tickets have a richer lifecycle with <Code>ON_HOLD</Code> and <Code>REOPENED</Code> states and support a <strong>comment thread</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Ticket assignment uses <Code>POST /tickets/:id/assign</Code> with <Code>AssignTicketData</Code> (assignedToId)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Ticket resolution requires a <Code>resolution</Code> string via <Code>ResolveTicketData</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>All three entities link to <Code>Contact</Code>, <Code>Organization</Code>, and <Code>Lead</Code> &mdash; flattened for table display</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Response unwrapping handles both flat and nested formats: <Code>{'data?.data'}</Code> with Array.isArray fallback</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Mutation hooks invalidate the parent query key to auto-refresh the list after any create/update/action</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
