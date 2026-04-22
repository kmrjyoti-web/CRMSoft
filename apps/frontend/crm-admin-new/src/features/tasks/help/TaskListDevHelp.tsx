'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function TaskListDevHelp() {
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
          <p className="font-semibold text-gray-700">model Task {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, taskNumber String (auto-generated)</p>
          <p className="ml-4 text-gray-500">title String, description? String</p>
          <p className="ml-4 text-gray-500">type TaskType (GENERAL|FOLLOW_UP|CALL_BACK|MEETING|DEMO|APPROVAL|REVIEW|...)</p>
          <p className="ml-4 text-gray-500">status TaskStatus (OPEN|IN_PROGRESS|COMPLETED|CANCELLED|ON_HOLD|OVERDUE|PENDING_APPROVAL)</p>
          <p className="ml-4 text-gray-500">priority TaskPriority (LOW|MEDIUM|HIGH|URGENT|CRITICAL)</p>
          <p className="ml-4 text-gray-500">dueDate? DateTime, startDate? DateTime, completedAt? DateTime</p>
          <p className="ml-4 text-gray-500">estimatedMinutes? Int, actualMinutes? Int</p>
          <p className="ml-4 text-gray-500">entityType? String, entityId? String (polymorphic link)</p>
          <p className="ml-4 text-gray-500">tags String[], customFields? Json</p>
          <p className="ml-4 text-gray-500">assignedToId? -&gt; User, createdById -&gt; User</p>
          <p className="ml-4 text-gray-500">approvedById? String, approvedAt? DateTime, rejectedReason? String</p>
          <p className="ml-4 text-gray-500">completionNotes? String, recurrence? String, recurrenceConfig? Json</p>
          <p className="ml-4 text-gray-500">isActive Boolean, createdAt, updatedAt</p>
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
            { method: 'GET', path: '/api/v1/tasks', desc: 'List all tasks (paginated, filter by status/priority/assignee)' },
            { method: 'GET', path: '/api/v1/tasks/my', desc: 'Tasks assigned to current user' },
            { method: 'GET', path: '/api/v1/tasks/:id', desc: 'Task detail with history and watchers' },
            { method: 'GET', path: '/api/v1/tasks/stats', desc: 'Aggregate stats (counts by status)' },
            { method: 'POST', path: '/api/v1/tasks', desc: 'Create task' },
            { method: 'PUT', path: '/api/v1/tasks/:id', desc: 'Update task fields' },
            { method: 'POST', path: '/api/v1/tasks/:id/status', desc: 'Change status (with optional reason)' },
            { method: 'POST', path: '/api/v1/tasks/:id/complete', desc: 'Mark complete (notes + actualMinutes)' },
            { method: 'POST', path: '/api/v1/tasks/:id/assign', desc: 'Reassign to another user' },
            { method: 'POST', path: '/api/v1/tasks/:id/approve', desc: 'Approve pending task' },
            { method: 'POST', path: '/api/v1/tasks/:id/reject', desc: 'Reject pending task (with reason)' },
            { method: 'DELETE', path: '/api/v1/tasks/:id', desc: 'Delete task' },
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
          <p className="text-gray-500">app/(main)/tasks/page.tsx</p>
          <p className="ml-4 text-blue-700">&bull; TaskList.tsx</p>
          <p className="ml-8 text-gray-500">&bull; TableFull (tableKey=&quot;tasks&quot;)</p>
          <p className="ml-8 text-gray-500">&bull; useEntityPanel &rarr; TaskForm</p>
          <p className="ml-8 text-gray-500">&bull; rowActions: dynamic Approve/Reject for PENDING_APPROVAL</p>
          <p className="ml-8 text-gray-500">&bull; Status + Priority color-coded badges</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>tasksService</Code> in tasks.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;tasks&quot;, &quot;list&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useTasksList</Code>, <Code>useMyTasks</Code>, <Code>useTaskDetail</Code>, <Code>useTaskStats</Code></p>
          <p className="text-gray-500">Mutations: <Code>useCreateTask</Code>, <Code>useUpdateTask</Code>, <Code>useChangeTaskStatus</Code>, <Code>useCompleteTask</Code></p>
          <p className="text-gray-500">Approval: <Code>useApproveTask</Code>, <Code>useRejectTask</Code></p>
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
            <span>Tasks use <strong>polymorphic entity linking</strong> &mdash; <Code>entityType</Code> + <Code>entityId</Code> can reference any entity (Lead, Contact, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Approval flow: PENDING_APPROVAL tasks show Approve/Reject row actions &mdash; only visible when <Code>status === &quot;PENDING_APPROVAL&quot;</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Status and priority use inline color maps (<Code>STATUS_COLORS</Code>, <Code>PRIORITY_COLORS</Code>) for visual badges</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>All mutation hooks show <Code>toast.success</Code>/<Code>toast.error</Code> automatically &mdash; no manual toast calls needed in components</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>useMyTasks</Code> fetches <Code>GET /tasks/my</Code> for the current user&apos;s assigned tasks (dashboard widget)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>useTaskStats</Code> has <Code>staleTime: 60s</Code> &mdash; cached for dashboard KPI cards</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
