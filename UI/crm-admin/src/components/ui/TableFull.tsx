'use client';

import { AICTableFull } from '@coreui/ui-react';

type TableFullProps = React.ComponentProps<typeof AICTableFull>;

export function TableFull(props: TableFullProps) {
  return <AICTableFull {...props} />;
}
