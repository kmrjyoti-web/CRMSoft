// Core utilities
export { cn } from "./utils/cn";
export type { ClassValue } from "./utils/cn";

// ── Utility: Animation ─────────────────────────────────
export { getAnimationClasses, durationMap } from "./utils/animation";
export type {
  AnimationType,
  AnimationState,
  AnimationConfig,
  AnimationClasses,
} from "./utils/animation";

// ── Utility: Portal ────────────────────────────────────
export { getPortalZIndex, resolvePortalConfig, portalConfigSchema } from "./utils/portal";
export type {
  PortalLevel,
  PortalConfig,
  PortalConfigSchemaInput,
  PortalConfigSchemaOutput,
} from "./utils/portal";

// ── Utility: Position ──────────────────────────────────
export { computePosition } from "./utils/position";
export type {
  Placement,
  Rect,
  ViewportSize,
  ContentSize,
  PositionConfig,
  ComputedPosition,
} from "./utils/position";

// ── Utility: Focus Trap ────────────────────────────────
export {
  focusTrapReducer,
  initialFocusTrapState,
  resolveFocusTrapConfig,
  getFocusTrapKeyboardHandlers,
  focusTrapConfigSchema,
} from "./utils/focus-trap";
export type {
  FocusTrapConfig,
  FocusTrapAction,
  FocusTrapState,
  FocusIntent,
} from "./utils/focus-trap";

// Shared types
export type {
  Size,
  Variant,
  BaseComponentProps,
  SizableProps,
  VariantProps,
  DisableableProps,
} from "./types";

// ── Button ──────────────────────────────────────────────
export type {
  ButtonVariant,
  ButtonSize,
  ButtonState,
  ButtonProps,
  ButtonAction,
  ButtonInternalState,
} from "./components/AICButton/core";

export {
  getButtonStyles,
  buttonReducer,
  initialButtonState,
  resolveButtonState,
  getButtonA11yProps,
  getButtonKeyboardHandlers,
  buttonPropsSchema,
  resolveButtonDefaults,
} from "./components/AICButton/core";

// ── Input ───────────────────────────────────────────────
export type {
  InputType,
  InputSize,
  InputState,
  InputProps,
  InputAction,
  InputInternalState,
} from "./components/AICInput/core";

export {
  getInputStyles,
  getInputWrapperStyles,
  getInputErrorStyles,
  inputReducer,
  initialInputState,
  resolveInputState,
  shouldShowClear,
  getInputA11yProps,
  getInputKeyboardHandlers,
  inputPropsSchema,
  resolveInputDefaults,
} from "./components/AICInput/core";

// ── Select ──────────────────────────────────────────────
export type {
  SelectOption,
  SelectSize,
  SelectState,
  SelectProps,
  SelectAction,
  SelectInternalState,
  OptionGroup,
} from "./components/AICSelect/core";

export {
  getSelectTriggerStyles,
  getSelectDropdownStyles,
  getSelectOptionStyles,
  getSelectTagStyles,
  getSelectErrorStyles,
  getSelectWrapperStyles,
  selectReducer,
  initialSelectState,
  getFilteredOptions,
  getGroupedOptions,
  getSelectTriggerA11yProps,
  getSelectListboxA11yProps,
  getSelectOptionA11yProps,
  getSelectKeyboardHandlers,
  selectPropsSchema,
  resolveSelectDefaults,
} from "./components/AICSelect/core";

// ── Checkbox ────────────────────────────────────────────
export type {
  CheckboxState,
  CheckboxProps,
  CheckboxGroupProps,
  CheckboxAction,
} from "./components/AICCheckbox/core";

export {
  getCheckboxStyles,
  getCheckboxWrapperStyles,
  getCheckboxGroupStyles,
  getCheckboxLabelStyles,
  getCheckboxDescriptionStyles,
  checkboxReducer,
  resolveCheckboxVisualState,
  getCheckboxA11yProps,
  getCheckboxKeyboardHandlers,
  checkboxPropsSchema,
  resolveCheckboxDefaults,
} from "./components/AICCheckbox/core";

// ── Radio ───────────────────────────────────────────────
export type {
  RadioProps,
  RadioGroupProps,
  RadioAction,
} from "./components/AICRadio/core";

export {
  getRadioStyles,
  getRadioWrapperStyles,
  getRadioLabelStyles,
  getRadioDescriptionStyles,
  getRadioGroupStyles,
  radioGroupReducer,
  getRadioA11yProps,
  getRadioGroupA11yProps,
  radioPropsSchema,
  resolveRadioDefaults,
} from "./components/AICRadio/core";

// ── Switch ──────────────────────────────────────────────
export type {
  SwitchSize,
  SwitchProps,
  SwitchAction,
} from "./components/AICSwitch/core";

export {
  getSwitchTrackStyles,
  getSwitchThumbStyles,
  getSwitchWrapperStyles,
  getSwitchLabelStyles,
  getSwitchDescriptionStyles,
  switchReducer,
  getSwitchA11yProps,
  getSwitchKeyboardHandlers,
  switchPropsSchema,
  resolveSwitchDefaults,
} from "./components/AICSwitch/core";

// ── Badge ──────────────────────────────────────────────
export type {
  BadgeVariant,
  BadgeSize,
  BadgeProps,
  BadgeAction,
  BadgeInternalState,
  BadgeA11yInput,
  BadgeA11yProps,
  BadgeRemoveA11yProps,
} from "./components/AICBadge/core";

export {
  getBadgeStyles,
  getBadgeRemoveButtonStyles,
  badgeReducer,
  initialBadgeState,
  getBadgeA11yProps,
  getBadgeRemoveA11yProps,
  getBadgeKeyboardHandlers,
  badgePropsSchema,
  resolveBadgeDefaults,
} from "./components/AICBadge/core";

// ── Avatar ─────────────────────────────────────────────
export type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarImageState,
  AvatarProps,
  AvatarGroupSpacing,
  AvatarGroupProps,
  AvatarAction,
  AvatarInternalState,
  AvatarA11yInput,
  AvatarA11yProps,
} from "./components/AICAvatar/core";

export {
  getAvatarStyles,
  getAvatarImageStyles,
  getAvatarFallbackStyles,
  getAvatarStatusStyles,
  getAvatarGroupStyles,
  getAvatarOverflowStyles,
  getAvatarFallbackText,
  avatarReducer,
  initialAvatarState,
  shouldShowFallback,
  getAvatarA11yProps,
  getAvatarImageA11yProps,
  getAvatarGroupA11yProps,
  avatarPropsSchema,
  resolveAvatarDefaults,
  avatarGroupPropsSchema,
  resolveAvatarGroupDefaults,
} from "./components/AICAvatar/core";

// ── Tooltip ─────────────────────────────────────────────
export type {
  TooltipTrigger,
  TooltipProps,
  TooltipAction,
  TooltipInternalState,
} from "./components/AICTooltip/core";

export {
  getTooltipStyles,
  getTooltipInlineStyles,
  getTooltipArrowStyles,
  tooltipReducer,
  initialTooltipState,
  getTooltipA11yProps,
  getTooltipTriggerA11yProps,
  tooltipPropsSchema,
  resolveTooltipDefaults,
} from "./components/AICTooltip/core";

// ── Modal ───────────────────────────────────────────────
export type {
  ModalSize,
  ModalMode,
  ModalProps,
  ModalAction,
  ModalInternalState,
} from "./components/AICModal/core";

export {
  modalSizeStyles,
  modalModeBaseStyles,
  modalModeAnimations,
  getModalOverlayStyles,
  getModalContentStyles,
  getModalHeaderStyles,
  getModalBodyStyles,
  getModalFooterStyles,
  getModalCloseButtonStyles,
  modalReducer,
  initialModalState,
  resolveModalMode,
  getModalA11yProps,
  getModalKeyboardHandlers,
  modalPropsSchema,
  resolveModalDefaults,
} from "./components/AICModal/core";

// ── Popover ─────────────────────────────────────────────
export type {
  PopoverTrigger,
  PopoverProps as PopoverCoreProps,
  PopoverAction,
  PopoverReducerConfig,
  PopoverInternalState,
} from "./components/AICPopover/core";

export {
  getPopoverContentStyles,
  getPopoverArrowStyles,
  popoverReducer,
  initialPopoverState,
  getPopoverA11yProps,
  getPopoverTriggerA11yProps,
  popoverPropsSchema,
  resolvePopoverDefaults,
} from "./components/AICPopover/core";

// ── Drawer ────────────────────────────────────────────
export type {
  DrawerPosition,
  DrawerSize,
  DrawerProps,
  DrawerAction,
  DrawerInternalState,
  DrawerReducerConfig,
  DrawerA11yInput,
  DrawerA11yProps,
} from "./components/AICDrawer/core";

export {
  drawerHorizontalSizeStyles,
  drawerVerticalSizeStyles,
  drawerPositionStyles,
  drawerPositionAnimations,
  getDrawerOverlayStyles,
  getDrawerContentStyles,
  getDrawerHeaderStyles,
  getDrawerBodyStyles,
  getDrawerCloseButtonStyles,
  getDrawerResizeHandleStyles,
  drawerReducer,
  initialDrawerState,
  getDrawerA11yProps,
  getDrawerKeyboardHandlers,
  drawerPropsSchema,
  resolveDrawerDefaults,
} from "./components/AICDrawer/core";

// ── Toast ─────────────────────────────────────────────
export type {
  ToastVariant,
  ToastPosition,
  ToastData,
  ToastConfig,
  ToastAction,
  ToastInternalState,
  ToastStore,
  ToastStoreListener,
  ToastA11yInput,
  ToastA11yProps,
  ToastRegionA11yProps,
} from "./components/AICToast/core";

export {
  toastVariantStyles,
  toastVariantIconColors,
  toastPositionStyles,
  getToastStyles,
  getToastContainerStyles,
  getToastDismissButtonStyles,
  getToastIconStyles,
  getToastActionButtonStyles,
  toastReducer,
  initialToastState,
  generateToastId,
  createToast,
  createToastStore,
  getToastA11yProps,
  getToastRegionA11yProps,
  toastConfigSchema,
  resolveToastDefaults,
} from "./components/AICToast/core";

// ── Core Models (P0.1) ──────────────────────────────────
export type {
  FormSchema,
  FormFieldConfig,
  ValidationConfig,
  ControlType,
  ColumnConfig,
  RowConfig,
  TabConfig,
  ApiConfig,
  Option,
  SuffixAction,
  ConfirmDialogConfig,
  DialogType,
  AppConfig,
  ApiEndpointsConfig,
  FloatingMode,
  ControlSize,
  ControlSizeConfig,
  UiConfig,
  IconName,
  EditorConfig,
  EditorOption,
  EditorToolbarVisibility,
} from "./core/models";
export {
  GLOBAL_APP_CONFIG,
  CONTROL_TYPES,
  CONTROL_SIZES,
  GLOBAL_UI_CONFIG,
  DEFAULT_EDITOR_CONFIG,
} from "./core/models";

// ── Core Utils (P0.2) ──────────────────────────────────
export { ValidationUtil } from "./core/utils";
export type { ControlLike } from "./core/utils";

// ── Core Helpers (P0.2) ────────────────────────────────
export { StyleHelper } from "./core/helpers";
export { getIcon, getIconSafe } from "./core/helpers";

// ── AICNumber ─────────────────────────────────────────
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
  AICNumberAction,
  AICNumberInternalState,
  AICNumberReducerConfig,
  NormalizeConfig,
  ResolveAICNumberStateProps,
} from "./components/AICNumber/core";

export {
  aicNumberSizeStyles,
  spinnerButtonSizes,
  aicNumberVariantStyles,
  aicNumberShapeStyles,
  aicNumberStateStyles,
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
} from "./components/AICNumber/core";

// ── AICInputmask ──────────────────────────────────────
export type {
  AICInputmaskType,
  AICInputmaskVariant,
  AICInputmaskSize,
  AICInputmaskShape,
  AICInputmaskState,
  AICInputmaskProps,
  AICInputmaskAction,
  AICInputmaskInternalState,
  AICInputmaskReducerConfig,
  ResolveAICInputmaskStateProps,
  NormalizeResult,
} from "./components/AICInputmask/core";

export {
  aicInputmaskSizeStyles,
  aicInputmaskVariantStyles,
  aicInputmaskShapeStyles,
  aicInputmaskStateStyles,
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
} from "./components/AICInputmask/core";

// ── CurrencyInput ───────────────────────────────────────
export type {
  CurrencyInputVariant,
  CurrencyInputSize,
  CurrencyInputShape,
  CurrencyInputState,
  CurrencyOption,
  CurrencyLocale,
  CurrencyInputProps,
  CurrencyInputAction,
  CurrencyInputInternalState,
  CurrencyInputReducerConfig,
  ResolveCurrencyInputStateProps,
} from "./components/AICCurrencyInput/core";

export {
  currencyInputSizeStyles,
  currencyInputVariantStyles,
  currencyInputShapeStyles,
  currencyInputStateStyles,
  currencyInputReducer,
  initialCurrencyInputState,
  resolveCurrencyInputState,
  formatCurrency,
  parseCurrencyInput,
  clampCurrency,
  validateCurrencyRange,
} from "./components/AICCurrencyInput/core";

// ── MobileInput ────────────────────────────────────────
export type {
  MobileInputVariant,
  MobileInputSize,
  MobileInputShape,
  MobileInputState,
  CountryData,
  MobileInputProps,
  MobileInputAction,
  MobileInputInternalState,
  ResolveMobileInputStateProps,
} from "./components/AICMobileInput/core";

export {
  mobileInputSizeStyles,
  mobileInputVariantStyles,
  mobileInputShapeStyles,
  mobileInputStateStyles,
  COUNTRY_DATABASE,
  DEFAULT_COUNTRY_CODE,
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
} from "./components/AICMobileInput/core";

// ── SelectInput ────────────────────────────────────────
export type {
  SelectInputVariant,
  SelectInputSize,
  SelectInputShape,
  SelectInputState,
  SelectInputOption,
  SelectInputOptionGroup,
  SelectInputApiConfig,
  SelectInputProps,
  SelectInputAction,
  SelectInputInternalState,
  ResolveSelectInputStateProps,
} from "./components/AICSelectInput/core";

export {
  selectInputSizeStyles,
  selectInputVariantStyles,
  selectInputShapeStyles,
  selectInputStateStyles,
  selectInputOptionStyles,
  selectInputGroupHeaderStyles,
  selectInputReducer,
  initialSelectInputState,
  resolveSelectInputState,
  filterSelectOptions,
  groupSelectOptions,
  findOptionByValue,
  getSelectableOptions,
} from "./components/AICSelectInput/core";

// ── MultiSelectInput ────────────────────────────────────
export type {
  MultiSelectOption,
  MultiSelectVariant,
  MultiSelectSize,
  MultiSelectShape,
  MultiSelectState,
  MultiSelectInputProps,
  MultiSelectAction,
  MultiSelectInternalState,
  ResolveMultiSelectStateProps,
} from "./components/AICMultiSelectInput/core";

export {
  multiSelectSizeStyles,
  multiSelectVariantStyles,
  multiSelectShapeStyles,
  multiSelectStateStyles,
  multiSelectReducer,
  initialMultiSelectState,
  resolveMultiSelectState,
  filterMultiSelectOptions,
  getMultiSelectDisplayLabel,
  getSelectedOptions,
  canSelectMore,
} from "./components/AICMultiSelectInput/core";

// ── Autocomplete ────────────────────────────────────────
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
  AutocompleteAction,
  AutocompleteInternalState,
  ResolveAutocompleteStateProps,
  HighlightSegment,
} from "./components/AICAutocomplete/core";

export {
  autocompleteSizeStyles,
  autocompleteVariantStyles,
  autocompleteShapeStyles,
  autocompleteStateStyles,
  autocompleteReducer,
  initialAutocompleteState,
  resolveAutocompleteState,
  filterAutocompleteOptions,
  highlightMatch,
  findAutocompleteOption,
} from "./components/AICAutocomplete/core";

// ── ListCheckbox ────────────────────────────────────────
export type {
  ListCheckboxOption,
  ListCheckboxState,
  ListCheckboxProps,
  ListCheckboxAction,
  ListCheckboxInternalState,
  ResolveListCheckboxStateProps,
} from "./components/AICListCheckbox/core";

export {
  listCheckboxStateStyles,
  listCheckboxOptionItemStyles,
  listCheckboxChipStyles,
  listCheckboxReducer,
  initialListCheckboxState,
  resolveListCheckboxState,
  filterListCheckboxOptions,
  getSelectedOptionDetails,
  getVisibleChips,
  getRemainingCount,
} from "./components/AICListCheckbox/core";

// ── CheckboxInput ───────────────────────────────────────
export type {
  CheckboxInputState,
  CheckboxInputProps,
  ResolveCheckboxInputStateProps,
} from "./components/AICCheckboxInput/core";

export {
  resolveCheckboxInputState,
  isCheckboxRichLayout,
} from "./components/AICCheckboxInput/core";

// ── CheckboxGroup ───────────────────────────────────────
export type {
  CheckboxGroupOption,
  CheckboxGroupVariant,
  CheckboxGroupProps as CheckboxGroupControlProps,
  CheckboxGroupAction,
  CheckboxGroupInternalState,
} from "./components/AICCheckboxGroup/core";

export {
  checkboxGroupReducer,
  initialCheckboxGroupState,
  toggleCheckboxValue,
  canDeselect,
  getGridColsClass,
} from "./components/AICCheckboxGroup/core";

// ── RadioGroup ──────────────────────────────────────────
export type {
  RadioGroupOption,
  RadioGroupProps as RadioGroupControlProps,
} from "./components/AICRadioGroup/core";

export {
  getRadioGridColsClass,
  getNextRadioValue,
} from "./components/AICRadioGroup/core";

// ── SwitchInput ─────────────────────────────────────────
export type {
  SwitchInputSize,
  SwitchInputProps,
  SwitchSizeConfig,
} from "./components/AICSwitchInput/core";

export {
  switchSizeStyles,
  isSwitchRichLayout,
} from "./components/AICSwitchInput/core";

// ── ToggleButton ────────────────────────────────────────
export type {
  ToggleButtonSize,
  ToggleButtonProps,
  ToggleButtonSizeConfig,
} from "./components/AICToggleButton/core";

export {
  toggleButtonSizeStyles,
  toggleButtonActiveStyles,
  toggleButtonInactiveStyles,
} from "./components/AICToggleButton/core";

// ── SegmentedControl ────────────────────────────────────
export type {
  SegmentOption,
  SegmentedControlSize,
  SegmentedControlProps,
  SegmentedControlSizeConfig,
} from "./components/AICSegmentedControl/core";

export {
  segmentedControlSizeStyles,
} from "./components/AICSegmentedControl/core";

// ── ColorPicker ────────────────────────────────────────
export type {
  RgbColor,
  ColorPickerProps,
} from "./components/AICColorPicker/core";

export {
  DEFAULT_PALETTE,
  isValidHex,
  safeColor,
  hexToRgb,
  clampRgb,
  rgbToHex,
  addRecentColor,
} from "./components/AICColorPicker/core";

// ── OTPInput ──────────────────────────────────────────
export type { OTPInputProps } from "./components/AICOTPInput/core";
export {
  createEmptyDigits,
  parseOTPValue,
  joinDigits,
  isOTPComplete,
  handleDigitInput,
  handleBackspace,
  formatTimer,
} from "./components/AICOTPInput/core";

// ── Fieldset ──────────────────────────────────────────
export type { FieldsetAppearance, FieldsetProps } from "./components/AICFieldset/core";
export { getFieldsetContainerClass } from "./components/AICFieldset/core";

// ── DatePicker ────────────────────────────────────────
export type {
  DatePickerShape,
  FloatLabelMode,
  DatePickerProps,
} from "./components/AICDatePicker/core";
export {
  getShapeClass,
  isDateEmpty,
  formatDateForInput,
} from "./components/AICDatePicker/core";

// ── Rating ────────────────────────────────────────────
export type {
  RatingSize,
  RatingProps,
  RatingSizeConfig,
} from "./components/AICRating/core";
export {
  generateStars,
  isStarFilled,
  isStarHalf,
  computeRatingFromEvent,
  ratingSizeStyles,
} from "./components/AICRating/core";

// ── Slider ────────────────────────────────────────────
export type { SliderOrientation, SliderProps } from "./components/AICSlider/core";
export {
  sliderPercentage,
  snapToStep,
  clampSliderValue,
  generateTicks,
  valueFromPosition,
} from "./components/AICSlider/core";

// ── TagsInput ─────────────────────────────────────────
export type { TagsInputProps } from "./components/AICTagsInput/core";
export {
  addTag,
  removeTag,
  removeLastTag,
  filterSuggestions,
  canAddTag,
} from "./components/AICTagsInput/core";

// ── FileUpload ────────────────────────────────────────
export type { FileData, FileUploadProps } from "./components/AICFileUpload/core";
export {
  isImageFile,
  isImageDataUrl,
  formatFileSize,
  readFileAsDataUrl,
} from "./components/AICFileUpload/core";

// ── Signature ─────────────────────────────────────────
export type { SignatureProps } from "./components/AICSignature/core";
export {
  getCanvasCoords,
  initCanvasContext,
  clearCanvas,
  canvasToDataUrl,
  loadImageToCanvas,
} from "./components/AICSignature/core";

// ── RichTextEditor ────────────────────────────────────
export type {
  RichTextEditorProps,
  ToolbarCommand,
} from "./components/AICRichTextEditor/core";
export {
  execCommand,
  execCommand as execEditorCommand,
  mergeEditorConfig,
  cleanEditorHtml,
} from "./components/AICRichTextEditor/core";

// ── AICButton ───────────────────────────────────────
export type {
  AICButtonVariant,
  AICButtonSize,
  AICButtonProps,
} from "./components/AICSmartButton/core";
export {
  AIC_BUTTON_VARIANTS,
  AIC_BUTTON_SIZES,
  getAICButtonVariantClasses,
  getAICButtonSizeClasses,
} from "./components/AICSmartButton/core";

// ── ButtonControl ─────────────────────────────────────
export type {
  ButtonType,
  ButtonOption,
  ButtonControlProps,
} from "./components/AICButtonControl/core";
export { isActiveOption } from "./components/AICButtonControl/core";

// ── DialogButton ──────────────────────────────────────
export type { DialogButtonProps } from "./components/AICDialogButton/core";
export { getDialogButtonColorClasses } from "./components/AICDialogButton/core";

// ── ConfirmDialog ─────────────────────────────────────
export type { ConfirmDialogProps } from "./components/AICConfirmDialog/core";
export {
  getDialogIconBgClass,
  getDialogIconTextClass,
  getDialogConfirmButtonClass,
  getDialogIconName,
} from "./components/AICConfirmDialog/core";

// ── AICIcon ─────────────────────────────────────────
export type {
  AICIconProvider,
  AICIconSize,
  AICIconProps,
} from "./components/AICIcon/core";
export {
  resolveIconSize,
  processSvgForColor,
} from "./components/AICIcon/core";

// ── ToolbarButton ─────────────────────────────────────
export type {
  ToolbarButtonSize,
  ToolbarButtonColor,
  ToolbarButtonProps,
} from "./components/AICToolbarButton/core";
export {
  mapColorToVariant,
  resolveToolbarIcon,
} from "./components/AICToolbarButton/core";

// ── ToolbarButtonGroup ────────────────────────────────
export type {
  ToolbarButtonGroupItem,
  ToolbarButtonGroupProps,
} from "./components/AICToolbarButtonGroup/core";
export {
  resolveGroupButtonSize,
  resolveGroupButtonColor,
  isButtonActive,
} from "./components/AICToolbarButtonGroup/core";

// ── AICToolbar ──────────────────────────────────────
export type {
  AICToolbarAction,
  AICToolbarProps,
} from "./components/AICToolbar/core";
export {
  findActionById,
  getPrimaryActionVariant,
} from "./components/AICToolbar/core";

// ── AICDialog ──────────────────────────────────────
export type {
  DialogPosition,
  DialogVariant,
  DialogIconStyle,
  DialogIconLayout,
  AICDialogConfig,
  AICDialogProps,
} from "./components/AICDialog/core";

export {
  getOverlayPositionStyles,
  getIconBadgeClasses,
  getIconColorClass,
} from "./components/AICDialog/core";

// ── AICToast ───────────────────────────────────────
export type {
  AICToastSeverity,
  AICToastMessage,
  AICToastProps as AICToastCoreProps,
} from "./components/AICSmartToast/core";

export {
  generateAICToastId,
  getToastSeverityStyles,
  getAICToastIconName,
} from "./components/AICSmartToast/core";

// ── AICTypography ──────────────────────────────────
export type {
  TypographyVariant,
  TypographyLevel,
  TypographyWeight,
  TypographyColor,
  AICTypographyProps,
} from "./components/AICTypography/core";

export {
  getTypographyClasses,
  getTypographyTag,
} from "./components/AICTypography/core";

// ── AICDrawer ──────────────────────────────────────
export type {
  AICDrawerMode,
  AICDrawerPosition,
  AICDrawerButton,
  AICDrawerHeaderButton,
  AICDrawerConfig,
  AICDrawerProps,
} from "./components/AICSmartDrawer/core";

export {
  getDrawerContainerClasses,
  getDrawerContainerStyles,
  openInNewTab,
} from "./components/AICSmartDrawer/core";

// ── SyncIndicator ────────────────────────────────────
export type {
  SyncStatus,
  SyncIndicatorProps,
} from "./components/AICSyncIndicator/core";

export {
  getSyncStatusColor,
  getSyncDotColor,
  getSyncStatusLabel,
  formatLastSyncTime,
} from "./components/AICSyncIndicator/core";

// ── AICTable ──────────────────────────────────────
export type {
  ViewMode,
  DataStrategy,
  PagingMode,
  PaginatorPosition,
  Density as AICTableDensity,
  ColumnType,
  FilterOperator,
  DateOperator,
  SortDirection,
  TableApiConfig,
  ExportOption,
  ExportConfig,
  EmptyStateAction,
  EmptyStateConfig,
  MaskConfig,
  ImageConfig,
  CellTemplateItem,
  ColumnFilterConfig,
  CardViewColumnConfig,
  TableColumn,
  ToolbarAction,
  DensitySetting,
  SizerConfig,
  SearchConfig,
  StyleConfig,
  CardViewConfig,
  MapViewConfig,
  FooterColumn,
  FooterConfig,
  RowMenuItem,
  RowMenuSubItem,
  RowActionItem,
  FilterDefinition,
  FilterGroup,
  AdvancedFilterConfig,
  ActiveFilter,
  TableState,
  TableConfigSection,
  TableConfig,
  AICTableProps,
} from "./components/AICTable/core";

export {
  createDefaultTableState,
  getVisibleColumns,
  getChoosableColumns,
  toggleSortDirection,
  sortData,
  filterDataByGlobalTerm,
  hasActiveFilters,
  getTotalPages,
  paginateData,
  getPageRange,
  getDensitySetting,
  getDensityIcon,
  calculateFooterValue,
  applyTableMask,
  DATA_STRATEGY_DESCRIPTIONS,
} from "./components/AICTable/core";

// ── AICAutocomplete ────────────────────────────────
export type {
  AICAutocompleteViewMode,
  AutocompleteWildcardOperator,
  AutocompleteConditionalOperator,
  AutoCompleteSearchParam,
  AutoCompleteRequest,
  AICAutocompleteTableColumn,
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
} from "./components/AICSmartAutocomplete/core";

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
} from "./components/AICSmartAutocomplete/core";

// ── AICError ────────────────────────────────────────
export type {
  AICErrorScope,
  AICErrorSource,
  AICErrorSeverity,
  AICServerErrorDetail,
  AICApiResponse,
  ApiError,
  AICErrorGlobalConfig,
  AICFormErrorRule,
  AICFormErrorConfig,
  AICComponentErrorConfig,
  ErrorLogEntry,
  ErrorContext,
  EnvironmentInfo,
  AICErrorDashboardProps,
  AICErrorBoundaryProps,
} from "./components/AICError/core";

export {
  DEFAULT_ERROR_CONFIG,
  normalizeToApiError,
  isApiError,
  isSuccessLikeError,
  collectEnvironmentInfo,
  logError,
  getRecentErrors,
  clearAllErrors,
  matchFormErrors,
  getErrorSeverityStyles,
} from "./components/AICError/core";

// ── DynamicField ──────────────────────────────────────
export type {
  DynamicFieldProps,
  FieldsetProps as DynamicFieldFieldsetProps,
} from "./components/AICDynamicField/core";

export {
  TEXT_FIELD_TYPES,
  SELECT_FIELD_TYPES,
  BOOLEAN_FIELD_TYPES,
  GROUP_FIELD_TYPES,
  INTERACTIVE_FIELD_TYPES,
  ACTION_FIELD_TYPES,
  CONTAINER_FIELD_TYPES,
  getFieldCategory,
  isKnownFieldType,
  isFieldRequired,
  getFieldError,
  resolveDefaultValue,
  mergeUiConfig,
} from "./components/AICDynamicField/core";

// ── DynamicForm ──────────────────────────────────────
export type {
  FormLayout,
  DynamicFormProps,
  FormState,
} from "./components/AICDynamicForm/core";

export {
  extractAllFields,
  buildInitialValues,
  validateForm,
  getVisibleRows,
  getFirstTabId,
  isTabLayout,
} from "./components/AICDynamicForm/core";

// ── SchemaBuilder ──────────────────────────────────────
export type {
  SchemaBuilderProps,
  SchemaBuilderState,
  FieldEditorProps,
  TransliterationLanguage,
} from "./components/AICSchemaBuilder/core";

export {
  TRANSLITERATION_LANGUAGES,
  AVAILABLE_CONTROL_TYPES,
  createInitialBuilderState,
  getPreviewRows,
  getHeaderRows,
  moveField,
  downloadSchemaAsJson,
  updateFieldValidator,
  updateFieldProp,
  updateFieldTransliteration,
} from "./components/AICSchemaBuilder/core";

// ── Core Controls (P0.4) ───────────────────────────────
export type { BaseControlProps, ResolvedControlConfig } from "./core/controls";
