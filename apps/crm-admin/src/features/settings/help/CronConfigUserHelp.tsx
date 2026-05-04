'use client';

import { Icon } from '@/components/ui';

export function CronConfigUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon name="clock" size={14} className="text-indigo-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Scheduled Jobs screen shows all background tasks that run
          automatically on a schedule (cron jobs). These include email syncing,
          lead scoring, notification cleanup, report generation, and more.
          You can pause, resume, or manually trigger any job from here.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          How to Use
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Review the <strong>dashboard cards</strong> at the top for a quick health overview</li>
          <li>Check job <strong>status</strong>: Active (running on schedule), Paused, or Disabled</li>
          <li>Click a job row to <strong>edit</strong> its schedule, timeout, and alert settings</li>
          <li>Use <strong>Pause/Resume</strong> to temporarily stop a job without deleting it</li>
          <li>Use <strong>Run Now</strong> to manually trigger a job immediately</li>
          <li>Click <strong>View History</strong> to see past executions and any errors</li>
          <li>Click <strong>Reload All</strong> to re-read job configurations from the database</li>
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
            The <strong>cron expression</strong> controls the schedule (e.g., <code>0 */5 * * *</code> = every 5 minutes).
            The description field shows the human-readable version.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Alert settings</strong> notify you when a job fails consecutively.
            Configure the channel (email, in-app, or both) and the failure threshold.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            The <strong>success rate</strong> percentage helps identify problematic jobs.
            Check the run history for error details when the rate drops.
          </div>
        </div>
      </section>
    </div>
  );
}
