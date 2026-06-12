'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function ActivityListDevHelp() {
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
          <p className="font-semibold text-gray-700">model Activity {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, type (ActivityType enum)</p>
          <p className="ml-4 text-gray-500">subject String, description? String</p>
          <p className="ml-4 text-gray-500">outcome? String, duration? Int (minutes)</p>
          <p className="ml-4 text-gray-500">scheduledAt? DateTime, endTime? DateTime</p>
          <p className="ml-4 text-gray-500">completedAt? DateTime</p>
          <p className="ml-4 text-gray-500">latitude? Float, longitude? Float, locationName? String</p>
          <p className="ml-4 text-gray-500">leadId? -&gt; Lead, contactId? -&gt; Contact</p>
          <p className="ml-4 text-gray-500">isActive Boolean (default true)</p>
          <p className="ml-4 text-gray-500">createdById -&gt; User</p>
          <p className="ml-4 text-gray-500">createdAt, updatedAt, deletedAt? (soft delete)</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          ActivityType enum: CALL | EMAIL | MEETING | NOTE | WHATSAPP | SMS | VISIT
        </p>
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
            { method: 'GET', path: '/api/v1/activities', desc: 'List (paginated, filter by type/lead/contact/date)' },
            { method: 'GET', path: '/api/v1/activities/:id', desc: 'Detail with lead/contact relations' },
            { method: 'POST', path: '/api/v1/activities', desc: 'Create activity' },
            { method: 'PUT', path: '/api/v1/activities/:id', desc: 'Update activity' },
            { method: 'POST', path: '/api/v1/activities/:id/complete', desc: 'Mark complete with outcome' },
            { method: 'POST', path: '/api/v1/activities/:id/deactivate', desc: 'Set isActive = false' },
            { method: 'POST', path: '/api/v1/activities/:id/reactivate', desc: 'Set isActive = true' },
            { method: 'POST', path: '/api/v1/activities/:id/soft-delete', desc: 'Soft delete (recycle bin)' },
            { method: 'POST', path: '/api/v1/activities/:id/restore', desc: 'Restore from recycle bin' },
            { method: 'DELETE', path: '/api/v1/activities/:id', desc: 'Delete activity' },
            { method: 'DELETE', path: '/api/v1/activities/:id/permanent', desc: 'Permanent delete' },
            { method: 'GET', path: '/api/v1/activities/entity/:type/:id', desc: 'Activities by entity (Lead/Contact)' },
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
          <p className="text-gray-500">app/(main)/activities/page.tsx</p>
          <p className="ml-4 text-blue-700">&bull; ActivityList.tsx</p>
          <p className="ml-8 text-gray-500">&bull; TableFull (tableKey=&quot;activities&quot;)</p>
          <p className="ml-8 text-gray-500">&bull; useEntityPanel &rarr; ActivityForm</p>
          <p className="ml-8 text-gray-500">&bull; BulkActionsBar + BulkEditPanel</p>
          <p className="ml-8 text-gray-500">&bull; ActionsMenu (Mass Update / Mass Delete)</p>
          <p className="ml-8 text-gray-500">&bull; Switch toggle (deactivate/reactivate)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>activitiesService</Code> in activities.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;activities&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useActivitiesList</Code>, <Code>useActivityDetail</Code>, <Code>useCreateActivity</Code>, <Code>useUpdateActivity</Code>, <Code>useCompleteActivity</Code></p>
          <p className="text-gray-500">Lifecycle: <Code>useSoftDeleteActivity</Code>, <Code>useRestoreActivity</Code>, <Code>useDeactivateActivity</Code>, <Code>useReactivateActivity</Code></p>
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
            <span>Soft delete sends to <strong>recycle bin</strong> &mdash; invalidates both <Code>[&quot;activities&quot;]</Code> and <Code>[&quot;recycle-bin&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Deactivate/Reactivate uses <Code>POST</Code> (not PUT) &mdash; separate from soft delete lifecycle</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Entity lookup: <Code>GET /activities/entity/:type/:id</Code> fetches all activities for a specific lead or contact</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Bulk edit supports <Code>type</Code> and <Code>subject</Code> fields via <Code>BulkEditPanel</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>List response may be nested: <Code>{'data.data'}</Code> &mdash; component handles both flat and nested formats</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
