'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function WorkflowDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* ── Prisma Model ───────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Models (key fields)
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Workflow {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, code (unique)</p>
          <p className="ml-4 text-gray-500">entityType: LEAD | QUOTATION | INVOICE | INSTALLATION | TICKET</p>
          <p className="ml-4 text-gray-500">isActive Boolean, isDefault Boolean</p>
          <p className="ml-4 text-gray-500">states[] &rarr; WorkflowState, transitions[] &rarr; WorkflowTransition</p>
          <p className="ml-4 text-gray-500">createdAt, updatedAt</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model WorkflowState {'{'}</p>
          <p className="ml-4 text-gray-500">id, workflowId, name, code, color?</p>
          <p className="ml-4 text-gray-500">stateType: INITIAL | INTERMEDIATE | TERMINAL</p>
          <p className="ml-4 text-gray-500">category?: SUCCESS | FAILURE | PAUSED (terminal only)</p>
          <p className="ml-4 text-gray-500">sortOrder Int</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model WorkflowTransition {'{'}</p>
          <p className="ml-4 text-gray-500">id, workflowId, name, code</p>
          <p className="ml-4 text-gray-500">fromStateId &rarr; WorkflowState, toStateId &rarr; WorkflowState</p>
          <p className="ml-4 text-gray-500">triggerType: MANUAL | AUTO | SCHEDULED | APPROVAL</p>
          <p className="ml-4 text-gray-500">requiredPermission?, requiredRole?</p>
          <p className="ml-4 text-gray-500">actions[] &rarr; TransitionAction (FIELD_UPDATE, SEND_EMAIL, etc.)</p>
          <p className="text-gray-700">{'}'}</p>
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
        <p className="mb-2 text-xs font-medium text-gray-700">Workflow CRUD</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/workflows', desc: 'List (filter by entityType, search)' },
            { method: 'GET', path: '/api/v1/workflows/:id', desc: 'Detail with states[], transitions[], _count' },
            { method: 'POST', path: '/api/v1/workflows', desc: 'Create (name, code, entityType, isDefault)' },
            { method: 'PUT', path: '/api/v1/workflows/:id', desc: 'Update workflow fields' },
            { method: 'POST', path: '/api/v1/workflows/:id/publish', desc: 'Publish (activate + generate visual)' },
            { method: 'POST', path: '/api/v1/workflows/:id/clone', desc: 'Clone workflow with states and transitions' },
            { method: 'GET', path: '/api/v1/workflows/:id/visual', desc: 'Get visual diagram data (nodes + edges)' },
            { method: 'POST', path: '/api/v1/workflows/:id/validate', desc: 'Validate (missing initial, orphans, unreachable)' },
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

        <p className="mb-2 mt-4 text-xs font-medium text-gray-700">State &amp; Transition Config</p>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/workflows/:id/states', desc: 'Add state (name, code, stateType, color, sortOrder)' },
            { method: 'PUT', path: '/api/v1/workflows/states/:stateId', desc: 'Update state' },
            { method: 'DELETE', path: '/api/v1/workflows/states/:stateId', desc: 'Delete state' },
            { method: 'POST', path: '/api/v1/workflows/:id/transitions', desc: 'Add transition (fromStateId, toStateId, triggerType)' },
            { method: 'PUT', path: '/api/v1/workflows/transitions/:transitionId', desc: 'Update transition' },
            { method: 'DELETE', path: '/api/v1/workflows/transitions/:transitionId', desc: 'Delete transition' },
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

        <p className="mb-2 mt-4 text-xs font-medium text-gray-700">Workflow Execution (per entity)</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/leads/:id/workflow-status', desc: 'Current state, instance info' },
            { method: 'GET', path: '/api/v1/leads/:id/workflow-transitions', desc: 'Available transitions from current state' },
            { method: 'POST', path: '/api/v1/leads/:id/workflow-transition', desc: 'Execute transition (transitionCode, comment?)' },
            { method: 'GET', path: '/api/v1/leads/:id/workflow-history', desc: 'Transition history with performer info' },
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

      {/* ── Frontend Architecture ──────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/workflows/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; WorkflowList.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; PageHeader + entity type filter + search</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Table: Name, Code, EntityType, States count, Transitions count, Status, Default</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Clone button per row</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Help button &rarr; useContentPanel &rarr; WorkflowHelpContent</p>
          <p className="text-gray-500 mt-2">app/(main)/workflows/[id]/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; WorkflowDetail.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; State editor (add/edit/delete states)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Transition editor (add/edit/delete transitions)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Visual builder (diagram with nodes + edges)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Validate + Publish buttons</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Services: <Code>workflowsService</Code>, <Code>workflowConfigService</Code>, <Code>leadWorkflowService</Code></p>
          <p className="text-gray-500">Query keys: <Code>[&quot;workflows&quot;, params]</Code>, <Code>[&quot;workflow&quot;, id]</Code>, <Code>[&quot;workflow-visual&quot;, id]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useWorkflowsList</Code>, <Code>useWorkflowDetail</Code>, <Code>useCreateWorkflow</Code>, <Code>useUpdateWorkflow</Code>, <Code>useCloneWorkflow</Code></p>
          <p className="text-gray-500">Config hooks: <Code>useAddState</Code>, <Code>useUpdateState</Code>, <Code>useDeleteState</Code>, <Code>useAddTransition</Code>, <Code>useUpdateTransition</Code>, <Code>useDeleteTransition</Code></p>
          <p className="text-gray-500">Execution hooks: <Code>useWorkflowStatus</Code>, <Code>useAvailableTransitions</Code>, <Code>useExecuteTransition</Code>, <Code>useWorkflowHistory</Code></p>
        </div>
      </section>

      {/* ── Visual Builder Patterns ────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon name="git-branch" size={14} className="text-indigo-600" />
          </span>
          Visual Builder Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Visual data fetched from <Code>GET /workflows/:id/visual</Code> returns nodes (states) and edges (transitions) for diagram rendering</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>State types use color coding: <strong>green</strong> = Initial, <strong>blue</strong> = Intermediate, <strong>gray</strong> = Terminal</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Transition trigger types: <Code>MANUAL</Code> (user button), <Code>AUTO</Code> (condition-based), <Code>SCHEDULED</Code> (timed), <Code>APPROVAL</Code> (requires approval gate)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Each transition can have automated actions: FIELD_UPDATE, SEND_EMAIL, SEND_NOTIFICATION, CREATE_ACTIVITY, CREATE_TASK, WEBHOOK, ASSIGN_OWNER</span>
          </li>
        </ul>
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
            <span>Entity type is an enum: <Code>LEAD | QUOTATION | INVOICE | INSTALLATION | TICKET</Code> &mdash; filter buttons on list page</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Every workflow must have exactly <strong>one INITIAL state</strong> &mdash; validation enforces this before publish</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Clone creates a full copy (workflow + states + transitions) with <Code>&ldquo;Copy of&rdquo;</Code> prefix</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Workflow execution is per-entity: <Code>leadWorkflowService</Code> handles status, transitions, and history for leads</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Help content uses <Code>useContentPanel</Code> to display <Code>WorkflowHelpContent</Code> in a sidebar panel</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
