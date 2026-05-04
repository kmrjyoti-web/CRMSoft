'use client';

import { AICToggleButton } from '@coreui/ui-react';

type ToggleButtonProps = React.ComponentProps<typeof AICToggleButton>;

export function ToggleButton(props: ToggleButtonProps) {
  return <AICToggleButton {...props} />;
}
