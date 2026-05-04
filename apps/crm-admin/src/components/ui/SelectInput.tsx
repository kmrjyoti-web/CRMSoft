'use client';

import { forwardRef } from 'react';

import { Autocomplete } from './Autocomplete';
import type { AutocompleteProps } from './Autocomplete';

/**
 * SelectInput — drop-in replacement backed by the custom Autocomplete.
 * All existing usages (LookupSelect, OrganizationSelect, forms, etc.)
 * automatically get the MUI-style autocomplete behaviour.
 */

type SelectInputProps = AutocompleteProps;

export const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  (props, ref) => {
    return <Autocomplete ref={ref} {...props} />;
  },
);
SelectInput.displayName = 'SelectInput';
