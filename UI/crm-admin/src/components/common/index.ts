// ═══════════════════════════════════════════════════════════
// COMMON COMPONENT BARREL EXPORT
// ═══════════════════════════════════════════════════════════
// Feature modules import from '@/components/common/<Name>'.
// All common components use '@/components/ui' internally.
// ═══════════════════════════════════════════════════════════

export { DataTable } from "./DataTable";
export { FilterPanel } from "./FilterPanel";
export { LookupSelect } from "./LookupSelect";
export { useConfirmDialog } from "./useConfirmDialog";
export { StatusBadge } from "./StatusBadge";
export { EmptyState } from "./EmptyState";
export { PageHeader } from "./PageHeader";
export { FormErrors } from "./FormErrors";
export { LoadingSpinner } from "./LoadingSpinner";
export { PageSkeleton } from "./PageSkeleton";
export { QueryErrorState } from "./QueryErrorState";
export { IndustryFields } from "./IndustryFields";
export { IndustryBadge } from "./IndustryBadge";
export { ForceUpdateBanner } from "./ForceUpdateBanner";
export { AddressFields } from "./AddressFields";
export type { AddressPatch, AddressFieldsProps } from "./AddressFields";
export { QuantityInput } from "./QuantityInput";
export { DiscountInput } from "./DiscountInput";
export { SmartSearch } from "./SmartSearch";
export type {
  SmartSearchField,
  SmartSearchProps,
  SmartSearchColumn,
  SmartSearchDisplayMode,
  ActiveFilter,
} from "./SmartSearch";
export { SmartDateInput } from "./SmartDateInput";
export type { SmartDateInputProps, CompanyDateFormat } from "./SmartDateInput";
