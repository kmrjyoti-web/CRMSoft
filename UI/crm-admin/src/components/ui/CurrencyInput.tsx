'use client';

import { forwardRef } from 'react';

import { AICCurrencyInput } from '@coreui/ui-react';

type CurrencyInputProps = React.ComponentProps<typeof AICCurrencyInput>;

export const CurrencyInput = forwardRef<HTMLElement, CurrencyInputProps>((props, ref) => {
  return <AICCurrencyInput ref={ref as any} size="sm" variant="outlined" {...props} />;
});
CurrencyInput.displayName = 'CurrencyInput';
