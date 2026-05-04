// Types
export type {
  MobileInputVariant,
  MobileInputSize,
  MobileInputShape,
  MobileInputState,
  CountryData,
  MobileInputProps,
} from "./mobile-input.types";

// Variants
export {
  sizeStyles as mobileInputSizeStyles,
  variantStyles as mobileInputVariantStyles,
  shapeStyles as mobileInputShapeStyles,
  stateStyles as mobileInputStateStyles,
} from "./mobile-input.variants";

// Countries
export {
  COUNTRY_DATABASE,
  DEFAULT_COUNTRY_CODE,
} from "./mobile-input.countries";

// Logic
export {
  mobileInputReducer,
  initialMobileInputState,
  resolveMobileInputState,
  applyPhoneMask,
  stripNonDigits,
  filterCountries,
  getPopularCountries,
  getNonPopularCountries,
  validatePhoneNumber,
  findCountryByCode,
} from "./mobile-input.logic";
export type {
  MobileInputAction,
  MobileInputInternalState,
  ResolveMobileInputStateProps,
} from "./mobile-input.logic";
