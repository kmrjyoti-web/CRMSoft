'use client';

import { forwardRef } from 'react';

import { AICSwitch } from '@coreui/ui-react';

type SwitchProps = React.ComponentProps<typeof AICSwitch>;

export const Switch = forwardRef<HTMLElement, SwitchProps>((props, ref) => {
  return <AICSwitch ref={ref as any} {...props} />;
});
Switch.displayName = 'Switch';
