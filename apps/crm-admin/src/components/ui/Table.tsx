'use client';

import { AICTable } from '@coreui/ui-react';

type TableProps = React.ComponentProps<typeof AICTable>;

export function Table(props: TableProps) {
  return <AICTable {...props} />;
}
