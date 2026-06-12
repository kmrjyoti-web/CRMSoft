'use client';

import { forwardRef } from 'react';

import { AICMultiSelectInput } from '@coreui/ui-react';

type MultiSelectInputProps = React.ComponentProps<typeof AICMultiSelectInput>;

export const MultiSelectInput = forwardRef<HTMLElement, MultiSelectInputProps>((props, ref) => {
  return <AICMultiSelectInput ref={ref as any} size="sm" variant="outlined" {...props} />;
});
MultiSelectInput.displayName = 'MultiSelectInput';
