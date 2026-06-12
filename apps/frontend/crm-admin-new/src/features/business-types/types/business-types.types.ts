export interface BusinessType {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  industry?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  businessTypeCode: string;
  businessTypeName: string;
  tradeType?: string;
  dealsWith?: string;
  industry?: string;
  terminology: Record<string, string>;
}

export interface TradeProfile {
  tradeType?: string;
  dealsWith?: string;
  industry?: string;
}

export interface TerminologyOverride {
  id: string;
  termKey: string;
  customValue: string;
  defaultValue: string;
  createdAt: string;
}

export interface AssignBusinessTypeDto {
  businessTypeCode: string;
}

export interface UpdateTradeProfileDto {
  tradeType?: string;
  dealsWith?: string;
  industry?: string;
}

export interface UpsertTerminologyDto {
  termKey: string;
  customValue: string;
}

export interface BulkTerminologyDto {
  overrides: UpsertTerminologyDto[];
}
