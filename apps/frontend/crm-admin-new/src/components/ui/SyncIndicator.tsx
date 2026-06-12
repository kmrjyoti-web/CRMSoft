'use client';

import { AICSyncIndicator } from '@coreui/ui-react';

type SyncIndicatorProps = React.ComponentProps<typeof AICSyncIndicator>;

export function SyncIndicator(props: SyncIndicatorProps) {
  return <AICSyncIndicator {...props} />;
}
