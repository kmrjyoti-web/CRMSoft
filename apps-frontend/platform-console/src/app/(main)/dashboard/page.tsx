import {
  Server,
  AlertTriangle,
  TestTube2,
  Box,
  Rocket,
  HeartPulse,
  Building2,
  Users,
  Factory,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

// Server component — data fetched at request time
async function getDashboardData() {
  try {
    const base = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
    const [overview, health, errors, brands, partners, verticals] = await Promise.all([
      fetch(`${base}/platform-console/dashboard`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${base}/platform-console/dashboard/health`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${base}/platform-console/dashboard/errors`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => ({ recent: [], bySeverity: [] })),
      fetch(`${base}/platform-console/brands/config`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${base}/platform-console/partners`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${base}/platform-console/verticals`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => []),
    ]);
    return { overview, health, errors, brands, partners, verticals };
  } catch {
    return { overview: null, health: [], errors: { recent: [], bySeverity: [] }, brands: [], partners: [], verticals: [] };
  }
}

const STATUS_INDICATOR: Record<string, string> = {
  HEALTHY: '🟢',
  DEGRADED: '🟡',
  DOWN: '🔴',
  UNKNOWN: '⚪',
};

export default async function DashboardPage() {
  const { overview, health, errors, brands, partners, verticals } = await getDashboardData();

  const services = overview?.services ?? { total: 7, healthy: 0, allHealthy: false };
  const testsData = overview?.tests ?? { total: 0, passed: 0, failed: 0, status: 'UNKNOWN' };
  const errorsToday = overview?.errors?.today ?? 0;
  const lastDeploy = overview?.lastDeploy;

  const brandsArr = Array.isArray(brands) ? brands : (brands as any)?.items ?? [];
  const partnersArr = Array.isArray(partners) ? partners : (partners as any)?.items ?? [];
  const verticalsArr = Array.isArray(verticals) ? verticals : (verticals as any)?.items ?? [];
  const activeBrands = brandsArr.filter((b: any) => b.isActive).length;
  const activePartners = partnersArr.filter((p: any) => p.isActive).length;
  const activeVerticals = verticalsArr.filter((v: any) => v.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Services"
          value={`${services.healthy}/${services.total}`}
          sub={services.allHealthy ? 'All operational' : 'Issues detected'}
          icon={Server}
          status={services.allHealthy ? 'ok' : 'error'}
        />
        <StatCard
          label="Errors Today"
          value={errorsToday}
          sub="last 24 hours"
          icon={AlertTriangle}
          status={errorsToday === 0 ? 'ok' : errorsToday < 5 ? 'warn' : 'error'}
        />
        <StatCard
          label="Tests"
          value={testsData.total > 0 ? `${testsData.passed}/${testsData.total}` : '—'}
          sub={testsData.failed > 0 ? `${testsData.failed} failing` : 'All passing'}
          icon={TestTube2}
          status={testsData.failed === 0 ? 'ok' : 'error'}
        />
        <StatCard
          label="Modules"
          value={111}
          sub="backend modules"
          icon={Box}
          status="neutral"
        />
        <StatCard
          label="Last Deploy"
          value={lastDeploy ? lastDeploy.version : '—'}
          sub={lastDeploy ? lastDeploy.status : 'No deploys yet'}
          icon={Rocket}
          status={lastDeploy?.status === 'SUCCESS' ? 'ok' : 'neutral'}
        />
      </div>

      {/* Platform registry stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Brands"
          value={activeBrands || '—'}
          sub={`${brandsArr.length} total deployed`}
          icon={Building2}
          status={activeBrands > 0 ? 'ok' : 'neutral'}
        />
        <StatCard
          label="Partners"
          value={activePartners || '—'}
          sub={`${partnersArr.length} total onboarded`}
          icon={Users}
          status={activePartners > 0 ? 'ok' : 'neutral'}
        />
        <StatCard
          label="Verticals"
          value={activeVerticals || '—'}
          sub={`${verticalsArr.length} registered`}
          icon={Factory}
          status={activeVerticals > 0 ? 'ok' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Health */}
        <div className="bg-console-card border border-console-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-console-text mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-console-accent" />
            Service Health
          </h2>
          <div className="space-y-2">
            {Array.isArray(health) && health.length > 0 ? (
              health.map((s: any) => (
                <div
                  key={s.service}
                  className="flex items-center justify-between py-1.5 border-b border-console-border/50 last:border-0"
                >
                  <span className="text-sm text-console-text">
                    {STATUS_INDICATOR[s.status] ?? '⚪'} {s.service}
                  </span>
                  <div className="flex items-center gap-3">
                    {s.responseTimeMs && (
                      <span className="text-xs text-console-muted">
                        {s.responseTimeMs}ms
                      </span>
                    )}
                    <span
                      className={
                        s.status === 'HEALTHY'
                          ? 'text-xs text-console-accent'
                          : s.status === 'DEGRADED'
                          ? 'text-xs text-console-warning'
                          : 'text-xs text-console-danger'
                      }
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-console-muted py-4 text-center">
                No health data — run a health check first
              </p>
            )}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-console-card border border-console-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-console-text mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-console-danger" />
            Recent Errors
          </h2>
          <div className="space-y-2">
            {errors.recent?.length > 0 ? (
              errors.recent.slice(0, 8).map((e: any) => (
                <div
                  key={e.id}
                  className="flex items-start gap-2 py-1.5 border-b border-console-border/50 last:border-0"
                >
                  <span
                    className={
                      e.severity === 'CRITICAL'
                        ? 'text-red-400 text-xs font-bold w-16 flex-shrink-0'
                        : e.severity === 'HIGH'
                        ? 'text-orange-400 text-xs font-bold w-16 flex-shrink-0'
                        : 'text-yellow-400 text-xs font-bold w-16 flex-shrink-0'
                    }
                  >
                    {e.severity}
                  </span>
                  <span className="text-xs text-console-muted truncate flex-1">
                    {e.httpStatus && `${e.httpStatus} `}{e.endpoint ?? e.message}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-console-muted py-4 text-center">
                No errors logged yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
