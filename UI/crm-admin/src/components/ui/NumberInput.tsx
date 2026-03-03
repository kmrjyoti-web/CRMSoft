'use client';

import { forwardRef } from 'react';

import { AICNumber } from '@coreui/ui-react';

type NumberInputProps = React.ComponentProps<typeof AICNumber>;

export const NumberInput = forwardRef<HTMLElement, NumberInputProps>((props, ref) => {
  return <AICNumber ref={ref as any} size="sm" variant="outlined" {...props} />;
});
NumberInput.displayName = 'NumberInput';
