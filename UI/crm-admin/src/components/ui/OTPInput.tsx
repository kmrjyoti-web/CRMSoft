'use client';

import { forwardRef } from 'react';

import { AICOTPInput } from '@coreui/ui-react';

type OTPInputProps = React.ComponentProps<typeof AICOTPInput>;

export const OTPInput = forwardRef<HTMLElement, OTPInputProps>((props, ref) => {
  return <AICOTPInput ref={ref as any} {...props} />;
});
OTPInput.displayName = 'OTPInput';
