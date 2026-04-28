import Link from 'next/link';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { AlertTriangle } from 'lucide-react';

async function getErrors(searchParams: Record<string, string>) {
  try {
    const base = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v)),
    ).toString();
    const res = await fetch(
      `${base}/platform-console/errors${qs ? '?' + qs : ''}`,
      { cache: 'no-store' },
    );
    return res.ok ? res.json() : { items: [], total: 0, page: 1, totalPages: 0 };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

async function getTenantList(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const base = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${base}/identity/tenants?limit=100`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.items ?? json?.items ?? [];
  } catch {
    return [];
  }
}

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function buildHref(searchParams: Record<string, string>, overrides: Record<string, string | undefined>) {
  const next = { ...searchParams, ...overrides };
  const clean = Object.fromEntries(Object.entries(next).filter((e): e is [string, string] => e[1] != null && e[1] !== ''));
  const qs = new URLSearchParams(clean).toString();
  return `/errors${qs ? '?' + qs : ''}`;
}

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [data, tenants] = await Promise.all([
    getErrors(searchParams),
    getTenantList(),
  ]);

  const currentSeverity = searchParams.severity;
  const currentTenantId = searchParams.tenantId;

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Severity filters */}
        <Link
          href={buildHref(searchParams, { severity: undefined, page: undefined })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !currentSeverity
              ? 'bg-console-accent/20 border-console-accent text-console-accent'
              : 'border-console-border text-console-muted hover:text-console-text'
          }`}
        >
          All
        </Link>
        {SEVERITIES.map((s) => (
          <Link
            key={s}
            href={buildHref(searchParams, { severity: s, page: undefined })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentSeverity === s
                ? 'bg-console-danger/20 border-console-danger text-console-danger'
                : 'border-console-border text-console-muted hover:text-console-text'
            }`}
          >
            {s}
          </Link>
        ))}

        {/* Tenant filter — server-rendered select using form GET */}
        {tenants.length > 0 && (
          <form method="GET" action="/errors" className="ml-auto flex items-center gap-2">
            {/* Preserve existing filters */}
            {currentSeverity && <input type="hidden" name="severity" value={currentSeverity} />}
            <select
              name="tenantId"
              defaultValue={currentTenantId ?? ''}
              className="text-xs bg-console-card border border-console-border rounded px-2 py-1.5 text-console-muted focus:outline-none focus:border-console-accent"
              onChange={(e) => (e.target.form as HTMLFormElement | null)?.submit()}
            >
              <option value="">All tenants</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
            {currentTenantId && (
              <Link
                href={buildHref(searchParams, { tenantId: undefined, page: undefined })}
                className="text-xs text-console-danger hover:underline"
              >
                Clear
              </Link>
            )}
          </form>
        )}

        <span className={`text-xs text-console-muted ${tenants.length === 0 ? 'ml-auto' : ''}`}>
          {data.total} total
        </span>
      </div>

      {/* Active tenant filter badge */}
      {currentTenantId && (() => {
        const t = tenants.find((x) => x.id === currentTenantId);
        return t ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-console-muted">Filtered by tenant:</span>
            <span className="text-xs bg-console-accent/10 border border-console-accent/30 text-console-accent px-2 py-0.5 rounded">
              {t.name} — {t.slug}
            </span>
          </div>
        ) : null;
      })()}

      {/* Table */}
      <div className="bg-console-card border border-console-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-console-border">
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Code</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Message</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Module</th>
              {!currentTenantId && (
                <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Tenant</th>
              )}
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.length > 0 ? (
              data.items.map((e: any) => (
                <tr
                  key={e.id}
                  className="border-b border-console-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <SeverityBadge severity={e.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-console-muted bg-white/5 px-1.5 py-0.5 rounded">
                      {e.errorCode}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-console-text max-w-xs truncate">
                    {e.message}
                  </td>
                  <td className="px-4 py-3 text-console-muted text-xs">{e.module ?? '—'}</td>
                  {!currentTenantId && (
                    <td className="px-4 py-3 text-console-muted text-xs">
                      {e.tenantId ? (
                        <Link
                          href={buildHref(searchParams, { tenantId: e.tenantId, page: undefined })}
                          className="text-console-accent hover:underline font-mono"
                        >
                          {e.tenantId.slice(0, 8)}…
                        </Link>
                      ) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {e.resolvedAt ? (
                      <span className="text-xs text-console-accent">✓ Resolved</span>
                    ) : (
                      <span className="text-xs text-console-danger">• Open</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-console-muted text-xs">
                    {new Date(e.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentTenantId ? 6 : 7} className="px-4 py-12 text-center text-console-muted">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No errors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref(searchParams, { page: String(p) })}
              className={`text-xs px-3 py-1.5 rounded border ${
                data.page === p
                  ? 'bg-console-accent/20 border-console-accent text-console-accent'
                  : 'border-console-border text-console-muted'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
