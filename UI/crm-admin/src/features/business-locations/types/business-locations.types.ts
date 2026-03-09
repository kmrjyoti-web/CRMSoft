export type LocationLevel = 'COUNTRY' | 'STATE' | 'CITY' | 'AREA';
export type LocationType = 'HEAD_OFFICE' | 'BRANCH' | 'WAREHOUSE' | 'FACTORY' | 'STORE' | 'OTHER';

export interface BusinessLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: LocationType;
  level: LocationLevel;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  parentId?: string;
  parentName?: string;
  children?: BusinessLocation[];
  gstNumber?: string;
  isActive: boolean;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
  gstCode?: string;
}

export interface City {
  name: string;
  stateCode: string;
  tier?: string;
}

export interface CreateLocationDto {
  name: string;
  code: string;
  type: LocationType;
  level?: LocationLevel;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  parentId?: string;
  gstNumber?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: LocationLevel;
  parentId?: string;
}

export interface LinkOrganizationDto {
  organizationId: string;
}
