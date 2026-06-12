'use client';

import { forwardRef } from 'react';

import { AICRadio } from '@coreui/ui-react';

type RadioProps = React.ComponentProps<typeof AICRadio>;

export const Radio = forwardRef<HTMLElement, RadioProps>((props, ref) => {
  return <AICRadio ref={ref as any} {...props} />;
});
Radio.displayName = 'Radio';
