import apiClient from "@/services/api-client";

import { rolesService } from "../roles.service";

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

describe("rolesService", () => {
  it("has all service methods", () => {
    expect(rolesService.getAll).toBeDefined();
    expect(rolesService.getById).toBeDefined();
    expect(rolesService.create).toBeDefined();
    expect(rolesService.update).toBeDefined();
    expect(rolesService.delete).toBeDefined();
  });

  it("getAll calls GET /roles with params", async () => {
    await rolesService.getAll({ page: 1, limit: 10, search: "admin" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/roles", {
      params: { page: 1, limit: 10, search: "admin" },
    });
  });

  it("getById calls GET /roles/:id", async () => {
    await rolesService.getById("role-123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/roles/role-123");
  });

  it("create sends POST /roles", async () => {
    const payload = {
      name: "manager",
      displayName: "Manager",
      description: "Manager role",
    };
    await rolesService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/roles", payload);
  });

  it("update sends PUT /roles/:id (not PATCH)", async () => {
    const payload = { displayName: "Senior Manager" };
    await rolesService.update("role-123", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/roles/role-123", payload);
  });
});
