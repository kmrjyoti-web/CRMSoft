'use client';

import { AICPortal } from '@coreui/ui-react';

type PortalProps = React.ComponentProps<typeof AICPortal>;

export function Portal(props: PortalProps) {
  return <AICPortal {...props} />;
}
