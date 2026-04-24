import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  status?: 'ok' | 'warn' | 'error' | 'neutral';
}

export function StatCard({ label, value, sub, icon: Icon, status = 'neutral' }: StatCardProps) {
  const statusColor = {
    ok: 'text-console-accent',
    warn: 'text-console-warning',
    error: 'text-console-danger',
    neutral: 'text-console-muted',
  }[status];

  return (
    <div className="bg-console-card border border-console-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-console-muted uppercase tracking-wider mb-1">{label}</p>
          <p className={clsx('text-2xl font-bold', statusColor)}>{value}</p>
          {sub && <p className="text-xs text-console-muted mt-1">{sub}</p>}
        </div>
        <div className={clsx('p-2 rounded-lg bg-white/5', statusColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
