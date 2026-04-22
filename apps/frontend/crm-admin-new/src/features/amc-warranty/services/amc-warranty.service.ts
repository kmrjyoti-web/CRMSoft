import { api } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  WarrantyTemplate,
  WarrantyRecord,
  WarrantyClaim,
  AMCPlanTemplate,
  AMCContract,
  AMCSchedule,
  ServiceVisitLog,
} from "../types/amc-warranty.types";

const W = "/api/v1/warranty";
const AMC = "/api/v1/amc";
const SV = "/api/v1/service-visits";

// ── Warranty Templates ──────────────────────────────────────────────────────

export const warrantyTemplateService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<WarrantyTemplate[]>>(`${W}/templates`, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<WarrantyTemplate>>(`${W}/templates/${id}`)
      .then((r) => r.data);
  },
  getByIndustry(code: string) {
    return api
      .get<ApiResponse<WarrantyTemplate[]>>(
        `${W}/templates/by-industry/${code}`,
      )
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<WarrantyTemplate>>(`${W}/templates`, dto)
      .then((r) => r.data);
  },
  update(id: string, dto: any) {
    return api
      .patch<ApiResponse<WarrantyTemplate>>(`${W}/templates/${id}`, dto)
      .then((r) => r.data);
  },
  importTemplate(id: string) {
    return api
      .post<ApiResponse<WarrantyTemplate>>(
        `${W}/templates/${id}/import`,
        {},
      )
      .then((r) => r.data);
  },
};

// ── Warranty Records ────────────────────────────────────────────────────────

export const warrantyRecordService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<WarrantyRecord[]>>(`${W}/records`, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<WarrantyRecord>>(`${W}/records/${id}`)
      .then((r) => r.data);
  },
  getExpiring(days?: number) {
    return api
      .get<ApiResponse<WarrantyRecord[]>>(`${W}/records/expiring`, {
        params: { days },
      })
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<WarrantyRecord>>(`${W}/records`, dto)
      .then((r) => r.data);
  },
  update(id: string, dto: any) {
    return api
      .patch<ApiResponse<WarrantyRecord>>(`${W}/records/${id}`, dto)
      .then((r) => r.data);
  },
  checkBySerial(serialId: string) {
    return api
      .get<ApiResponse<WarrantyRecord>>(`${W}/records/check/${serialId}`)
      .then((r) => r.data);
  },
  extend(id: string, dto: any) {
    return api
      .post<ApiResponse<WarrantyRecord>>(`${W}/records/${id}/extend`, dto)
      .then((r) => r.data);
  },
};

// ── Warranty Claims ─────────────────────────────────────────────────────────

export const warrantyClaimService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<WarrantyClaim[]>>(`${W}/claims`, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<WarrantyClaim>>(`${W}/claims/${id}`)
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<WarrantyClaim>>(`${W}/claims`, dto)
      .then((r) => r.data);
  },
  update(id: string, dto: any) {
    return api
      .patch<ApiResponse<WarrantyClaim>>(`${W}/claims/${id}`, dto)
      .then((r) => r.data);
  },
  reject(id: string, reason: string) {
    return api
      .post<ApiResponse<WarrantyClaim>>(`${W}/claims/${id}/reject`, {
        reason,
      })
      .then((r) => r.data);
  },
};

// ── AMC Plans ───────────────────────────────────────────────────────────────

export const amcPlanService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<AMCPlanTemplate[]>>(`${AMC}/plans`, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<AMCPlanTemplate>>(`${AMC}/plans/${id}`)
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<AMCPlanTemplate>>(`${AMC}/plans`, dto)
      .then((r) => r.data);
  },
  update(id: string, dto: any) {
    return api
      .patch<ApiResponse<AMCPlanTemplate>>(`${AMC}/plans/${id}`, dto)
      .then((r) => r.data);
  },
  importPlan(id: string) {
    return api
      .post<ApiResponse<AMCPlanTemplate>>(`${AMC}/plans/${id}/import`, {})
      .then((r) => r.data);
  },
};

// ── AMC Contracts ───────────────────────────────────────────────────────────

export const amcContractService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<AMCContract[]>>(`${AMC}/contracts`, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<AMCContract>>(`${AMC}/contracts/${id}`)
      .then((r) => r.data);
  },
  getExpiring(days?: number) {
    return api
      .get<ApiResponse<AMCContract[]>>(`${AMC}/contracts/expiring`, {
        params: { days },
      })
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<AMCContract>>(`${AMC}/contracts`, dto)
      .then((r) => r.data);
  },
  activate(id: string) {
    return api
      .post<ApiResponse<AMCContract>>(
        `${AMC}/contracts/${id}/activate`,
        {},
      )
      .then((r) => r.data);
  },
  renew(id: string, dto?: any) {
    return api
      .post<ApiResponse<AMCContract>>(
        `${AMC}/contracts/${id}/renew`,
        dto ?? {},
      )
      .then((r) => r.data);
  },
};

// ── AMC Schedule ─────────────────────────────────────────────────────────────

export const amcScheduleService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<AMCSchedule[]>>(`${AMC}/schedule`, { params })
      .then((r) => r.data);
  },
  complete(id: string, dto: any) {
    return api
      .post<ApiResponse<AMCSchedule>>(
        `${AMC}/schedule/${id}/complete`,
        dto,
      )
      .then((r) => r.data);
  },
  reschedule(id: string, newDate: string) {
    return api
      .post<ApiResponse<AMCSchedule>>(
        `${AMC}/schedule/${id}/reschedule`,
        { newDate },
      )
      .then((r) => r.data);
  },
};

// ── Service Visits ───────────────────────────────────────────────────────────

export const serviceVisitService = {
  getAll(params?: any) {
    return api
      .get<ApiResponse<ServiceVisitLog[]>>(SV, { params })
      .then((r) => r.data);
  },
  getById(id: string) {
    return api
      .get<ApiResponse<ServiceVisitLog>>(`${SV}/${id}`)
      .then((r) => r.data);
  },
  create(dto: any) {
    return api
      .post<ApiResponse<ServiceVisitLog>>(SV, dto)
      .then((r) => r.data);
  },
  update(id: string, dto: any) {
    return api
      .patch<ApiResponse<ServiceVisitLog>>(`${SV}/${id}`, dto)
      .then((r) => r.data);
  },
};
