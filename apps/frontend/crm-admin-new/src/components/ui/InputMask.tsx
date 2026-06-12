'use client';

import { forwardRef } from 'react';

import { AICInputmask } from '@coreui/ui-react';

type InputMaskProps = React.ComponentProps<typeof AICInputmask>;

export const InputMask = forwardRef<HTMLElement, InputMaskProps>((props, ref) => {
  return <AICInputmask ref={ref as any} size="sm" variant="outlined" {...props} />;
});
InputMask.displayName = 'InputMask';
