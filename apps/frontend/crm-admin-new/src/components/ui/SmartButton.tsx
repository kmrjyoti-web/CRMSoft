'use client';

import { AICSmartButton } from '@coreui/ui-react';

type SmartButtonProps = React.ComponentProps<typeof AICSmartButton>;

export function SmartButton(props: SmartButtonProps) {
  return <AICSmartButton {...props} />;
}
