// ── Enums ─────────────────────────────────────────────────

export type TourPlanStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// ── Visit Base ────────────────────────────────────────────

export interface TourPlanVisit {
  id: string;
  tourPlanId: string;
  leadId?: string | null;
  contactId?: string | null;
  sortOrder: number;
  scheduledTime?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkInPhoto?: string | null;
  checkOutPhoto?: string | null;
  distanceFromTarget?: number | null;
  notes?: string | null;
  outcome?: string | null;
  isCompleted: boolean;
}

// ── Visit Relations ───────────────────────────────────────

export interface TourPlanVisitLead {
  id: string;
  leadNumber: string;
  contact: {
    firstName: string;
    lastName: string;
  };
}

export interface TourPlanVisitContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TourPlanVisitListItem extends TourPlanVisit {
  lead?: TourPlanVisitLead | null;
  contact?: TourPlanVisitContact | null;
}

// ── Base ──────────────────────────────────────────────────

export interface TourPlanItem {
  id: string;
  title: string;
  description?: string | null;
  planDate: string;
  status: TourPlanStatus;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkInPhoto?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  leadId: string;
  salesPersonId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ─────────────────────────────────────────────

export interface TourPlanLead {
  id: string;
  leadNumber: string;
}

export interface TourPlanSalesPerson {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TourPlanApprovedBy {
  id: string;
  firstName: string;
  lastName: string;
}

// ── List item (paginated) ────────────────────────────────

export interface TourPlanListItem extends TourPlanItem {
  lead?: TourPlanLead | null;
  salesPerson?: TourPlanSalesPerson | null;
  _count?: {
    visits: number;
  };
}

// ── Detail (single fetch) ────────────────────────────────

export interface TourPlanDetail extends TourPlanItem {
  lead?: TourPlanLead | null;
  salesPerson?: TourPlanSalesPerson | null;
  approvedBy?: TourPlanApprovedBy | null;
  visits?: TourPlanVisitListItem[];
  _count?: {
    visits: number;
  };
}

// ── Mutations ────────────────────────────────────────────

export interface TourPlanVisitCreateData {
  leadId?: string;
  contactId?: string;
  sortOrder: number;
  scheduledTime?: string;
  notes?: string;
}

export interface TourPlanCreateData {
  title: string;
  description?: string;
  planDate: string;
  startLocation?: string;
  endLocation?: string;
  leadId: string;
  salesPersonId?: string;
  visits?: TourPlanVisitCreateData[];
}

export interface TourPlanUpdateData {
  title?: string;
  description?: string;
  planDate?: string;
  startLocation?: string;
  endLocation?: string;
}

export interface TourPlanRejectData {
  rejectedReason: string;
}

export interface VisitCheckInData {
  checkInLat?: number;
  checkInLng?: number;
  checkInPhoto?: string;
}

export interface VisitCheckOutData {
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutPhoto?: string;
  notes?: string;
  outcome?: string;
}

// ── Query params ─────────────────────────────────────────

export interface TourPlanListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: TourPlanStatus;
  salesPersonId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}
