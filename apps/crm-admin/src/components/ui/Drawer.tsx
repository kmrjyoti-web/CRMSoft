'use client';

import { AICDrawer } from '@coreui/ui-react';

type DrawerProps = React.ComponentProps<typeof AICDrawer>;

export function Drawer(props: DrawerProps) {
  return <AICDrawer {...props} />;
}
