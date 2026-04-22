// Types
export type {
  MultiSelectOption,
  MultiSelectVariant,
  MultiSelectSize,
  MultiSelectShape,
  MultiSelectState,
  MultiSelectInputProps,
} from "./multi-select-input.types";

// Variants
export {
  sizeStyles as multiSelectSizeStyles,
  variantStyles as multiSelectVariantStyles,
  shapeStyles as multiSelectShapeStyles,
  stateStyles as multiSelectStateStyles,
} from "./multi-select-input.variants";

// Logic
export {
  multiSelectReducer,
  initialMultiSelectState,
  resolveMultiSelectState,
  filterMultiSelectOptions,
  getMultiSelectDisplayLabel,
  getSelectedOptions,
  canSelectMore,
} from "./multi-select-input.logic";
export type {
  MultiSelectAction,
  MultiSelectInternalState,
  ResolveMultiSelectStateProps,
} from "./multi-select-input.logic";
