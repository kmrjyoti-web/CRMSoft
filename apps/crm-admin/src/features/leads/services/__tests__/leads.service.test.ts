import apiClient from "@/services/api-client";

import { leadsService } from "../leads.service";

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

describe("leadsService", () => {
  it("has all service methods", () => {
    expect(leadsService.getAll).toBeDefined();
    expect(leadsService.getById).toBeDefined();
    expect(leadsService.create).toBeDefined();
    expect(leadsService.update).toBeDefined();
    expect(leadsService.changeStatus).toBeDefined();
    expect(leadsService.allocate).toBeDefined();
  });

  it("getAll calls GET /leads with params", async () => {
    await leadsService.getAll({ page: 1, limit: 10, search: "test" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/leads", {
      params: { page: 1, limit: 10, search: "test" },
    });
  });

  it("getById calls GET /leads/:id", async () => {
    await leadsService.getById("lead-123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/leads/lead-123");
  });

  it("create sends POST /leads", async () => {
    const payload = { contactId: "c-1" };
    await leadsService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/leads", payload);
  });

  it("update sends PUT /leads/:id (not PATCH)", async () => {
    const payload = { priority: "HIGH" as const };
    await leadsService.update("lead-123", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/leads/lead-123", payload);
  });

  it("changeStatus sends POST /leads/:id/status", async () => {
    await leadsService.changeStatus("lead-123", { status: "VERIFIED" });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/leads/lead-123/status", {
      status: "VERIFIED",
    });
  });
});
