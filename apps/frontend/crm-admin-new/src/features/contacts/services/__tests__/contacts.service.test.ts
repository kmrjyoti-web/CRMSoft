import apiClient from "@/services/api-client";

import { contactsService } from "../contacts.service";

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

describe("contactsService", () => {
  it("has all service methods", () => {
    expect(contactsService.getAll).toBeDefined();
    expect(contactsService.getById).toBeDefined();
    expect(contactsService.create).toBeDefined();
    expect(contactsService.update).toBeDefined();
    expect(contactsService.deactivate).toBeDefined();
    expect(contactsService.reactivate).toBeDefined();
  });

  it("getAll calls GET /contacts with params", async () => {
    await contactsService.getAll({ page: 1, limit: 10, search: "test" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/contacts", {
      params: { page: 1, limit: 10, search: "test" },
    });
  });

  it("getById calls GET /contacts/:id", async () => {
    await contactsService.getById("abc-123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/contacts/abc-123");
  });

  it("create sends POST /contacts", async () => {
    const payload = { firstName: "John", lastName: "Doe" };
    await contactsService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/contacts", payload);
  });

  it("update sends PUT /contacts/:id (not PATCH)", async () => {
    const payload = { firstName: "Jane" };
    await contactsService.update("abc-123", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/contacts/abc-123", payload);
  });

  it("deactivate sends POST /contacts/:id/deactivate", async () => {
    await contactsService.deactivate("abc-123");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/contacts/abc-123/deactivate");
  });
});
