import apiClient from "@/services/api-client";

import { quotationsService } from "../quotations.service";

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

describe("quotationsService", () => {
  it("has all service methods", () => {
    expect(quotationsService.getAll).toBeDefined();
    expect(quotationsService.getById).toBeDefined();
    expect(quotationsService.create).toBeDefined();
    expect(quotationsService.update).toBeDefined();
    expect(quotationsService.cancel).toBeDefined();
    expect(quotationsService.addLineItem).toBeDefined();
    expect(quotationsService.updateLineItem).toBeDefined();
    expect(quotationsService.removeLineItem).toBeDefined();
    expect(quotationsService.recalculate).toBeDefined();
    expect(quotationsService.send).toBeDefined();
    expect(quotationsService.accept).toBeDefined();
    expect(quotationsService.reject).toBeDefined();
    expect(quotationsService.revise).toBeDefined();
    expect(quotationsService.clone).toBeDefined();
  });

  it("getAll calls GET /quotations with params", async () => {
    await quotationsService.getAll({ page: 1, limit: 10, status: "DRAFT" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/quotations", {
      params: { page: 1, limit: 10, status: "DRAFT" },
    });
  });

  it("getById calls GET /quotations/:id", async () => {
    await quotationsService.getById("q-1");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/quotations/q-1");
  });

  it("create sends POST /quotations", async () => {
    const payload = { leadId: "lead-1", title: "Test Quotation" };
    await quotationsService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations", payload);
  });

  it("update sends PUT /quotations/:id", async () => {
    const payload = { title: "Updated" };
    await quotationsService.update("q-1", payload);
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/quotations/q-1", payload);
  });

  it("cancel sends DELETE /quotations/:id", async () => {
    await quotationsService.cancel("q-1");
    expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/quotations/q-1");
  });

  it("addLineItem sends POST /quotations/:id/items", async () => {
    const payload = { productName: "Widget", quantity: 5, unitPrice: 100 };
    await quotationsService.addLineItem("q-1", payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations/q-1/items", payload);
  });

  it("send sends POST /quotations/:id/send", async () => {
    const payload = { channel: "EMAIL" as const, receiverEmail: "test@test.com" };
    await quotationsService.send("q-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations/q-1/send", payload);
  });

  it("accept sends POST /quotations/:id/accept", async () => {
    const payload = { acceptedNote: "Looks good" };
    await quotationsService.accept("q-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations/q-1/accept", payload);
  });

  it("reject sends POST /quotations/:id/reject", async () => {
    const payload = { rejectedReason: "Too expensive" };
    await quotationsService.reject("q-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations/q-1/reject", payload);
  });

  it("revise sends POST /quotations/:id/revise", async () => {
    await quotationsService.revise("q-1");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/quotations/q-1/revise");
  });
});
