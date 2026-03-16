import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  EntityOwner,
  OwnershipLog,
  DelegationRecord,
  UserCapacity,
  AssignmentRule,
  WorkloadDashboard,
  RebalanceSuggestion,
  AssignOwnerDto,
  TransferOwnerDto,
  DelegateOwnershipDto,
  BulkAssignDto,
  UpdateCapacityDto,
  EntityType,
} from "../types/ownership.types";

const BASE = "/api/v1/ownership";

// ── Assignment ──────────────────────────────────────────

export function assignOwner(dto: AssignOwnerDto) {
  return apiClient.post<ApiResponse<EntityOwner>>(`${BASE}/assign`, dto).then((r) => r.data);
}

export function transferOwner(dto: TransferOwnerDto) {
  return apiClient.post<ApiResponse<EntityOwner>>(`${BASE}/transfer`, dto).then((r) => r.data);
}

export function revokeOwner(entityType: EntityType, entityId: string, userId: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/revoke`, { entityType, entityId, userId }).then((r) => r.data);
}

export function bulkAssign(dto: BulkAssignDto) {
  return apiClient.post<ApiResponse<{ assigned: number }>>(`${BASE}/bulk-assign`, dto).then((r) => r.data);
}

export function bulkTransfer(dto: { entityType: EntityType; entityIds: string[]; fromUserId: string; toUserId: string; reason?: string }) {
  return apiClient.post<ApiResponse<{ transferred: number }>>(`${BASE}/bulk-transfer`, dto).then((r) => r.data);
}

// ── Delegation ──────────────────────────────────────────

export function delegateOwnership(dto: DelegateOwnershipDto) {
  return apiClient.post<ApiResponse<DelegationRecord>>(`${BASE}/delegate`, dto).then((r) => r.data);
}

export function revertDelegation(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/revert-delegation/${id}`).then((r) => r.data);
}

export function getDelegationStatus() {
  return apiClient.get<ApiResponse<DelegationRecord[]>>(`${BASE}/delegation-status`).then((r) => r.data);
}

// ── Queries ─────────────────────────────────────────────

export function getEntityOwners(entityType: EntityType, entityId: string) {
  return apiClient.get<ApiResponse<EntityOwner[]>>(`${BASE}/entity/${entityType}/${entityId}`).then((r) => r.data);
}

export function getUserEntities(userId: string) {
  return apiClient.get<ApiResponse<EntityOwner[]>>(`${BASE}/user/${userId}`).then((r) => r.data);
}

export function getMyEntities() {
  return apiClient.get<ApiResponse<EntityOwner[]>>(`${BASE}/my-entities`).then((r) => r.data);
}

export function getOwnershipHistory(entityType: EntityType, entityId: string) {
  return apiClient.get<ApiResponse<OwnershipLog[]>>(`${BASE}/history/${entityType}/${entityId}`).then((r) => r.data);
}

export function getUnassignedEntities(params?: { entityType?: EntityType; page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<Record<string, unknown>[]>>(`${BASE}/unassigned`, { params }).then((r) => r.data);
}

export function getOwnershipStats() {
  return apiClient.get<ApiResponse<Record<string, unknown>>>(`${BASE}/stats`).then((r) => r.data);
}

export function getRecentChanges() {
  return apiClient.get<ApiResponse<OwnershipLog[]>>(`${BASE}/recent-changes`).then((r) => r.data);
}

export function getReassignmentPreview(fromUserId: string) {
  return apiClient.get<ApiResponse<Record<string, unknown>>>(`${BASE}/reassignment-preview/${fromUserId}`).then((r) => r.data);
}

// ── Assignment Rules ────────────────────────────────────

export function listAssignmentRules() {
  return apiClient.get<ApiResponse<AssignmentRule[]>>(`${BASE}/rules`).then((r) => r.data);
}

export function getAssignmentRule(id: string) {
  return apiClient.get<ApiResponse<AssignmentRule>>(`${BASE}/rules/${id}`).then((r) => r.data);
}

export function createAssignmentRule(dto: Partial<AssignmentRule>) {
  return apiClient.post<ApiResponse<AssignmentRule>>(`${BASE}/rules`, dto).then((r) => r.data);
}

export function updateAssignmentRule(id: string, dto: Partial<AssignmentRule>) {
  return apiClient.put<ApiResponse<AssignmentRule>>(`${BASE}/rules/${id}`, dto).then((r) => r.data);
}

export function deleteAssignmentRule(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/rules/${id}`).then((r) => r.data);
}

export function testAssignmentRule(id: string) {
  return apiClient.post<ApiResponse<Record<string, unknown>>>(`${BASE}/rules/${id}/test`).then((r) => r.data);
}

export function triggerAutoAssign() {
  return apiClient.post<ApiResponse<{ assigned: number }>>(`${BASE}/rules/auto-assign`).then((r) => r.data);
}

// ── Workload ────────────────────────────────────────────

export function getWorkloadDashboard() {
  return apiClient.get<ApiResponse<WorkloadDashboard>>(`${BASE}/workload/dashboard`).then((r) => r.data);
}

export function getUserWorkload(userId: string) {
  return apiClient.get<ApiResponse<UserCapacity>>(`${BASE}/workload/user/${userId}`).then((r) => r.data);
}

export function updateUserCapacity(userId: string, dto: UpdateCapacityDto) {
  return apiClient.put<ApiResponse<UserCapacity>>(`${BASE}/workload/capacity/${userId}`, dto).then((r) => r.data);
}

export function setUserAvailability(dto: { userId: string; isAvailable: boolean; unavailableFrom?: string; unavailableTo?: string; delegateToId?: string }) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/workload/availability`, dto).then((r) => r.data);
}

export function getRebalanceSuggestions() {
  return apiClient.get<ApiResponse<RebalanceSuggestion[]>>(`${BASE}/workload/rebalance-suggestions`).then((r) => r.data);
}
