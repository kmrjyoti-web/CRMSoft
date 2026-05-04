// ── Enums ────────────────────────────────────────────────

export type ExportFormat = "CSV" | "XLSX" | "PDF";
export type ExportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// ── Entities ─────────────────────────────────────────────

export interface ExportJob {
  id: string;
  targetEntity: string;
  format: ExportFormat;
  filters?: Record<string, unknown>;
  columns?: string[];
  status: ExportStatus;
  totalRows: number;
  processedRows: number;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: string;
  errorMessage?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  completedAt?: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateExportDto {
  targetEntity: string;
  format?: ExportFormat;
  filters?: Record<string, unknown>;
  columns?: string[];
}
