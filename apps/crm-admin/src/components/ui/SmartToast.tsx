'use client';

import { AICSmartToast } from '@coreui/ui-react';

type SmartToastProps = React.ComponentProps<typeof AICSmartToast>;

export function SmartToast(props: SmartToastProps) {
  return <AICSmartToast {...props} />;
}
