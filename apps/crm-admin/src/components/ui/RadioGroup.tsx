'use client';

import { AICRadioGroup } from '@coreui/ui-react';

type RadioGroupProps = React.ComponentProps<typeof AICRadioGroup>;

export function RadioGroup(props: RadioGroupProps) {
  return <AICRadioGroup {...props} />;
}
