// ── User Enums ───────────────────────────────────────────

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type UserType = "ADMIN" | "EMPLOYEE" | "CUSTOMER" | "REFERRAL_PARTNER";

// ── User ─────────────────────────────────────────────────

export interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  userType: UserType;
  roleId: string;
  departmentId?: string | null;
  designationId?: string | null;
  employeeCode?: string | null;
  lastLoginAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
}

export interface UserListItem extends UserItem {
  role: UserRole;
  department?: { id: string; name: string; displayName: string } | null;
  designation?: { id: string; name: string; code: string } | null;
}

export interface UserDetail extends UserItem {
  role: UserRole;
  department?: { id: string; name: string; displayName: string } | null;
  designation?: { id: string; name: string; code: string } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface UserCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: UserType;
  roleId: string;
  departmentId?: string;
  designationId?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  departmentId?: string;
  designationId?: string;
  status?: UserStatus;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: UserStatus;
  userType?: UserType;
  roleId?: string;
  [key: string]: unknown;
}

// ── Role ─────────────────────────────────────────────────

export interface RoleItem {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleListItem extends RoleItem {
  _count?: {
    users: number;
  };
}

export interface RoleDetail extends RoleItem {
  permissions: PermissionItem[];
  _count?: {
    users: number;
  };
}

export interface RoleCreateData {
  name: string;
  displayName: string;
  description?: string;
  permissionIds?: string[];
}

export interface RoleUpdateData {
  displayName?: string;
  description?: string;
  permissionIds?: string[];
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ── Permission ───────────────────────────────────────────

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  description?: string | null;
}

// ── Menu Admin ──────────────────────────────────────────

export type MenuType = "GROUP" | "ITEM" | "DIVIDER";

export interface MenuAdminItem {
  id: string;
  name: string;
  code?: string | null;
  icon?: string | null;
  route?: string | null;
  parentId?: string | null;
  sortOrder: number;
  menuType: MenuType;
  permissionModule?: string | null;
  permissionAction?: string | null;
  badgeColor?: string | null;
  badgeText?: string | null;
  openInNewTab?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MenuAdminItem[];
}

export interface MenuCreateData {
  name: string;
  code?: string;
  icon?: string;
  route?: string;
  parentId?: string;
  sortOrder?: number;
  menuType: MenuType;
  permissionModule?: string;
  permissionAction?: string;
  badgeColor?: string;
  badgeText?: string;
  openInNewTab?: boolean;
}

export interface MenuUpdateData {
  name?: string;
  code?: string;
  icon?: string;
  route?: string;
  parentId?: string;
  sortOrder?: number;
  menuType?: MenuType;
  permissionModule?: string;
  permissionAction?: string;
  badgeColor?: string;
  badgeText?: string;
  openInNewTab?: boolean;
  isActive?: boolean;
}

export interface MenuReorderData {
  parentId?: string;
  orderedIds: string[];
}
