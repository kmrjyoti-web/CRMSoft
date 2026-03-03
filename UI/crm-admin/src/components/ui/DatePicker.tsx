'use client';

import { forwardRef } from 'react';

import { AICDatePicker } from '@coreui/ui-react';

type DatePickerProps = React.ComponentProps<typeof AICDatePicker>;

export const DatePicker = forwardRef<HTMLElement, DatePickerProps>((props, ref) => {
  return <AICDatePicker ref={ref as any} {...props} />;
});
DatePicker.displayName = 'DatePicker';
