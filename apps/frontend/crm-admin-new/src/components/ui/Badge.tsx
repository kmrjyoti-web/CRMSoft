'use client';

import { AICBadge } from '@coreui/ui-react';

type BadgeProps = React.ComponentProps<typeof AICBadge>;

export function Badge(props: BadgeProps) {
  return <AICBadge {...props} />;
}
