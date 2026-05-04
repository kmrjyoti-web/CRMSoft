'use client';

import { AICSegmentedControl } from '@coreui/ui-react';

type SegmentedControlProps = React.ComponentProps<typeof AICSegmentedControl>;

export function SegmentedControl(props: SegmentedControlProps) {
  return <AICSegmentedControl {...props} />;
}
