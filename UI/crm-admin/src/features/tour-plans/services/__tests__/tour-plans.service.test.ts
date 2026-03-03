import apiClient from "@/services/api-client";

import { tourPlansService } from "../tour-plans.service";

jest.mock("@/services/api-client", () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe("tourPlansService", () => {
  it("has all service methods", () => {
    expect(tourPlansService.getAll).toBeDefined();
    expect(tourPlansService.getById).toBeDefined();
    expect(tourPlansService.create).toBeDefined();
    expect(tourPlansService.update).toBeDefined();
    expect(tourPlansService.submit).toBeDefined();
    expect(tourPlansService.approve).toBeDefined();
    expect(tourPlansService.reject).toBeDefined();
    expect(tourPlansService.cancel).toBeDefined();
  });

  it("getAll calls GET /tour-plans with params", async () => {
    await tourPlansService.getAll({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith("/tour-plans", {
      params: { page: 1, limit: 10 },
    });
  });

  it("getById calls GET /tour-plans/:id", async () => {
    await tourPlansService.getById("tp-1");
    expect(apiClient.get).toHaveBeenCalledWith("/tour-plans/tp-1");
  });

  it("create sends POST /tour-plans", async () => {
    const payload = { title: "Plan A", planDate: "2024-01-15", leadId: "lead-1" };
    await tourPlansService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/tour-plans", payload);
  });

  it("update sends PUT /tour-plans/:id", async () => {
    const payload = { title: "Updated Plan" };
    await tourPlansService.update("tp-1", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/tour-plans/tp-1", payload);
  });

  it("submit sends POST /tour-plans/:id/submit", async () => {
    await tourPlansService.submit("tp-1");
    expect(apiClient.post).toHaveBeenCalledWith("/tour-plans/tp-1/submit");
  });

  it("approve sends POST /tour-plans/:id/approve", async () => {
    await tourPlansService.approve("tp-1");
    expect(apiClient.post).toHaveBeenCalledWith("/tour-plans/tp-1/approve");
  });

  it("reject sends POST /tour-plans/:id/reject", async () => {
    const payload = { rejectedReason: "Incomplete" };
    await tourPlansService.reject("tp-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/tour-plans/tp-1/reject", payload);
  });
});
