export interface ShortcutDefinition {
  id: string;
  code: string;
  label: string;
  description?: string | null;
  category: string;
  actionType: string;
  targetPath?: string | null;
  targetModule?: string | null;
  targetFunction?: string | null;
  defaultKey: string;
  activeKey: string;       // user's customKey if overridden, else defaultKey
  isCustomized: boolean;
  isLocked: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictsWith: string | null;
}

export interface UpsertOverrideDto {
  customKey: string;
}

export interface CreateCustomShortcutDto {
  label: string;
  defaultKey: string;
  description?: string;
  category?: string;
  targetPath?: string;
  targetModule?: string;
}
