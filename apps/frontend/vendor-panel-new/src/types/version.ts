export type VersionStatus = 'DRAFT' | 'TESTING' | 'STAGED' | 'PUBLISHED' | 'ROLLED_BACK' | 'DEPRECATED';
export type ReleaseType = 'MAJOR' | 'MINOR' | 'PATCH' | 'HOTFIX';
export type PatchStatus = 'PENDING' | 'APPLIED' | 'FAILED' | 'ROLLED_BACK';

export interface ChangelogSection {
  category: string;
  items: string[];
}

export interface AppVersion {
  id: string;
  version: string;
  codeName?: string;
  releaseType: ReleaseType;
  status: VersionStatus;
  changelog: ChangelogSection[];
  breakingChanges: string[];
  migrationNotes?: string;
  modulesUpdated: string[];
  schemaChanges?: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  gitTag?: string;
  gitBranch?: string;
  gitCommitHash?: string;
  deployedAt?: string;
  deployedBy?: string;
  rollbackAt?: string;
  rollbackReason?: string;
  notionPageId?: string;
  _count?: {
    patches: number;
    tenantVersions: number;
    backups: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IndustryPatch {
  id: string;
  versionId: string;
  industryCode: string;
  patchName: string;
  description?: string;
  status: PatchStatus;
  schemaChanges?: Record<string, unknown>;
  seedData?: Record<string, unknown>;
  configOverrides?: Record<string, unknown>;
  menuOverrides?: Record<string, unknown>;
  appliedAt?: string;
  appliedBy?: string;
  errorLog?: string;
  forceUpdate: boolean;
  version?: {
    id: string;
    version: string;
    codeName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VersionBackup {
  id: string;
  versionId: string;
  backupType: string;
  dbDumpPath?: string;
  gitTag?: string;
  configSnapshot?: Record<string, unknown>;
  schemaSnapshot?: string;
  status: string;
  sizeBytes?: number;
  restoredAt?: string;
  restoredBy?: string;
  version?: {
    id: string;
    version: string;
    codeName?: string;
  };
  createdAt: string;
}

export interface VersionStats {
  total: number;
  byStatus: { status: VersionStatus; count: number }[];
  byReleaseType: { releaseType: ReleaseType; count: number }[];
  recentDeployments: {
    id: string;
    version: string;
    codeName?: string;
    deployedAt?: string;
  }[];
}

export interface CreateVersionDto {
  version: string;
  codeName?: string;
  releaseType?: ReleaseType;
  changelog?: ChangelogSection[];
  breakingChanges?: string[];
  migrationNotes?: string;
  modulesUpdated?: string[];
  schemaChanges?: Record<string, unknown>;
  gitBranch?: string;
}

export interface CreatePatchDto {
  industryCode: string;
  patchName: string;
  description?: string;
  schemaChanges?: Record<string, unknown>;
  seedData?: Record<string, unknown>;
  configOverrides?: Record<string, unknown>;
  menuOverrides?: Record<string, unknown>;
  forceUpdate?: boolean;
}

export interface VersionFilters {
  status?: VersionStatus;
  releaseType?: ReleaseType;
  search?: string;
  page?: number;
  limit?: number;
}
