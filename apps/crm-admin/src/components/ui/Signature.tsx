'use client';

import { forwardRef } from 'react';

import { AICSignature } from '@coreui/ui-react';

type SignatureProps = React.ComponentProps<typeof AICSignature>;

export const Signature = forwardRef<HTMLElement, SignatureProps>((props, ref) => {
  return <AICSignature ref={ref as any} {...props} />;
});
Signature.displayName = 'Signature';
