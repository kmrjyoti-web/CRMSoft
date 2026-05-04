'use client';

import { forwardRef } from 'react';

import { AICCheckboxInput } from '@coreui/ui-react';

type CheckboxInputProps = React.ComponentProps<typeof AICCheckboxInput>;

export const CheckboxInput = forwardRef<HTMLElement, CheckboxInputProps>((props, ref) => {
  return <AICCheckboxInput ref={ref as any} {...props} />;
});
CheckboxInput.displayName = 'CheckboxInput';
