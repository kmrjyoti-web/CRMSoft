'use client';

import { forwardRef } from 'react';

import { AICAutocomplete } from '@coreui/ui-react';

type AutocompleteProps = React.ComponentProps<typeof AICAutocomplete>;

export const Autocomplete = forwardRef<HTMLElement, AutocompleteProps>((props, ref) => {
  return <AICAutocomplete ref={ref as any} size="sm" variant="outlined" {...props} />;
});
Autocomplete.displayName = 'Autocomplete';
