'use client';

import { AICPopover } from '@coreui/ui-react';

type PopoverProps = React.ComponentProps<typeof AICPopover>;

export function Popover(props: PopoverProps) {
  return <AICPopover {...props} />;
}
