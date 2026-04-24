'use client';

import { forwardRef } from 'react';

import { AICButton } from '@coreui/ui-react';

type ButtonProps = React.ComponentProps<typeof AICButton>;

export const Button = forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  return <AICButton ref={ref as any} size="md" {...props} />;
});
Button.displayName = 'Button';
