'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function CronConfigDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* Model */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon name="database" size={14} className="text-indigo-600" />
          </span>
          CronJobConfig &mdash; Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model CronJobConfig {'{'}</p>
          <p className="ml-4 text-gray-500">id, jobCode (unique), jobName, description?, moduleName</p>
          <p className="ml-4 text-gray-500">cronExpression, cronDescription?, timezone</p>
          <p className="ml-4 text-gray-500">scope: GLOBAL | TENANT</p>
          <p className="ml-4 text-gray-500">status: ACTIVE | PAUSED | DISABLED</p>
          <p className="ml-4 text-gray-500">timeoutSeconds, maxRetries, retryDelaySeconds, allowConcurrent</p>
          <p className="ml-4 text-gray-500">isRunning, lastRunAt?, lastRunStatus?, nextRunAt?</p>
          <p className="ml-4 text-gray-500">totalRunCount, totalFailCount, avgDurationMs?, successRate?</p>
          <p className="ml-4 text-gray-500">alertOnFailure, alertOnTimeout, alertChannel, alertRecipientEmails[]</p>
          <p className="ml-4 text-gray-500">jobParams: Json?</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      {/* Run Log Model */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="database" size={14} className="text-purple-600" />
          </span>
          CronJobRunLog &mdash; Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model CronJobRunLog {'{'}</p>
          <p className="ml-4 text-gray-500">id, jobId &rarr; CronJobConfig, jobCode</p>
          <p className="ml-4 text-gray-500">startedAt, finishedAt?, durationMs?</p>
          <p className="ml-4 text-gray-500">status: SUCCESS | FAILED | TIMEOUT | SKIPPED | RUNNING</p>
          <p className="ml-4 text-gray-500">recordsProcessed?, recordsSucceeded?, recordsFailed?</p>
          <p className="ml-4 text-gray-500">errorMessage?, errorStack?, retryAttempt</p>
          <p className="ml-4 text-gray-500">triggeredBy: SCHEDULER | MANUAL | API</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      {/* API */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/admin/cron/jobs', desc: 'List jobs (filter: status, moduleName, search)' },
            { method: 'GET', path: '/api/v1/admin/cron/jobs/:jobCode', desc: 'Job detail with last 10 run logs' },
            { method: 'PUT', path: '/api/v1/admin/cron/jobs/:jobCode', desc: 'Update schedule, timeout, alerting config' },
            { method: 'POST', path: '/api/v1/admin/cron/jobs/:jobCode/toggle', desc: 'Toggle status (ACTIVE/PAUSED/DISABLED)' },
            { method: 'POST', path: '/api/v1/admin/cron/jobs/:jobCode/run', desc: 'Force run (manual trigger)' },
            { method: 'POST', path: '/api/v1/admin/cron/jobs/reload', desc: 'Reload all job configs from DB' },
            { method: 'PUT', path: '/api/v1/admin/cron/jobs/:jobCode/params', desc: 'Update job-specific params (JSON)' },
            { method: 'GET', path: '/api/v1/admin/cron/jobs/:jobCode/history', desc: 'Paginated run logs for a job' },
            { method: 'GET', path: '/api/v1/admin/cron/dashboard', desc: 'Dashboard stats (totals, success rate, failures)' },
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

      {/* Frontend */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
            <Icon name="layers" size={14} className="text-cyan-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/settings/cron-jobs/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; CronJobList.tsx (TableFull, tableKey=&quot;cron-jobs&quot;)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Dashboard summary cards (4 KPIs)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; useEntityPanel &rarr; CronJobEditForm (sidebar)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; useContentPanel &rarr; CronJobHistory (sidebar)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Toggle/RunNow/Reload actions</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>cronConfigService</Code> (listJobs, getJob, updateJob, toggleJob, runJob, reloadJobs, getHistory, getDashboard)</p>
          <p className="text-gray-500">Hooks: <Code>useCronJobs</Code>, <Code>useToggleCronJob</Code>, <Code>useRunCronJob</Code>, <Code>useReloadCrons</Code>, <Code>useCronHistory</Code>, <Code>useCronDashboard</Code></p>
        </div>
      </section>

      {/* Key Patterns */}
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
            <span>Jobs are identified by <Code>jobCode</Code> (string), not numeric ID. All API routes use <Code>:jobCode</Code>.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Backend: <Code>MasterSchedulerService</Code> uses <Code>node-cron</Code> with 34+ registered job handlers</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Force run creates a <Code>CronJobRunLog</Code> entry with <Code>triggeredBy: &quot;MANUAL&quot;</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>History opens in content panel (read-only) using <Code>useContentPanel</Code>, not entity panel</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
