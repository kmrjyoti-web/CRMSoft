'use client';

import { AICTooltip } from '@coreui/ui-react';

type TooltipProps = React.ComponentProps<typeof AICTooltip>;

export function Tooltip(props: TooltipProps) {
  return <AICTooltip {...props} />;
}
