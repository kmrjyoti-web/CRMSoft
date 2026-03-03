'use client';

import { AICModal } from '@coreui/ui-react';

type ModalProps = React.ComponentProps<typeof AICModal>;

export function Modal(props: ModalProps) {
  return <AICModal {...props} />;
}
