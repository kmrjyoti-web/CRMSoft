// ── Control Room Types ──────────────────────────────────

export type ControlRoomCategory =
  | "GENERAL"
  | "SALE"
  | "PURCHASE"
  | "ACCOUNTING"
  | "INVENTORY"
  | "TAXATION"
  | "TRANSACTION"
  | "MASTER"
  | "EMAIL_SMS"
  | "INTEGRATION"
  | "WORKFLOW"
  | "ADDITIONAL";

export type ControlRoomValueType =
  | "BOOLEAN"
  | "STRING"
  | "NUMBER"
  | "SELECT"
  | "MULTI_SELECT"
  | "JSON"
  | "CONFIGURE";

export type ControlRoomLevel =
  | "DEFAULT"
  | "INDUSTRY"
  | "WORKING"
  | "ACCOUNTING"
  | "INVENTORY"
  | "CONTROL_ROOM"
  | "PAGE"
  | "RBAC";

export interface SelectOption {
  label: string;
  value: string;
}

export interface ControlRoomRule {
  id: string;
  ruleCode: string;
  label: string;
  description: string | null;
  helpUrl: string | null;
  valueType: ControlRoomValueType;
  defaultValue: string | null;
  selectOptions: SelectOption[] | null;
  minValue: number | null;
  maxValue: number | null;
  allowedLevels: ControlRoomLevel[];
  subCategory: string | null;
  industrySpecific: boolean;
  requiresModule: string | null;
  effectiveValue: string | null;
  effectiveLevel: ControlRoomLevel;
  levelValues: Record<string, { value: string; setBy?: string; setAt?: string }>;
}

/** Backend returns Record<category, rule[]> */
export type ControlRoomGroupedResponse = Record<string, ControlRoomRule[]>;

export interface ControlRoomAuditEntry {
  id: string;
  ruleCode: string;
  ruleId: string;
  level: string;
  previousValue: string | null;
  newValue: string;
  pageCode: string | null;
  roleId: string | null;
  userId: string | null;
  changedByUserId: string;
  changedByUserName: string;
  changeReason: string | null;
  createdAt: string;
}

export interface UpdateRulePayload {
  value: unknown;
  level: ControlRoomLevel;
  pageCode?: string;
  roleId?: string;
  userId?: string;
  changeReason?: string;
}

export interface ResolvedRule {
  value: unknown;
  level: ControlRoomLevel;
  pageOverrides: Record<string, unknown>;
  valueType: ControlRoomValueType;
  label: string;
  category: ControlRoomCategory;
}
