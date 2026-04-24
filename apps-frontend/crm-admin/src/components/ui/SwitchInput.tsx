'use client';

import { forwardRef } from 'react';

import { AICSwitchInput } from '@coreui/ui-react';

type SwitchInputProps = React.ComponentProps<typeof AICSwitchInput>;

export const SwitchInput = forwardRef<HTMLElement, SwitchInputProps>((props, ref) => {
  return <AICSwitchInput ref={ref as any} {...props} />;
});
SwitchInput.displayName = 'SwitchInput';
