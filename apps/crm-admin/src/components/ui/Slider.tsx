'use client';

import { forwardRef } from 'react';

import { AICSlider } from '@coreui/ui-react';

type SliderProps = React.ComponentProps<typeof AICSlider>;

export const Slider = forwardRef<HTMLElement, SliderProps>((props, ref) => {
  return <AICSlider ref={ref as any} {...props} />;
});
Slider.displayName = 'Slider';
