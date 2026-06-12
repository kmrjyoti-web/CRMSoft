'use client';

import { forwardRef } from 'react';

import { AICCheckbox } from '@coreui/ui-react';

type CheckboxProps = React.ComponentProps<typeof AICCheckbox>;

export const Checkbox = forwardRef<HTMLElement, CheckboxProps>((props, ref) => {
  return <AICCheckbox ref={ref as any} {...props} />;
});
Checkbox.displayName = 'Checkbox';
