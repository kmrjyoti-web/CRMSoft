import { HeartPulse, RefreshCw } from 'lucide-react';

async function getHealth() {
  try {
    const base = process.env.INTERNAL_API_URL ?? '';
    const res = await fetch(`${base}/platform-console/health`, { cache: 'no-store' });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; bg: string }> = {
  HEALTHY:  { dot: 'bg-green-500',  label: 'Healthy',  bg: 'border-green-900/40' },
  DEGRADED: { dot: 'bg-yellow-500', label: 'Degraded', bg: 'border-yellow-900/40' },
  DOWN:     { dot: 'bg-red-500',    label: 'Down',     bg: 'border-red-900/40' },
  UNKNOWN:  { dot: 'bg-gray-500',   label: 'Unknown',  bg: 'border-gray-700' },
};

const SERVICE_LABELS: Record<string, string> = {
  API: 'NestJS API (3001)',
  CRM_PORTAL: 'CRM Admin Portal',
  MARKETHUB: 'Marketplace Frontend',
  POSTGRES: 'PostgreSQL Database',
  REDIS: 'Redis Cache',
  R2: 'Cloudflare R2 Storage',
  BULLMQ: 'BullMQ Queue',
};

export default async function HealthPage() {
  const services: any[] = await getHealth();
  const healthy = services.filter((s) => s.status === 'HEALTHY').length;
  const total = services.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-console-card border border-console-border rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-console-muted">System Status</p>
          <p className={`text-xl font-bold mt-0.5 ${healthy === total ? 'text-console-accent' : 'text-console-danger'}`}>
            {healthy === total ? '✓ All Systems Operational' : `${total - healthy} Service${total - healthy > 1 ? 's' : ''} Affected`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-console-text">{healthy}/{total}</p>
          <p className="text-xs text-console-muted">services healthy</p>
        </div>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s: any) => {
          const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.UNKNOWN;
          return (
            <div
              key={s.service}
              className={`bg-console-card border rounded-lg p-4 ${cfg.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${s.status === 'HEALTHY' ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium text-console-text">
                    {SERVICE_LABELS[s.service] ?? s.service}
                  </span>
                </div>
                <span className={`text-xs ${s.status === 'HEALTHY' ? 'text-console-accent' : s.status === 'DEGRADED' ? 'text-console-warning' : 'text-console-danger'}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-console-muted">
                <span>
                  {s.responseTimeMs ? `${s.responseTimeMs}ms` : '—'}
                </span>
                <span>
                  {s.checkedAt
                    ? `Checked ${new Date(s.checkedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`
                    : 'Never checked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-console-muted">
          <HeartPulse className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No health data yet.</p>
          <p className="text-xs mt-1">
            Run: <code className="bg-white/5 px-2 py-0.5 rounded text-console-accent">
              POST /platform-console/health/check
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
