import apiClient from "@/services/api-client";

import { organizationsService } from "../organizations.service";

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

describe("organizationsService", () => {
  it("has all service methods", () => {
    expect(organizationsService.getAll).toBeDefined();
    expect(organizationsService.getById).toBeDefined();
    expect(organizationsService.create).toBeDefined();
    expect(organizationsService.update).toBeDefined();
    expect(organizationsService.deactivate).toBeDefined();
    expect(organizationsService.reactivate).toBeDefined();
  });

  it("getAll calls GET /organizations with params", async () => {
    await organizationsService.getAll({ page: 1, limit: 10, search: "test" });
    expect(apiClient.get).toHaveBeenCalledWith("/organizations", {
      params: { page: 1, limit: 10, search: "test" },
    });
  });

  it("getById calls GET /organizations/:id", async () => {
    await organizationsService.getById("org-123");
    expect(apiClient.get).toHaveBeenCalledWith("/organizations/org-123");
  });

  it("create sends POST /organizations", async () => {
    const payload = { name: "Acme Corp" };
    await organizationsService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/organizations", payload);
  });

  it("update sends PUT /organizations/:id (not PATCH)", async () => {
    const payload = { name: "Acme Inc" };
    await organizationsService.update("org-123", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/organizations/org-123", payload);
  });

  it("deactivate sends POST /organizations/:id/deactivate", async () => {
    await organizationsService.deactivate("org-123");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/organizations/org-123/deactivate",
    );
  });
});
