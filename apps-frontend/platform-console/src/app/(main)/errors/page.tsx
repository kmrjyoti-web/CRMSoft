import Link from 'next/link';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { AlertTriangle } from 'lucide-react';

async function getErrors(searchParams: Record<string, string>) {
  try {
    const base = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
    const qs = new URLSearchParams(searchParams).toString();
    const res = await fetch(
      `${base}/platform-console/errors${qs ? '?' + qs : ''}`,
      { cache: 'no-store' },
    );
    return res.ok ? res.json() : { items: [], total: 0, page: 1, totalPages: 0 };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const data = await getErrors(searchParams);
  const currentSeverity = searchParams.severity;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/errors"
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
            href={`/errors?severity=${s}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentSeverity === s
                ? 'bg-console-danger/20 border-console-danger text-console-danger'
                : 'border-console-border text-console-muted hover:text-console-text'
            }`}
          >
            {s}
          </Link>
        ))}
        <span className="ml-auto text-xs text-console-muted">
          {data.total} total
        </span>
      </div>

      {/* Table */}
      <div className="bg-console-card border border-console-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-console-border">
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Code</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Message</th>
              <th className="text-left px-4 py-3 text-xs text-console-muted font-medium">Module</th>
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
                <td colSpan={6} className="px-4 py-12 text-center text-console-muted">
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
          {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/errors?page=${p}${currentSeverity ? '&severity=' + currentSeverity : ''}`}
                className={`text-xs px-3 py-1.5 rounded border ${
                  data.page === p
                    ? 'bg-console-accent/20 border-console-accent text-console-accent'
                    : 'border-console-border text-console-muted'
                }`}
              >
                {p}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
