'use client';

import { AICToolbarButtonGroup } from '@coreui/ui-react';

type ToolbarButtonGroupProps = React.ComponentProps<typeof AICToolbarButtonGroup>;

export function ToolbarButtonGroup(props: ToolbarButtonGroupProps) {
  return <AICToolbarButtonGroup {...props} />;
}
