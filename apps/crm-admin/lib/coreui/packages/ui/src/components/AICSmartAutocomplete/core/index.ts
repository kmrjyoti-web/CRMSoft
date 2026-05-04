// Types
export type {
  AICAutocompleteViewMode,
  AutocompleteWildcardOperator,
  AutocompleteConditionalOperator,
  AutoCompleteSearchParam,
  AutoCompleteRequest,
  AutocompleteTableColumn as AICAutocompleteTableColumn,
  AutocompleteFieldConfig,
  AICAutocompleteFeatureFlags,
  AutocompleteSelectionConfig,
  AutocompletePanelConfig,
  AutocompleteSourceConfig,
  AICAutocompleteControlConfig,
  HelperItemType,
  FieldHelperItem,
  WildcardHelperItem,
  HelperItem,
  AutocompleteKeyAction,
  AICAutocompleteProps,
} from "./aic-autocomplete.types";

// Logic
export {
  DEFAULT_FEATURE_FLAGS,
  resolveFeatureFlags,
  parseQuery,
  buildHelperItems,
  moveHelperSelection,
  isFieldItem,
  mapKeyToAutocompleteAction,
  buildSelectionLabel,
  buildAutocompleteRequest,
  buildPlaceholder,
} from "./aic-autocomplete.logic";
