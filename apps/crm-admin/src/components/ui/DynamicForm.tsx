'use client';

import { AICDynamicForm } from '@coreui/ui-react';

type DynamicFormProps = React.ComponentProps<typeof AICDynamicForm>;

export function DynamicForm(props: DynamicFormProps) {
  return <AICDynamicForm {...props} />;
}
