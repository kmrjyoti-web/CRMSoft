// Types
export type {
  AutocompleteViewMode,
  AutocompleteOperator,
  AutocompleteSelectionMode,
  AutocompleteOption,
  AutocompleteTableColumn,
  AutocompleteVariant,
  AutocompleteSize,
  AutocompleteShape,
  AutocompleteState,
  AutocompleteProps,
} from "./autocomplete.types";

// Variants
export {
  sizeStyles as autocompleteSizeStyles,
  variantStyles as autocompleteVariantStyles,
  shapeStyles as autocompleteShapeStyles,
  stateStyles as autocompleteStateStyles,
} from "./autocomplete.variants";

// Logic
export {
  autocompleteReducer,
  initialAutocompleteState,
  resolveAutocompleteState,
  filterAutocompleteOptions,
  highlightMatch,
  findAutocompleteOption,
} from "./autocomplete.logic";
export type {
  AutocompleteAction,
  AutocompleteInternalState,
  ResolveAutocompleteStateProps,
  HighlightSegment,
} from "./autocomplete.logic";
