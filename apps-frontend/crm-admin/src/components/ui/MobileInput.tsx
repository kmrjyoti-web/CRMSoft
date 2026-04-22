'use client';

import { forwardRef } from 'react';

import { AICMobileInput } from '@coreui/ui-react';

type MobileInputProps = React.ComponentProps<typeof AICMobileInput>;

export const MobileInput = forwardRef<HTMLElement, MobileInputProps>((props, ref) => {
  return <AICMobileInput ref={ref as any} size="sm" variant="outlined" {...props} />;
});
MobileInput.displayName = 'MobileInput';
