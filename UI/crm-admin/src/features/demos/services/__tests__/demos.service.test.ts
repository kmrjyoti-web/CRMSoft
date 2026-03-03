import apiClient from "@/services/api-client";

import { demosService } from "../demos.service";

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

describe("demosService", () => {
  it("has all service methods", () => {
    expect(demosService.getAll).toBeDefined();
    expect(demosService.getById).toBeDefined();
    expect(demosService.create).toBeDefined();
    expect(demosService.update).toBeDefined();
    expect(demosService.reschedule).toBeDefined();
    expect(demosService.complete).toBeDefined();
    expect(demosService.cancel).toBeDefined();
    expect(demosService.getByLead).toBeDefined();
  });

  it("getAll calls GET /demos with params", async () => {
    await demosService.getAll({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith("/demos", {
      params: { page: 1, limit: 10 },
    });
  });

  it("getById calls GET /demos/:id", async () => {
    await demosService.getById("demo-1");
    expect(apiClient.get).toHaveBeenCalledWith("/demos/demo-1");
  });

  it("create sends POST /demos", async () => {
    const payload = { mode: "ONLINE", scheduledAt: "2024-01-15", leadId: "lead-1" };
    await demosService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/demos", payload);
  });

  it("update sends PUT /demos/:id", async () => {
    const payload = { notes: "Updated" };
    await demosService.update("demo-1", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/demos/demo-1", payload);
  });

  it("reschedule sends POST /demos/:id/reschedule", async () => {
    const payload = { scheduledAt: "2024-02-01", reason: "Conflict" };
    await demosService.reschedule("demo-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/demos/demo-1/reschedule", payload);
  });

  it("complete sends POST /demos/:id/complete", async () => {
    const payload = { result: "INTERESTED", outcome: "Good" };
    await demosService.complete("demo-1", payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/demos/demo-1/complete", payload);
  });

  it("cancel sends POST /demos/:id/cancel", async () => {
    const payload = { cancelReason: "No show" };
    await demosService.cancel("demo-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/demos/demo-1/cancel", payload);
  });
});
