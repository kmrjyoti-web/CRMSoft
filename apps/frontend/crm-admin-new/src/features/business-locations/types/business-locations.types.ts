export type LocationLevel = 'COUNTRY' | 'STATE' | 'CITY' | 'AREA';
export type LocationType = 'HEAD_OFFICE' | 'BRANCH' | 'WAREHOUSE' | 'FACTORY' | 'STORE' | 'OTHER';

// ─── Company Operating Location Types ────────────────────────────────────────

export type CoverageType = 'ALL_CITIES' | 'SPECIFIC';
export type CityPinCoverageType = 'ALL_PINCODES' | 'SPECIFIC';

export interface CompanyPincode {
  id: string;
  tenantId: string;
  companyCityId: string;
  pincode: string;
  areaName?: string;
  isActive: boolean;
}

export interface CompanyCity {
  id: string;
  tenantId: string;
  companyStateId: string;
  cityName: string;
  district?: string;
  coverageType: CityPinCoverageType;
  isActive: boolean;
  pincodes: CompanyPincode[];
}

export interface CompanyState {
  id: string;
  tenantId: string;
  companyCountryId: string;
  stateName: string;
  stateCode: string;
  gstStateCode?: string;
  coverageType: CoverageType;
  isActive: boolean;
  isHeadquarter: boolean;
  stateGstin?: string;
  cities: CompanyCity[];
}

export interface CompanyCountry {
  id: string;
  tenantId: string;
  countryName: string;
  countryCode: string;
  isoCode3?: string;
  phonecode?: string;
  currency?: string;
  currencySymbol?: string;
  isActive: boolean;
  isPrimary: boolean;
  states: CompanyState[];
}

export interface PackageCountry {
  name: string;
  code: string;
  phonecode?: string;
  currency?: string;
  flag?: string;
}

export interface PackageState {
  name: string;
  code: string;
  countryCode: string;
  gstStateCode?: string;
}

export interface PackageCity {
  name: string;
  stateCode: string;
  countryCode: string;
}

export interface GstStateCode {
  code: string;
  name: string;
  iso: string;
}

export interface LocationSummary {
  countries: number;
  states: number;
  cities: number;
  pincodes: number;
}

export interface CheckAreaResult {
  isInArea: boolean;
  isSameState: boolean;
  gstType: 'INTRA' | 'INTER';
  companyGstStateCode: string | null;
  customerGstStateCode: string | null;
  message: string;
}

// DTOs
export interface AddCountryDto {
  countryCode: string;
  isPrimary?: boolean;
}

export interface StateItemDto {
  stateCode: string;
  coverageType: CoverageType;
  isHeadquarter?: boolean;
  stateGstin?: string;
}

export interface AddStatesDto {
  states: StateItemDto[];
}

export interface CityItemDto {
  cityName: string;
  coverageType: CityPinCoverageType;
  district?: string;
}

export interface AddCitiesDto {
  cities: CityItemDto[];
}

export interface PincodeItemDto {
  pincode: string;
  areaName?: string;
}

export interface AddPincodesDto {
  pincodes: PincodeItemDto[];
}

export interface AddPincodeRangeDto {
  fromPincode: string;
  toPincode: string;
}

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
