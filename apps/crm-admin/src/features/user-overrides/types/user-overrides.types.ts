// ---------------------------------------------------------------------------
// User Overrides Types
// ---------------------------------------------------------------------------

export interface UserOverride {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  type: "GRANT" | "DENY";
  reason?: string;
  grantedBy?: string;
  grantedByName?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface GrantPermissionDto {
  action: string;
  reason?: string;
}

export interface DenyPermissionDto {
  action: string;
  reason?: string;
}
