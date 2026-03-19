// ── Warranty Template ───────────────────────────────────────────────────────

export interface WarrantyTemplate {
  id: string;
  tenantId: string | null;
  name: string;
  code: string;
  description?: string;
  applicationType: string;
  productId?: string;
  categoryId?: string;
  durationValue: number;
  durationType: "DAYS" | "MONTHS" | "YEARS";
  startFrom: string;
  coverageType: "FULL" | "LIMITED" | "EXTENDED" | "MANUFACTURING_DEFECT_ONLY";
  inclusions: string[];
  exclusions: string[];
  supportChannels: string[];
  locationType?: string;
  maxClaims?: number;
  maxClaimsPeriod?: string;
  serviceCharge: number;
  laborChargeType: "FREE" | "FIXED" | "PER_HOUR";
  laborChargeAmount?: number;
  partsChargeType: "FREE" | "AT_COST" | "MRP" | "COST_PLUS_PERCENT";
  partsChargeMarkup?: number;
  responseTimeSlaHours?: number;
  resolutionSlaDays?: number;
  isTransferable: boolean;
  extensionAvailable: boolean;
  extensionPrice?: number;
  extensionDuration?: number;
  extensionDurationType?: string;
  industryCode?: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
}

// ── Warranty Record ─────────────────────────────────────────────────────────

export type WarrantyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CLAIMED"
  | "VOIDED"
  | "EXTENDED";

export interface WarrantyRecord {
  id: string;
  tenantId: string;
  warrantyTemplateId: string;
  warrantyNumber: string;
  customerId: string;
  customerType: string;
  customerName?: string;
  productId: string;
  productName?: string;
  serialMasterId?: string;
  invoiceId?: string;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  claimsUsed: number;
  extendedUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  template?: WarrantyTemplate;
  claims?: WarrantyClaim[];
  _count?: { claims: number };
}

// ── Warranty Claim ──────────────────────────────────────────────────────────

export type ClaimStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export interface WarrantyClaim {
  id: string;
  tenantId: string;
  warrantyRecordId: string;
  claimNumber: string;
  issueDescription: string;
  issueCategory?: string;
  status: ClaimStatus;
  assignedToId?: string;
  assignedToName?: string;
  visitType?: string;
  visitDate?: string;
  resolvedDate?: string;
  partsUsed?: Record<string, unknown>[];
  laborHours?: number;
  isCovered: boolean;
  chargeAmount?: number;
  rejectionReason?: string;
  technicianNotes?: string;
  customerFeedback?: string;
  satisfactionRating?: number;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  warrantyRecord?: WarrantyRecord;
}

// ── AMC Plan Template ───────────────────────────────────────────────────────

export type PlanTier =
  | "BASIC"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "CUSTOM";

export interface AMCPlanTemplate {
  id: string;
  tenantId: string | null;
  name: string;
  code: string;
  planTier: PlanTier;
  description?: string;
  durationValue: number;
  durationType: string;
  charges: number;
  billingCycle: string;
  freeVisits: number;
  freeOnlineSupport: number;
  freeCallSupport: number;
  visitScheduleType?: string;
  visitScheduleValue?: number;
  afterFreeVisitCharge?: number;
  afterFreeCallCharge?: number;
  afterFreeOnlineCharge?: number;
  partsIncluded: string[];
  partsExcluded: string[];
  excludedPartsChargeType?: string;
  partsChargeMarkup?: number;
  slaResponseHours?: number;
  slaResolutionDays?: number;
  penaltyPerDay?: number;
  renewalDiscount?: number;
  gracePeriodDays?: number;
  autoRenew: boolean;
  industryCode?: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { contracts: number };
}

// ── AMC Contract ────────────────────────────────────────────────────────────

export type ContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "RENEWED";

export interface AMCContract {
  id: string;
  tenantId: string;
  amcPlanId: string;
  contractNumber: string;
  customerId: string;
  customerType: string;
  customerName?: string;
  productIds: string[];
  serialIds: string[];
  startDate: string;
  endDate: string;
  status: ContractStatus;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  billingCycle: string;
  nextBillingDate?: string;
  freeVisitsUsed: number;
  freeVisitsTotal: number;
  freeCallsUsed: number;
  freeCallsTotal: number;
  freeOnlineUsed: number;
  freeOnlineTotal: number;
  renewedFromId?: string;
  autoRenew: boolean;
  renewalReminderSent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  plan?: AMCPlanTemplate;
  schedules?: AMCSchedule[];
  _count?: { schedules: number };
}

// ── AMC Schedule ────────────────────────────────────────────────────────────

export type ScheduleStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MISSED"
  | "RESCHEDULED"
  | "CANCELLED";

export interface AMCSchedule {
  id: string;
  tenantId: string;
  amcContractId: string;
  scheduleDate: string;
  scheduleType: string;
  status: ScheduleStatus;
  assignedToId?: string;
  assignedToName?: string;
  completedDate?: string;
  serviceNotes?: string;
  partsUsed?: Record<string, unknown>[];
  customerSignature?: string;
  nextScheduleDate?: string;
  usageAtVisit?: number;
  createdAt: string;
  updatedAt: string;
  contract?: AMCContract;
}

// ── Service Visit ────────────────────────────────────────────────────────────

export type VisitStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type VisitSourceType =
  | "WARRANTY_CLAIM"
  | "AMC_SCHEDULE"
  | "AMC_ON_DEMAND"
  | "PAID_SERVICE";

export interface ServiceVisitLog {
  id: string;
  tenantId: string;
  visitNumber: string;
  sourceType: VisitSourceType;
  sourceId?: string;
  customerId: string;
  customerName?: string;
  technicianId?: string;
  technicianName?: string;
  visitDate: string;
  startTime?: string;
  endTime?: string;
  visitType: string;
  issueReported?: string;
  workDone?: string;
  partsUsed?: Record<string, unknown>[];
  isBillable: boolean;
  chargeAmount?: number;
  status: VisitStatus;
  customerFeedback?: string;
  rating?: number;
  photos?: string[];
  signature?: string;
  createdAt: string;
  updatedAt: string;
  charges?: ServiceCharge[];
}

export interface ServiceCharge {
  id: string;
  chargeType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isCoveredByWarranty: boolean;
  isCoveredByAMC: boolean;
}

// ── Filters ─────────────────────────────────────────────────────────────────

export interface WarrantyFilters {
  status?: string;
  customerId?: string;
  productId?: string;
}

export interface AMCFilters {
  status?: string;
  customerId?: string;
  industryCode?: string;
  planTier?: string;
}
