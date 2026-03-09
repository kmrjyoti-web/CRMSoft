// ═══════════════════════════════════════════════════════════
// UI COMPONENT BARREL EXPORT
// ═══════════════════════════════════════════════════════════
//
// GOLDEN RULE: This is the ONLY entry point for UI components.
// All features import from '@/components/ui' — never from @coreui.
//
// When CoreUI updates: fix the wrapper → run pnpm test:ui → done.
// Features don't change.
// ═══════════════════════════════════════════════════════════

// ── Icon System ──
export { Icon } from './Icon';
export type { IconName, IconProps } from './Icon';

// ── Basic Inputs ──
export { Input } from './Input';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { CheckboxGroup } from './CheckboxGroup';
export { CheckboxInput } from './CheckboxInput';
export { Radio } from './Radio';
export { RadioGroup } from './RadioGroup';
export { Switch } from './Switch';
export { SwitchInput } from './SwitchInput';

// ── Advanced Inputs ──
export { SelectInput } from './SelectInput';
export { MultiSelectInput } from './MultiSelectInput';
export { DatePicker } from './DatePicker';
export { CurrencyInput } from './CurrencyInput';
export { NumberInput } from './NumberInput';
export { MobileInput } from './MobileInput';
export { InputMask } from './InputMask';
export { Autocomplete } from './Autocomplete';
export { SmartAutocomplete } from './SmartAutocomplete';
export { TagsInput } from './TagsInput';
export { OTPInput } from './OTPInput';

// ── Special Inputs ──
export { Rating } from './Rating';
export { Slider } from './Slider';
export { ColorPicker } from './ColorPicker';
export { FileUpload } from './FileUpload';
export { Signature } from './Signature';
export { RichTextEditor } from './RichTextEditor';

// ── Selection Controls ──
export { ListCheckbox } from './ListCheckbox';
export { SegmentedControl } from './SegmentedControl';
export { ToggleButton } from './ToggleButton';

// ── Buttons ──
export { Button } from './Button';
export { SmartButton } from './SmartButton';
export { ButtonControl } from './ButtonControl';
export { DialogButton } from './DialogButton';

// ── Overlays ──
export { Modal } from './Modal';
export { Drawer } from './Drawer';
export { SmartDialog } from './SmartDialog';
export { SmartDrawer } from './SmartDrawer';
export { ConfirmDialog } from './ConfirmDialog';
export { Popover } from './Popover';
export { Tooltip } from './Tooltip';
export { Portal } from './Portal';
export { ToastProvider, ToastContainer, useToast } from './Toast';
export { SmartToast } from './SmartToast';

// ── Display ──
export { Card } from './Card';
export { Badge } from './Badge';
export { Avatar, AvatarGroup } from './Avatar';
export { Typography } from './Typography';
export { SyncIndicator } from './SyncIndicator';
export { ErrorBoundary, ErrorDashboard } from './SmartError';

// ── Table ──
export { Table } from './Table';
export { TableFull } from './TableFull';
export type {
  ColumnFilterType,
  ColumnFilterDef,
  FilterSectionDef,
  TableFilterConfig,
  FilterValue,
  FilterValues,
} from './table-filter.types';

// ── Forms ──
export { DynamicField } from './DynamicField';
export { DynamicForm } from './DynamicForm';
export { SchemaBuilder, FieldEditor } from './SchemaBuilder';
export { Fieldset } from './Fieldset';

// ── Toolbar ──
export { Toolbar } from './Toolbar';
export { ToolbarButton } from './ToolbarButton';
export { ToolbarButtonGroup } from './ToolbarButtonGroup';

// ── Layout Hooks & Components ──
export { useLayout, useMargLayout } from './layout-hooks';
export type { MenuItem } from './layout-hooks';
export { MargThemeCustomizer, MargShortcuts } from './layout-hooks';
export type { MargShortcutsProps } from './layout-hooks';

// ── Icon Map (for dynamic icon lookup) ──
export { ICON_MAP } from './Icon';
