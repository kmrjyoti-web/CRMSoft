'use client';

import { AICConfirmDialog } from '@coreui/ui-react';

type ConfirmDialogProps = React.ComponentProps<typeof AICConfirmDialog>;

export function ConfirmDialog(props: ConfirmDialogProps) {
  return <AICConfirmDialog {...props} />;
}
