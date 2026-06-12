export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DEPLOYED' | 'CLOSED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestType = 'FEATURE' | 'BUG' | 'CUSTOMIZATION' | 'SUPPORT';

export interface DevRequest {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  tenantId?: string;
  tenantName?: string;
  moduleName?: string;
  assignee?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DevRequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  type?: RequestType;
  search?: string;
  page?: number;
  limit?: number;
}
