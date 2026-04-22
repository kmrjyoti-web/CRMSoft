// Re-export core types and utilities from @coreui/ui
export { cn } from "@coreui/ui";
export type {
  Size,
  Variant,
  BaseComponentProps,
  SizableProps,
  VariantProps,
  DisableableProps,
} from "@coreui/ui";

// ── Button ──────────────────────────────────────────────
export { AICButton } from "./components/AICButton";
export type { ButtonVariant, ButtonSize, ButtonState } from "@coreui/ui";

// ── Input ───────────────────────────────────────────────
export { AICInput } from "./components/AICInput";
export type { InputType, InputSize, InputState } from "@coreui/ui";

// ── Select ──────────────────────────────────────────────
export { AICSelect } from "./components/AICSelect";
export type { SelectOption, SelectSize, SelectState } from "@coreui/ui";

// ── Checkbox ────────────────────────────────────────────
export { AICCheckbox, AICCheckboxGroup } from "./components/AICCheckbox";
export type { CheckboxState } from "@coreui/ui";

// ── Radio ───────────────────────────────────────────────
export { AICRadio, AICRadioGroup } from "./components/AICRadio";

// ── Switch ──────────────────────────────────────────────
export { AICSwitch } from "./components/AICSwitch";
export type { SwitchSize } from "@coreui/ui";

// ── Badge ──────────────────────────────────────────────
export { AICBadge } from "./components/AICBadge";
export type { BadgeVariant, BadgeSize } from "@coreui/ui";

// ── Avatar ─────────────────────────────────────────────
export { AICAvatar, AICAvatarGroup } from "./components/AICAvatar";
export type { AvatarSize, AvatarShape, AvatarStatus, AvatarGroupSpacing } from "@coreui/ui";

// ── Portal ─────────────────────────────────────────────
export { AICPortal } from "./components/AICPortal";
export type { PortalLevel } from "@coreui/ui";

// ── Tooltip ─────────────────────────────────────────────
export { AICTooltip } from "./components/AICTooltip";

// ── Modal ───────────────────────────────────────────────
export { AICModal } from "./components/AICModal";
export type { ModalSize, ModalMode } from "@coreui/ui";

// ── Popover ─────────────────────────────────────────────
export { AICPopover } from "./components/AICPopover";

// ── Drawer ────────────────────────────────────────────
export { AICDrawer } from "./components/AICDrawer";
export type { DrawerPosition, DrawerSize } from "@coreui/ui";

// ── Toast ─────────────────────────────────────────────
export { AICToastProvider, AICToastContainer, useToast } from "./components/AICToast";
export type { ToastVariant, ToastPosition, ToastData, ToastConfig } from "@coreui/ui";

// ── DesignProvider ───────────────────────────────────────
export { DesignProvider, useTheme, useDensity, useLayout } from "./providers";
export type {
  DesignProviderProps,
  Theme,
  Density,
  LayoutDirection,
  ThemeContextValue,
  DensityContextValue,
  LayoutContextValue,
} from "./providers";

// ── AICNumber ─────────────────────────────────────────
export { AICNumber } from "./components/AICNumber";
export type {
  AICNumberVariant,
  AICNumberSize,
  AICNumberShape,
  AICNumberState,
  SpinnerLayout,
  CurrencySymbol,
  NumberLocale,
} from "@coreui/ui";

// ── AICInputmask ──────────────────────────────────────
export { AICInputmask } from "./components/AICInputmask";
export type {
  AICInputmaskType,
  AICInputmaskVariant,
  AICInputmaskSize,
  AICInputmaskShape,
  AICInputmaskState,
} from "@coreui/ui";

// ── CurrencyInput ───────────────────────────────────────
export { AICCurrencyInput } from "./components/AICCurrencyInput";
export type {
  CurrencyInputVariant,
  CurrencyInputSize,
  CurrencyInputShape,
  CurrencyInputState,
  CurrencyOption,
  CurrencyLocale,
} from "@coreui/ui";

// ── MobileInput ────────────────────────────────────────
export { AICMobileInput } from "./components/AICMobileInput";
export type {
  MobileInputVariant,
  MobileInputSize,
  MobileInputShape,
  MobileInputState,
  CountryData,
} from "@coreui/ui";

// ── SelectInput ────────────────────────────────────────
export { AICSelectInput } from "./components/AICSelectInput";
export type {
  SelectInputVariant,
  SelectInputSize,
  SelectInputShape,
  SelectInputState,
  SelectInputOption,
  SelectInputOptionGroup,
  SelectInputApiConfig,
} from "@coreui/ui";

// ── MultiSelectInput ────────────────────────────────────
export { AICMultiSelectInput } from "./components/AICMultiSelectInput";
export type {
  MultiSelectOption,
  MultiSelectVariant,
  MultiSelectSize,
  MultiSelectShape,
  MultiSelectState,
} from "@coreui/ui";

// ── Autocomplete ────────────────────────────────────────
export { AICAutocomplete } from "./components/AICAutocomplete";
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
} from "@coreui/ui";

// ── ListCheckbox ────────────────────────────────────────
export { AICListCheckbox } from "./components/AICListCheckbox";
export type {
  ListCheckboxOption,
  ListCheckboxState,
} from "@coreui/ui";

// ── CheckboxInput ───────────────────────────────────────
export { AICCheckboxInput } from "./components/AICCheckboxInput";
export type { CheckboxInputState } from "@coreui/ui";

// ── CheckboxGroup (P4.2) ────────────────────────────────
export { AICCheckboxGroup as AICCheckboxGroupControl } from "./components/AICCheckboxGroup";
export type {
  CheckboxGroupOption,
  CheckboxGroupVariant,
} from "@coreui/ui";

// ── RadioGroup (P4.3) ───────────────────────────────────
export { AICRadioGroup as AICRadioGroupControl } from "./components/AICRadioGroup";
export type { RadioGroupOption } from "@coreui/ui";

// ── SwitchInput ─────────────────────────────────────────
export { AICSwitchInput } from "./components/AICSwitchInput";
export type { SwitchInputSize } from "@coreui/ui";

// ── ToggleButton ────────────────────────────────────────
export { AICToggleButton } from "./components/AICToggleButton";
export type { ToggleButtonSize } from "@coreui/ui";

// ── SegmentedControl ────────────────────────────────────
export { AICSegmentedControl } from "./components/AICSegmentedControl";
export type { SegmentOption, SegmentedControlSize } from "@coreui/ui";

// ── ColorPicker ────────────────────────────────────────
export { AICColorPicker } from "./components/AICColorPicker";
export type { RgbColor } from "@coreui/ui";

// ── OTPInput ──────────────────────────────────────────
export { AICOTPInput } from "./components/AICOTPInput";

// ── Fieldset ──────────────────────────────────────────
export { AICFieldset } from "./components/AICFieldset";
export type { FieldsetAppearance } from "@coreui/ui";

// ── DatePicker ────────────────────────────────────────
export { AICDatePicker } from "./components/AICDatePicker";
export type { DatePickerShape, FloatLabelMode } from "@coreui/ui";

// ── Rating ────────────────────────────────────────────
export { AICRating } from "./components/AICRating";
export type { RatingSize } from "@coreui/ui";

// ── Slider ────────────────────────────────────────────
export { AICSlider } from "./components/AICSlider";
export type { SliderOrientation } from "@coreui/ui";

// ── TagsInput ─────────────────────────────────────────
export { AICTagsInput } from "./components/AICTagsInput";

// ── FileUpload ────────────────────────────────────────
export { AICFileUpload } from "./components/AICFileUpload";
export type { FileData } from "@coreui/ui";

// ── Signature ─────────────────────────────────────────
export { AICSignature } from "./components/AICSignature";

// ── RichTextEditor ────────────────────────────────────
export { AICRichTextEditor } from "./components/AICRichTextEditor";
export type { ToolbarCommand } from "@coreui/ui";

// ── AICSmartButton ───────────────────────────────────
export { AICSmartButton } from "./components/AICSmartButton";
export type { AICButtonVariant, AICButtonSize } from "@coreui/ui";

// ── ButtonControl ─────────────────────────────────────
export { AICButtonControl } from "./components/AICButtonControl";
export type { ButtonType, ButtonOption } from "@coreui/ui";

// ── DialogButton ──────────────────────────────────────
export { AICDialogButton } from "./components/AICDialogButton";

// ── ConfirmDialog ─────────────────────────────────────
export { AICConfirmDialog } from "./components/AICConfirmDialog";
export type { ConfirmDialogProps } from "@coreui/ui";

// ── AICIcon ─────────────────────────────────────────
export { AICIcon } from "./components/AICIcon";
export type { AICIconProvider, AICIconSize } from "@coreui/ui";

// ── ToolbarButton ─────────────────────────────────────
export { AICToolbarButton } from "./components/AICToolbarButton";
export type { ToolbarButtonSize, ToolbarButtonColor } from "@coreui/ui";

// ── ToolbarButtonGroup ────────────────────────────────
export { AICToolbarButtonGroup } from "./components/AICToolbarButtonGroup";
export type { ToolbarButtonGroupItem } from "@coreui/ui";

// ── AICToolbar ──────────────────────────────────────
export { AICToolbar } from "./components/AICToolbar";
export type { AICToolbarAction } from "@coreui/ui";

// ── AICDialog ──────────────────────────────────────
export { AICDialog } from "./components/AICDialog";
export type {
  DialogPosition,
  DialogVariant,
  DialogIconStyle,
  DialogIconLayout,
  AICDialogConfig,
} from "@coreui/ui";

// ── AICSmartToast ───────────────────────────────────
export { AICSmartToast } from "./components/AICSmartToast";
export type { AICToastSeverity, AICToastMessage } from "@coreui/ui";

// ── AICTypography ──────────────────────────────────
export { AICTypography } from "./components/AICTypography";
export type {
  TypographyVariant,
  TypographyLevel,
  TypographyWeight,
  TypographyColor,
} from "@coreui/ui";

// ── AICSmartDrawer ──────────────────────────────────
export { AICSmartDrawer } from "./components/AICSmartDrawer";
export type {
  AICDrawerMode,
  AICDrawerPosition,
  AICDrawerButton,
  AICDrawerHeaderButton,
  AICDrawerConfig,
} from "@coreui/ui";

// ── SyncIndicator ────────────────────────────────────
export { AICSyncIndicator } from "./components/AICSyncIndicator";
export type { SyncStatus } from "@coreui/ui";

// ── AICTable ──────────────────────────────────────
export { AICTable } from "./components/AICTable";
export type {
  AICTableProps,
  TableConfig,
  TableColumn,
  ViewMode,
  SortDirection,
  ActiveFilter,
} from "@coreui/ui";

// ── AICTableFull (10-view variant) ────────────────
export { AICTableFull } from "./components/AICTable";
export type {
  AICTableFullProps,
  AICTableFullViewMode,
  AICTableFullDensity,
  ColumnDef,
  KanbanSettings,
  TreeSettings,
  ChartSettings,
  BIWidget,
  BISettings,
  ValidationRule,
  ColumnFilterType,
  ColumnFilterDef,
  FilterSectionDef,
  TableFilterConfig,
  FilterValue,
  FilterValues,
} from "./components/AICTable";

// ── AICSmartAutocomplete ────────────────────────────
export { AICSmartAutocomplete } from "./components/AICSmartAutocomplete";
export type {
  AICAutocompleteViewMode,
  AutocompleteWildcardOperator,
  AutocompleteConditionalOperator,
  AutoCompleteSearchParam,
  AutocompleteFieldConfig,
  AICAutocompleteFeatureFlags,
  AutocompleteSourceConfig,
  AICAutocompleteControlConfig,
  HelperItem,
  AutocompleteKeyAction,
  AICAutocompleteProps,
} from "@coreui/ui";

// ── AICError ────────────────────────────────────────
export { AICErrorBoundary, AICErrorDashboard } from "./components/AICError";
export type { AICErrorDashboardProps } from "./components/AICError";
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
  AICErrorBoundaryProps,
} from "@coreui/ui";

// ── DynamicField ──────────────────────────────────────
export { AICDynamicField } from "./components/AICDynamicField";
export type { DynamicFieldProps, FormLayout } from "@coreui/ui";

// ── DynamicForm ──────────────────────────────────────
export { AICDynamicForm } from "./components/AICDynamicForm";
export type { DynamicFormProps, FormState } from "@coreui/ui";

// ── SchemaBuilder ──────────────────────────────────────
export { AICSchemaBuilder, AICFieldEditor } from "./components/AICSchemaBuilder";
export type {
  SchemaBuilderProps,
  SchemaBuilderState,
  FieldEditorProps,
  TransliterationLanguage,
} from "@coreui/ui";

// ── Hooks ──────────────────────────────────────────────
export { useFocusTrap } from "./hooks/useFocusTrap";
export { useScrollLock } from "./hooks/useScrollLock";
export { useAnimationState } from "./hooks/useAnimationState";
export type { UseAnimationStateReturn } from "./hooks/useAnimationState";
export { usePosition } from "./hooks/usePosition";
export type { UsePositionConfig } from "./hooks/usePosition";
