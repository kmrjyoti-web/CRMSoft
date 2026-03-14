export type PageType = 'LIST' | 'CREATE' | 'DETAIL' | 'EDIT' | 'DASHBOARD' | 'SETTINGS' | 'REPORT' | 'WIZARD';

export interface PageRegistryItem {
  id: string;
  routePath: string;
  routePattern: string;
  portal: string;
  filePath: string;
  componentName: string | null;
  friendlyName: string | null;
  description: string | null;
  pageType: PageType | null;
  category: string | null;
  moduleCode: string | null;
  menuKey: string | null;
  menuLabel: string | null;
  menuIcon: string | null;
  menuParentKey: string | null;
  menuSortOrder: number;
  showInMenu: boolean;
  hasParams: boolean;
  paramNames: string[];
  isNested: boolean;
  parentRoute: string | null;
  featuresCovered: string[];
  apiEndpoints: string[];
  screenshotUrl: string | null;
  previewUrl: string | null;
  isActive: boolean;
  industryCode?: string | null;
  isAutoDiscovered: boolean;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageRegistryStats {
  total: number;
  unassigned: number;
  byPortal: { portal: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byPageType: { pageType: string; count: number }[];
  byModule: { moduleCode: string; count: number }[];
}

export interface PageFilters {
  portal?: string;
  category?: string;
  pageType?: string;
  moduleCode?: string;
  search?: string;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface UpdatePageDto {
  friendlyName?: string;
  description?: string;
  pageType?: string;
  category?: string;
  moduleCode?: string | null;
  industryCode?: string | null;
  menuIcon?: string;
  menuLabel?: string;
  menuParentKey?: string;
  menuSortOrder?: number;
  showInMenu?: boolean;
  featuresCovered?: string[];
  apiEndpoints?: string[];
  isActive?: boolean;
}

export interface AssignPageDto {
  moduleCode: string;
  friendlyName?: string;
  menuIcon?: string;
  menuLabel?: string;
  menuParentKey?: string;
  menuSortOrder?: number;
  showInMenu?: boolean;
}

export interface BulkAssignDto {
  pageIds: string[];
  moduleCode: string;
}

export interface ScanResult {
  total: number;
  created: number;
  updated: number;
}

export interface MenuSyncResult {
  synced: number;
  tenants: number;
}
