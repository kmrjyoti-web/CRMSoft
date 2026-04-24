"use client";

const CRON_JOBS = [
  {
    name: "Nightly Backup",
    schedule: "0 1 * * *",
    scheduleHuman: "Daily at 1:00 AM IST",
    module: "OPS-5",
    description: "pg_dump all 4 schemas → Cloudflare R2",
    status: "active" as const,
  },
  {
    name: "Weekly Backup Retention Cleanup",
    schedule: "0 2 * * 0",
    scheduleHuman: "Every Sunday at 2:00 AM IST",
    module: "OPS-5",
    description: "Delete expired R2 backups (>30 days old)",
    status: "active" as const,
  },
  {
    name: "Nightly DB Maintenance",
    schedule: "0 2 * * *",
    scheduleHuman: "Daily at 2:00 AM IST",
    module: "OPS-4",
    description: "VACUUM ANALYZE + dev log cleanup + expired sessions",
    status: "active" as const,
  },
  {
    name: "Weekly Deep Vacuum",
    schedule: "0 3 * * 0",
    scheduleHuman: "Every Sunday at 3:00 AM IST",
    module: "OPS-4",
    description: "VACUUM FULL ANALYZE (compacts storage)",
    status: "active" as const,
  },
  {
    name: "Monthly Audit Cleanup",
    schedule: "0 4 1 * *",
    scheduleHuman: "1st of every month at 4:00 AM IST",
    module: "OPS-4",
    description: "Full cleanup: dev/error/audit logs + sessions",
    status: "active" as const,
  },
  {
    name: "Email Digest",
    schedule: "0 9 * * *",
    scheduleHuman: "Daily at 9:00 AM IST",
    module: "Email",
    description: "Send pending email digests to users",
    status: "active" as const,
  },
  {
    name: "Notification Cleanup",
    schedule: "0 3 * * *",
    scheduleHuman: "Daily at 3:00 AM IST",
    module: "Notifications",
    description: "Delete old read notifications (>60 days)",
    status: "active" as const,
  },
];

const MODULE_COLORS: Record<string, string> = {
  "OPS-4": "bg-purple-100 text-purple-700",
  "OPS-5": "bg-blue-100 text-blue-700",
  "Email": "bg-orange-100 text-orange-700",
  "Notifications": "bg-green-100 text-green-700",
};

export function CronPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cron Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">All scheduled background jobs — timezone: Asia/Kolkata (IST)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          All cron jobs use <strong>Asia/Kolkata (IST)</strong> timezone and are configured via{" "}
          <code className="bg-blue-100 px-1 rounded text-xs">@Cron</code> decorators.
          Manual trigger is available via API: <code className="bg-blue-100 px-1 rounded text-xs">POST /ops/db-maintenance/vacuum</code>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Job Name", "Module", "Schedule", "Description", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CRON_JOBS.map((job) => (
                <tr key={job.name} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-800">{job.name}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[job.module] || "bg-gray-100 text-gray-600"}`}>
                      {job.module}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-500">{job.schedule}</div>
                    <div className="text-xs text-gray-400">{job.scheduleHuman}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 max-w-xs">{job.description}</td>
                  <td className="px-3 py-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1" />
                    <span className="text-xs text-green-700">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
