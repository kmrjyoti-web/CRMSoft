// ── Enums ────────────────────────────────────────────────

export type ImportJobStatus =
  | "UPLOADING"
  | "PARSING"
  | "PARSED"
  | "MAPPING"
  | "MAPPED"
  | "VALIDATING"
  | "VALIDATED"
  | "REVIEWING"
  | "IMPORTING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ImportTargetEntity = "CONTACT" | "ORGANIZATION" | "LEAD" | "PRODUCT";

export type ImportRowStatus =
  | "PENDING"
  | "VALID"
  | "INVALID"
  | "DUPLICATE_EXACT"
  | "DUPLICATE_FUZZY"
  | "DUPLICATE_UPDATE"
  | "DUPLICATE_NEW"
  | "DUPLICATE_IN_FILE"
  | "SKIPPED"
  | "IMPORTING"
  | "IMPORTED"
  | "FAILED";

export type DuplicateStrategy = "SKIP" | "UPDATE" | "CREATE_ANYWAY" | "ASK_PER_ROW";

// ── Entities ─────────────────────────────────────────────

export interface ImportProfile {
  id: string;
  name: string;
  description?: string;
  sourceSystem?: string;
  icon?: string;
  color?: string;
  targetEntity: ImportTargetEntity;
  expectedHeaders: string[];
  fieldMapping: FieldMappingRule[];
  defaultValues?: Record<string, unknown>;
  validationRules?: ValidationRule[];
  duplicateCheckFields: string[];
  duplicateStrategy: DuplicateStrategy;
  fuzzyMatchEnabled: boolean;
  fuzzyMatchFields: string[];
  fuzzyThreshold: number;
  usageCount: number;
  lastUsedAt?: string;
  totalImported: number;
  avgSuccessRate?: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isDefault: boolean;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  targetEntity: ImportTargetEntity;
  profileId?: string;
  profile?: ImportProfile;
  status: ImportJobStatus;
  fileHeaders: string[];
  totalRows: number;
  sampleData?: Record<string, unknown>[];
  fieldMapping?: FieldMappingRule[];
  duplicateCheckFields: string[];
  duplicateStrategy: DuplicateStrategy;
  fuzzyMatchEnabled: boolean;
  fuzzyMatchFields: string[];
  fuzzyThreshold: number;
  validRows: number;
  invalidRows: number;
  duplicateExactRows: number;
  duplicateFuzzyRows: number;
  duplicateInFileRows: number;
  skippedRows: number;
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  createdByName: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportRow {
  id: string;
  importJobId: string;
  rowNumber: number;
  rowData: Record<string, unknown>;
  mappedData?: Record<string, unknown>;
  rowStatus: ImportRowStatus;
  validationErrors?: ValidationError[];
  validationWarnings?: ValidationError[];
  isDuplicate: boolean;
  duplicateType?: string;
  duplicateOfEntityId?: string;
  duplicateOfRowNumber?: number;
  duplicateMatchField?: string;
  duplicateMatchValue?: string;
  fuzzyMatchScore?: number;
  patchPreview?: Record<string, PatchField>;
  userAction?: "SKIP" | "ACCEPT" | "FORCE_CREATE";
  userEditedData?: Record<string, unknown>;
  importedEntityId?: string;
  importAction?: string;
  importError?: string;
  importedAt?: string;
}

// ── Sub-types ────────────────────────────────────────────

export interface FieldMappingRule {
  sourceColumn: string;
  targetField: string;
  transform?: string;
  defaultValue?: unknown;
}

export interface ValidationRule {
  field: string;
  type: string;
  params?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface PatchField {
  action: "ADD" | "UPDATE" | "NO_CHANGE";
  oldValue?: unknown;
  newValue?: unknown;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateExactRows: number;
  duplicateFuzzyRows: number;
  duplicateInFileRows: number;
}

export interface ImportResult {
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  skippedRows: number;
  totalRows: number;
}

export interface MappingSuggestion {
  sourceColumn: string;
  suggestedField: string;
  confidence: number;
}

// ── Mutation DTOs ────────────────────────────────────────

export interface ApplyMappingDto {
  fieldMapping: FieldMappingRule[];
  validationRules?: ValidationRule[];
  duplicateCheckFields?: string[];
  duplicateStrategy?: DuplicateStrategy;
  fuzzyMatchEnabled?: boolean;
  fuzzyMatchFields?: string[];
  fuzzyThreshold?: number;
  defaultValues?: Record<string, unknown>;
}

export interface SaveProfileDto {
  name: string;
  description?: string;
  sourceSystem?: string;
}

// ── Query Params ─────────────────────────────────────────

export interface ImportJobListParams {
  page?: number;
  limit?: number;
  status?: ImportJobStatus;
  targetEntity?: ImportTargetEntity;
}

export interface ImportRowListParams {
  page?: number;
  limit?: number;
  rowStatus?: ImportRowStatus;
}
