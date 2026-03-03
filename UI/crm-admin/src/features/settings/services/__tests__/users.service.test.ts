import apiClient from "@/services/api-client";

import { usersService } from "../users.service";

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

describe("usersService", () => {
  it("has all service methods", () => {
    expect(usersService.getAll).toBeDefined();
    expect(usersService.getById).toBeDefined();
    expect(usersService.create).toBeDefined();
    expect(usersService.update).toBeDefined();
    expect(usersService.activate).toBeDefined();
    expect(usersService.deactivate).toBeDefined();
  });

  it("getAll calls GET /users with params", async () => {
    await usersService.getAll({ page: 1, limit: 10, search: "test" });
    expect(apiClient.get).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 10, search: "test" },
    });
  });

  it("getById calls GET /users/:id", async () => {
    await usersService.getById("user-123");
    expect(apiClient.get).toHaveBeenCalledWith("/users/user-123");
  });

  it("create sends POST /users", async () => {
    const payload = {
      email: "test@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      userType: "EMPLOYEE" as const,
      roleId: "role-1",
    };
    await usersService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/users", payload);
  });

  it("update sends PUT /users/:id (not PATCH)", async () => {
    const payload = { firstName: "Jane" };
    await usersService.update("user-123", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/users/user-123", payload);
  });

  it("deactivate sends POST /users/:id/deactivate", async () => {
    await usersService.deactivate("user-123");
    expect(apiClient.post).toHaveBeenCalledWith("/users/user-123/deactivate");
  });
});
