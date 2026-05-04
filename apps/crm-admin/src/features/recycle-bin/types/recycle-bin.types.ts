export type RecycleBinEntityType =
  | "contact"
  | "organization"
  | "lead"
  | "activity"
  | "raw_contact"
  | "user";

export interface RecycleBinItem {
  id: string;
  entityType: RecycleBinEntityType;
  name: string;
  subtitle?: string;
  deletedAt: string;
  deletedBy?: string;
}

export interface RecycleBinParams {
  entityType?: string;
  page?: number;
  limit?: number;
}
