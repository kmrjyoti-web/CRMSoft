'use client';

import { AICSmartAutocomplete } from '@coreui/ui-react';

type SmartAutocompleteProps = React.ComponentProps<typeof AICSmartAutocomplete>;

export function SmartAutocomplete(props: SmartAutocompleteProps) {
  return <AICSmartAutocomplete {...props} />;
}
