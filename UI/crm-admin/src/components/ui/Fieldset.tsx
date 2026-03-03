'use client';

import { AICFieldset } from '@coreui/ui-react';

type FieldsetProps = React.ComponentProps<typeof AICFieldset>;

export function Fieldset(props: FieldsetProps) {
  return <AICFieldset {...props} />;
}
