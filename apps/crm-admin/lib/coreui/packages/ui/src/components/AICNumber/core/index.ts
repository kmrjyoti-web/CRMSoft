// Types
export type {
  AICNumberVariant,
  AICNumberSize,
  AICNumberShape,
  AICNumberState,
  SpinnerLayout,
  CurrencySymbol,
  NumberLocale,
  SpinnerButton,
  AICNumberProps,
} from "./aic-number.types";

// Variants
export {
  sizeStyles as aicNumberSizeStyles,
  spinnerButtonSizes,
  variantStyles as aicNumberVariantStyles,
  shapeStyles as aicNumberShapeStyles,
  stateStyles as aicNumberStateStyles,
} from "./aic-number.variants";

// Logic
export {
  aicNumberReducer,
  initialAICNumberState,
  normalize,
  resolveAICNumberState,
  getLeftButtons,
  getRightButtons,
  formatNumber,
  parseFormattedNumber,
  canIncrement,
  canDecrement,
} from "./aic-number.logic";
export type {
  AICNumberAction,
  AICNumberInternalState,
  AICNumberReducerConfig,
  NormalizeConfig,
  ResolveAICNumberStateProps,
} from "./aic-number.logic";
