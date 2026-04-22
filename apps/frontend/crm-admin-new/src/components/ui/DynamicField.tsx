'use client';

import { AICDynamicField } from '@coreui/ui-react';

type DynamicFieldProps = React.ComponentProps<typeof AICDynamicField>;

export function DynamicField(props: DynamicFieldProps) {
  return <AICDynamicField {...props} />;
}
