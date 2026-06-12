export interface CustomerPriceGroup {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  discountPercent?: number;
  priceListId?: string;
  priceListName?: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceGroupMember {
  id: string;
  groupId: string;
  memberType: 'CONTACT' | 'ORGANIZATION';
  memberId: string;
  memberName: string;
  memberEmail?: string;
  addedAt: string;
  addedBy: string;
}

export interface CreatePriceGroupDto {
  name: string;
  code: string;
  description?: string;
  discountPercent?: number;
  priceListId?: string;
}

export interface AddMembersDto {
  memberType: 'CONTACT' | 'ORGANIZATION';
  memberIds: string[];
}

export interface PriceGroupFilters {
  page?: number;
  limit?: number;
  search?: string;
}
