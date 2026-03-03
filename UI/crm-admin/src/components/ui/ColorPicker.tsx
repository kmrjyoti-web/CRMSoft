'use client';

import { forwardRef } from 'react';

import { AICColorPicker } from '@coreui/ui-react';

type ColorPickerProps = React.ComponentProps<typeof AICColorPicker>;

export const ColorPicker = forwardRef<HTMLElement, ColorPickerProps>((props, ref) => {
  return <AICColorPicker ref={ref as any} {...props} />;
});
ColorPicker.displayName = 'ColorPicker';
