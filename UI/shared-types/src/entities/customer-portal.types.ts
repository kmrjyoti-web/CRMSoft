/**
 * Customer Portal types — CustomerUser, MenuCategory, and supporting interfaces.
 */

export interface CustomerUser {
  id: string;
  tenantId: string;
  email: string;
  phone?: string | null;
  linkedEntityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';
  linkedEntityId: string;
  linkedEntityName: string;
  displayName: string;
  companyName?: string | null;
  gstin?: string | null;
  menuCategoryId?: string | null;
  menuCategory?: CustomerMenuCategory | null;
  pageOverrides: Record<string, boolean>;
  isActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt?: string | null;
  loginCount: number;
  failedAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMenuCategory {
  id: string;
  tenantId: string;
  name: string;
  nameHi?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  enabledRoutes: string[];
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Injected by API: count of users assigned to this category */
  _count?: { users: number };
}

export interface PortalRoute {
  key: string;
  label: string;
  icon: string;
  path: string;
}

export interface EligibleEntity {
  id: string;
  type: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';
  name: string;
  activated: boolean;
}

export interface PortalAnalytics {
  total: number;
  active: number;
  inactive: number;
  loginsToday: number;
  recentLogs: PortalLog[];
}

export interface PortalLog {
  id: string;
  tenantId: string;
  customerUserId: string;
  action: string;
  route?: string | null;
  createdAt: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface ActivatePortalDto {
  linkedEntityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';
  linkedEntityId: string;
  linkedEntityName: string;
  email: string;
  displayName?: string;
  menuCategoryId?: string;
}

export interface CreateMenuCategoryDto {
  name: string;
  nameHi?: string;
  description?: string;
  icon?: string;
  color?: string;
  enabledRoutes?: string[];
  isDefault?: boolean;
}

export interface UpdateMenuCategoryDto extends Partial<CreateMenuCategoryDto> {
  isActive?: boolean;
}

export interface UpdatePortalUserDto {
  menuCategoryId?: string | null;
  pageOverrides?: Record<string, boolean>;
  isActive?: boolean;
}
