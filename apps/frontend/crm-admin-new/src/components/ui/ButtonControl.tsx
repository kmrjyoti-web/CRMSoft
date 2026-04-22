'use client';

import { AICButtonControl } from '@coreui/ui-react';

type ButtonControlProps = React.ComponentProps<typeof AICButtonControl>;

export function ButtonControl(props: ButtonControlProps) {
  return <AICButtonControl {...props} />;
}
