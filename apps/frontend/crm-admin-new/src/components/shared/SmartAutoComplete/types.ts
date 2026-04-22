export type EntityType = 'CONTACT' | 'ORGANIZATION' | 'PRODUCT' | 'LEDGER' | 'ROW_CONTACT' | 'INVOICE';
export type ViewMode = 'TABLE' | 'CARD' | 'LIST';
export type SearchPattern = 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT';

export interface SearchFilter {
  parameter: string;
  value: string;
  pattern: SearchPattern;
}

export interface ParameterConfig {
  code: string;
  label: string;
  isDefault?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  format?: (val: any) => string;
}

export interface SmartAutoCompleteProps {
  entityType: EntityType;
  onSelect: (item: any) => void;
  value?: any;
  placeholder?: string;
  defaultView?: ViewMode;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  tableColumns?: TableColumn[];
  allowedParameters?: string[];
  onCreateNew?: () => void;
  multiple?: boolean;
  className?: string;
}
