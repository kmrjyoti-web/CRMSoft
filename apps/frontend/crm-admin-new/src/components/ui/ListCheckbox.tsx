'use client';

import { AICListCheckbox } from '@coreui/ui-react';

type ListCheckboxProps = React.ComponentProps<typeof AICListCheckbox>;

export function ListCheckbox(props: ListCheckboxProps) {
  return <AICListCheckbox {...props} />;
}
