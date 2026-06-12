'use client';

import { AICDatePicker } from '@/components/shared/AICDatePicker';
import type { AICDatePickerProps } from '@/components/shared/AICDatePicker';

export type DatePickerProps = AICDatePickerProps;

export function DatePicker(props: DatePickerProps) {
  return <AICDatePicker {...props} />;
}
DatePicker.displayName = 'DatePicker';
