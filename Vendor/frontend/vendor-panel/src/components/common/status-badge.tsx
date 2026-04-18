import { Badge } from '@/components/ui/badge';
import {
  MODULE_STATUS, PACKAGE_STATUS, LICENSE_STATUS, PARTNER_STATUS,
  ERROR_SEVERITY, TENANT_STATUS, DEV_REQUEST_STATUS, DEV_REQUEST_PRIORITY,
  DB_STATUS, SERVICE_STATUS,
} from '@/lib/constants';

const ALL_STATUSES = [
  ...MODULE_STATUS, ...PACKAGE_STATUS, ...LICENSE_STATUS, ...PARTNER_STATUS,
  ...ERROR_SEVERITY, ...TENANT_STATUS, ...DEV_REQUEST_STATUS, ...DEV_REQUEST_PRIORITY,
  ...DB_STATUS, ...SERVICE_STATUS,
];

const COLOR_MAP: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'outline'> = {
  green: 'success',
  blue: 'info',
  yellow: 'warning',
  orange: 'warning',
  red: 'destructive',
  purple: 'default',
  teal: 'info',
  gray: 'secondary',
};

export function StatusBadge({ value }: { value?: string }) {
  if (!value) return <Badge variant="secondary">—</Badge>;
  const status = ALL_STATUSES.find((s) => s.value === value);
  const variant = status ? COLOR_MAP[status.color] ?? 'secondary' : 'secondary';
  const label = status?.label ?? value.replace(/_/g, ' ');

  return <Badge variant={variant}>{label}</Badge>;
}
