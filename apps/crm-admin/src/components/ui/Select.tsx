'use client';

import { forwardRef } from 'react';

import { AICSelect } from '@coreui/ui-react';

type SelectProps = React.ComponentProps<typeof AICSelect>;

export const Select = forwardRef<HTMLElement, SelectProps>((props, ref) => {
  return <AICSelect ref={ref as any} {...props} />;
});
Select.displayName = 'Select';
