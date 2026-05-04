import { Badge } from '@/components/ui';

interface IndustryBadgeProps {
  industryCode: string | null | undefined;
}

export function IndustryBadge({ industryCode }: IndustryBadgeProps) {
  if (!industryCode) {
    return <Badge variant="outline">All Industries</Badge>;
  }
  return <Badge variant="secondary">{industryCode}</Badge>;
}
