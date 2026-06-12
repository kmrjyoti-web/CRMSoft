// Re-export filter types from CoreUI for feature consumption.
// Features import from here — never from @coreui/* directly.

export type {
  ColumnFilterType,
  ColumnFilterDef,
  FilterSectionDef,
  TableFilterConfig,
  FilterValue,
  FilterValues,
} from '@coreui/ui-react';
