// ── Enums ───────────────────────────────────────────────

export type DocumentCategory =
  | 'GENERAL' | 'PROPOSAL' | 'CONTRACT' | 'INVOICE' | 'QUOTATION'
  | 'REPORT' | 'PRESENTATION' | 'SPREADSHEET' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER';

export type DocumentStatus = 'UPLOADING' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type StorageType = 'LOCAL' | 'S3' | 'CLOUD_LINK';
export type StorageProvider = 'NONE' | 'GOOGLE_DRIVE' | 'ONEDRIVE' | 'DROPBOX';
export type ShareLinkAccess = 'VIEW' | 'DOWNLOAD' | 'EDIT';

// ── List Item ───────────────────────────────────────────

export interface DocumentListItem {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  category: DocumentCategory;
  status: DocumentStatus;
  storageType: StorageType;
  description?: string;
  tags: string[];
  version: number;
  folderId?: string;
  folder?: { id: string; name: string };
  uploadedBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

// ── Detail ──────────────────────────────────────────────

export interface DocumentDetail extends DocumentListItem {
  fileName: string;
  storageUrl?: string;
  thumbnailUrl?: string;
  storageProvider: StorageProvider;
  parentVersionId?: string;
  attachments: DocumentAttachment[];
  shareLinks: DocumentShareLink[];
}

// ── Folder ──────────────────────────────────────────────

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  children?: DocumentFolder[];
  _count?: { documents: number };
}

// ── Share Link ──────────────────────────────────────────

export interface DocumentShareLink {
  id: string;
  token: string;
  access: ShareLinkAccess;
  expiresAt?: string;
  maxViews?: number;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

// ── Attachment ──────────────────────────────────────────

export interface DocumentAttachment {
  id: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

// ── Version ─────────────────────────────────────────────

export interface DocumentVersion {
  id: string;
  version: number;
  originalName: string;
  fileSize: number;
  uploadedBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

// ── Activity ────────────────────────────────────────────

export interface DocumentActivity {
  id: string;
  action: string;
  details?: Record<string, unknown>;
  user: { id: string; firstName: string; lastName: string };
  ipAddress?: string;
  createdAt: string;
}

// ── Stats ───────────────────────────────────────────────

export interface DocumentStats {
  totalDocuments: number;
  totalSizeMB: number;
  byCategory: Record<string, number>;
  byStorageType: Record<string, number>;
}

// ── Form Payloads ───────────────────────────────────────

export interface DocumentUploadData {
  file: File;
  category?: DocumentCategory;
  description?: string;
  tags?: string[];
  folderId?: string;
}

export interface DocumentUpdateData {
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
}

export interface CreateFolderData {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface CreateShareLinkData {
  access: ShareLinkAccess;
  password?: string;
  expiresAt?: string;
  maxViews?: number;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: DocumentCategory;
  storageType?: StorageType;
  folderId?: string;
  uploadedById?: string;
  tags?: string[];
}

export interface LinkCloudData {
  url: string;
  category?: DocumentCategory;
  description?: string;
  folderId?: string;
}
