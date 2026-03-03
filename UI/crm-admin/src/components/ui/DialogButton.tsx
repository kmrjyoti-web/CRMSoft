'use client';

import { AICDialogButton } from '@coreui/ui-react';

type DialogButtonProps = React.ComponentProps<typeof AICDialogButton>;

export function DialogButton(props: DialogButtonProps) {
  return <AICDialogButton {...props} />;
}
