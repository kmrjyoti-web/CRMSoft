// Types
export type {
  AICInputmaskType,
  AICInputmaskVariant,
  AICInputmaskSize,
  AICInputmaskShape,
  AICInputmaskState,
  AICInputmaskProps,
} from "./aic-inputmask.types";

// Variants
export {
  sizeStyles as aicInputmaskSizeStyles,
  variantStyles as aicInputmaskVariantStyles,
  shapeStyles as aicInputmaskShapeStyles,
  stateStyles as aicInputmaskStateStyles,
} from "./aic-inputmask.variants";

// Logic
export {
  aicInputmaskReducer,
  initialAICInputmaskState,
  resolveAICInputmaskState,
  resolveMask,
  resolveInputmaskPlaceholder,
  extractRawForMask,
  applyMask,
  applyMaskWithSlots,
  applyRegexFilter,
  truncate,
  normalizeInput,
} from "./aic-inputmask.logic";
export type {
  AICInputmaskAction,
  AICInputmaskInternalState,
  AICInputmaskReducerConfig,
  ResolveAICInputmaskStateProps,
  NormalizeResult,
} from "./aic-inputmask.logic";
