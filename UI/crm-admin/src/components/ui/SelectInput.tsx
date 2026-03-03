'use client';

import { forwardRef } from 'react';

import { AICSelectInput } from '@coreui/ui-react';

type SelectInputProps = React.ComponentProps<typeof AICSelectInput>;

export const SelectInput = forwardRef<HTMLElement, SelectInputProps>((props, ref) => {
  return <AICSelectInput ref={ref as any} size="sm" variant="outlined" {...props} />;
});
SelectInput.displayName = 'SelectInput';
