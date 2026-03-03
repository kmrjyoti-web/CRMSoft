import apiClient from "@/services/api-client";

import { activitiesService } from "../activities.service";

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

describe("activitiesService", () => {
  it("has all service methods", () => {
    expect(activitiesService.getAll).toBeDefined();
    expect(activitiesService.getById).toBeDefined();
    expect(activitiesService.create).toBeDefined();
    expect(activitiesService.update).toBeDefined();
    expect(activitiesService.complete).toBeDefined();
    expect(activitiesService.delete).toBeDefined();
    expect(activitiesService.getByEntity).toBeDefined();
  });

  it("getAll calls GET /activities with params", async () => {
    await activitiesService.getAll({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith("/activities", {
      params: { page: 1, limit: 10 },
    });
  });

  it("getById calls GET /activities/:id", async () => {
    await activitiesService.getById("act-1");
    expect(apiClient.get).toHaveBeenCalledWith("/activities/act-1");
  });

  it("create sends POST /activities", async () => {
    const payload = { type: "CALL", subject: "Test" };
    await activitiesService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/activities", payload);
  });

  it("update sends PUT /activities/:id", async () => {
    const payload = { subject: "Updated" };
    await activitiesService.update("act-1", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/activities/act-1", payload);
  });

  it("complete sends POST /activities/:id/complete", async () => {
    const payload = { outcome: "Success" };
    await activitiesService.complete("act-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/activities/act-1/complete", payload);
  });

  it("delete sends DELETE /activities/:id", async () => {
    await activitiesService.delete("act-1");
    expect(apiClient.delete).toHaveBeenCalledWith("/activities/act-1");
  });
});
