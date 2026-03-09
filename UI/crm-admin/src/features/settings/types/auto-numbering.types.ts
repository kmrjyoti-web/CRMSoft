// ── Reset Policy ────────────────────────────────────────

export type SequenceResetPolicy = "NEVER" | "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

// ── Auto Number Sequence ────────────────────────────────

export interface AutoNumberSequence {
  id: string;
  tenantId: string;
  entityName: string;
  prefix: string;
  formatPattern: string;
  currentSequence: number;
  seqPadding: number;
  startFrom: number;
  incrementBy: number;
  resetPolicy: SequenceResetPolicy;
  lastResetAt?: string | null;
  lastResetSequence?: number | null;
  sampleNumber?: string | null;
  isActive: boolean;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Update DTO ──────────────────────────────────────────

export interface UpdateAutoNumberData {
  prefix?: string;
  formatPattern?: string;
  seqPadding?: number;
  startFrom?: number;
  incrementBy?: number;
  resetPolicy?: SequenceResetPolicy;
}

// ── Reset DTO ───────────────────────────────────────────

export interface ResetSequenceData {
  newStart?: number;
}
