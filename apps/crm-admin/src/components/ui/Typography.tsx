'use client';

import { AICTypography } from '@coreui/ui-react';

type TypographyProps = React.ComponentProps<typeof AICTypography>;

export function Typography(props: TypographyProps) {
  return <AICTypography {...props} />;
}
