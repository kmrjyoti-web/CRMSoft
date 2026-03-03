'use client';

import { AICSmartDrawer } from '@coreui/ui-react';

type SmartDrawerProps = React.ComponentProps<typeof AICSmartDrawer>;

export function SmartDrawer(props: SmartDrawerProps) {
  return <AICSmartDrawer {...props} />;
}
