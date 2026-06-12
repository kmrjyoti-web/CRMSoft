'use client';

import { AICToolbar } from '@coreui/ui-react';

type ToolbarProps = React.ComponentProps<typeof AICToolbar>;

export function Toolbar(props: ToolbarProps) {
  return <AICToolbar {...props} />;
}
