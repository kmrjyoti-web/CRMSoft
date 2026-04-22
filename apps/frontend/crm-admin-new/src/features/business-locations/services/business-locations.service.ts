import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  BusinessLocation, Country, State, City, CreateLocationDto, LocationFilters, LinkOrganizationDto,
  CompanyCountry, CompanyState, CompanyCity, CompanyPincode, LocationSummary,
  AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto, AddPincodeRangeDto,
  PackageCountry, PackageState, PackageCity, GstStateCode, CheckAreaResult,
} from "../types/business-locations.types";

const BASE = "/api/v1/business-locations";

export function listLocations(params?: LocationFilters) {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(BASE, { params }).then((r) => r.data);
}

export function getLocationTree() {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(`${BASE}/tree`).then((r) => r.data);
}

export function getLocation(id: string) {
  return apiClient.get<ApiResponse<BusinessLocation>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getChildren(id: string) {
  return apiClient.get<ApiResponse<BusinessLocation[]>>(`${BASE}/${id}/children`).then((r) => r.data);
}

export function createLocation(dto: CreateLocationDto) {
  return apiClient.post<ApiResponse<BusinessLocation>>(BASE, dto).then((r) => r.data);
}

export function updateLocation(id: string, dto: Partial<CreateLocationDto>) {
  return apiClient.put<ApiResponse<BusinessLocation>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteLocation(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getCountries() {
  return apiClient.get<ApiResponse<Country[]>>(`${BASE}/countries`).then((r) => r.data);
}

export function linkOrganization(id: string, dto: LinkOrganizationDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/organizations`, dto).then((r) => r.data);
}

export function unlinkOrganization(id: string, orgId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}/organizations/${orgId}`).then((r) => r.data);
}

// ─── Company Operating Locations ─────────────────────────────────────────────

const CLOC = "/api/v1/settings/locations";

export function getCompanyLocationTree() {
  return apiClient.get<ApiResponse<CompanyCountry[]>>(`${CLOC}/tree`).then((r) => r.data);
}

export function getLocationSummary() {
  return apiClient.get<ApiResponse<LocationSummary>>(`${CLOC}/summary`).then((r) => r.data);
}

// Package lookups
export function getPackageCountries() {
  return apiClient.get<ApiResponse<PackageCountry[]>>(`${CLOC}/package/countries`).then((r) => r.data);
}

export function getPackageStates(countryCode: string) {
  return apiClient.get<ApiResponse<PackageState[]>>(`${CLOC}/package/states/${countryCode}`).then((r) => r.data);
}

export function getPackageCities(countryCode: string, stateCode: string) {
  return apiClient.get<ApiResponse<PackageCity[]>>(`${CLOC}/package/cities/${countryCode}/${stateCode}`).then((r) => r.data);
}

export function getGstStateCodes() {
  return apiClient.get<ApiResponse<GstStateCode[]>>(`${CLOC}/package/gst-codes`).then((r) => r.data);
}

// Check area
export function checkOperatingArea(customerPincode: string, customerStateCode: string) {
  return apiClient.post<ApiResponse<CheckAreaResult>>(`${CLOC}/check-area`, { customerPincode, customerStateCode }).then((r) => r.data);
}

// Country
export function addCompanyCountry(dto: AddCountryDto) {
  return apiClient.post<ApiResponse<CompanyCountry>>(`${CLOC}/countries`, dto).then((r) => r.data);
}

export function removeCompanyCountry(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${CLOC}/countries/${id}`).then((r) => r.data);
}

// State
export function addCompanyStates(countryId: string, dto: AddStatesDto) {
  return apiClient.post<ApiResponse<CompanyState[]>>(`${CLOC}/countries/${countryId}/states`, dto).then((r) => r.data);
}

export function updateCompanyState(id: string, data: Partial<{ coverageType: string; isHeadquarter: boolean; stateGstin: string }>) {
  return apiClient.patch<ApiResponse<void>>(`${CLOC}/states/${id}`, data).then((r) => r.data);
}

export function removeCompanyState(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${CLOC}/states/${id}`).then((r) => r.data);
}

// City
export function addCompanyCities(stateId: string, dto: AddCitiesDto) {
  return apiClient.post<ApiResponse<CompanyCity[]>>(`${CLOC}/states/${stateId}/cities`, dto).then((r) => r.data);
}

export function updateCompanyCity(id: string, data: Partial<{ coverageType: string; district: string }>) {
  return apiClient.patch<ApiResponse<void>>(`${CLOC}/cities/${id}`, data).then((r) => r.data);
}

export function removeCompanyCity(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${CLOC}/cities/${id}`).then((r) => r.data);
}

// Pincode
export function addCompanyPincodes(cityId: string, dto: AddPincodesDto) {
  return apiClient.post<ApiResponse<CompanyPincode[]>>(`${CLOC}/cities/${cityId}/pincodes`, dto).then((r) => r.data);
}

export function addCompanyPincodeRange(cityId: string, dto: AddPincodeRangeDto) {
  return apiClient.post<ApiResponse<{ added: number }>>(`${CLOC}/cities/${cityId}/pincodes/range`, dto).then((r) => r.data);
}

export function removeCompanyPincode(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${CLOC}/pincodes/${id}`).then((r) => r.data);
}
