'use client';

import { AICToolbarButton } from '@coreui/ui-react';

type ToolbarButtonProps = React.ComponentProps<typeof AICToolbarButton>;

export function ToolbarButton(props: ToolbarButtonProps) {
  return <AICToolbarButton {...props} />;
}
