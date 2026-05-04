import apiClient from "@/services/api-client";

import { rawContactsService } from "../raw-contacts.service";

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

describe("rawContactsService", () => {
  it("has all service methods", () => {
    expect(rawContactsService.getAll).toBeDefined();
    expect(rawContactsService.getById).toBeDefined();
    expect(rawContactsService.create).toBeDefined();
    expect(rawContactsService.update).toBeDefined();
    expect(rawContactsService.verify).toBeDefined();
    expect(rawContactsService.reject).toBeDefined();
    expect(rawContactsService.markDuplicate).toBeDefined();
    expect(rawContactsService.reopen).toBeDefined();
  });

  it("getAll calls GET /api/v1/raw-contacts with params", async () => {
    await rawContactsService.getAll({ page: 1, limit: 10, status: "RAW" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/raw-contacts", {
      params: { page: 1, limit: 10, status: "RAW" },
    });
  });

  it("getById calls GET /api/v1/raw-contacts/:id", async () => {
    await rawContactsService.getById("abc-123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/raw-contacts/abc-123");
  });

  it("create sends POST /api/v1/raw-contacts", async () => {
    const payload = { firstName: "John", lastName: "Doe" };
    await rawContactsService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/raw-contacts", payload);
  });

  it("verify sends POST /api/v1/raw-contacts/:id/verify", async () => {
    await rawContactsService.verify("abc-123", { organizationId: "org-1" });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/raw-contacts/abc-123/verify", {
      organizationId: "org-1",
    });
  });

  it("reject sends POST /api/v1/raw-contacts/:id/reject", async () => {
    await rawContactsService.reject("abc-123", { reason: "Spam" });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/raw-contacts/abc-123/reject", {
      reason: "Spam",
    });
  });

  it("markDuplicate sends POST /api/v1/raw-contacts/:id/mark-duplicate", async () => {
    await rawContactsService.markDuplicate("abc-123");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/raw-contacts/abc-123/mark-duplicate");
  });
});
