import { Badge } from '@/components/ui/badge';
import { LISTING_STATUS, ORDER_STATUS, ENQUIRY_STATUS } from '@/lib/constants';

const ALL_STATUSES = [...LISTING_STATUS, ...ORDER_STATUS, ...ENQUIRY_STATUS];

const COLOR_MAP: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'outline'> = {
  green: 'success',
  blue: 'info',
  yellow: 'warning',
  orange: 'warning',
  red: 'destructive',
  purple: 'default',
  indigo: 'info',
  gray: 'secondary',
};

export function StatusBadge({ value }: { value: string }) {
  const status = ALL_STATUSES.find((s) => s.value === value);
  const variant = status ? COLOR_MAP[status.color] ?? 'secondary' : 'secondary';
  const label = status?.label ?? value.replace(/^(LST_|MKT_|ENQ_|MPAY_)/, '');

  return <Badge variant={variant}>{label}</Badge>;
}
