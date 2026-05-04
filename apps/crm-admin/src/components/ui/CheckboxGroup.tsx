'use client';

import { AICCheckboxGroup } from '@coreui/ui-react';

type CheckboxGroupProps = React.ComponentProps<typeof AICCheckboxGroup>;

export function CheckboxGroup(props: CheckboxGroupProps) {
  return <AICCheckboxGroup {...props} />;
}
