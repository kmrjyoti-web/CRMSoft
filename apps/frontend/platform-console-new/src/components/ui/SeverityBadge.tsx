import { clsx } from 'clsx';

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-900/50 text-red-400 border-red-800',
  HIGH: 'bg-orange-900/50 text-orange-400 border-orange-800',
  MEDIUM: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  LOW: 'bg-blue-900/50 text-blue-400 border-blue-800',
  INFO: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={clsx(
        'text-xs font-medium px-2 py-0.5 rounded border',
        SEVERITY_STYLES[severity] ?? 'bg-gray-900/50 text-gray-400 border-gray-800',
      )}
    >
      {severity}
    </span>
  );
}
