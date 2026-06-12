'use client';

import { AICDialog } from '@coreui/ui-react';

type SmartDialogProps = React.ComponentProps<typeof AICDialog>;

export function SmartDialog(props: SmartDialogProps) {
  return <AICDialog {...props} />;
}
