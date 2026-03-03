import apiClient from "@/services/api-client";

import { invoiceService, paymentService, creditNoteService, refundService } from "../finance.service";

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

describe("invoiceService", () => {
  it("has all service methods", () => {
    expect(invoiceService.getAll).toBeDefined();
    expect(invoiceService.getById).toBeDefined();
    expect(invoiceService.create).toBeDefined();
    expect(invoiceService.update).toBeDefined();
    expect(invoiceService.generate).toBeDefined();
    expect(invoiceService.send).toBeDefined();
    expect(invoiceService.cancel).toBeDefined();
  });

  it("getAll calls GET /invoices with params", async () => {
    await invoiceService.getAll({ page: 1, limit: 10, status: "DRAFT" });
    expect(apiClient.get).toHaveBeenCalledWith("/invoices", {
      params: { page: 1, limit: 10, status: "DRAFT" },
    });
  });

  it("getById calls GET /invoices/:id", async () => {
    await invoiceService.getById("inv-1");
    expect(apiClient.get).toHaveBeenCalledWith("/invoices/inv-1");
  });

  it("create sends POST /invoices", async () => {
    const payload = { billingName: "Test", dueDate: "2024-02-01", lineItems: [] };
    await invoiceService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/invoices", payload);
  });

  it("generate sends POST /invoices/generate", async () => {
    const payload = { quotationId: "q-1", dueDate: "2024-02-01" };
    await invoiceService.generate(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/invoices/generate", payload);
  });

  it("send sends POST /invoices/:id/send", async () => {
    await invoiceService.send("inv-1");
    expect(apiClient.post).toHaveBeenCalledWith("/invoices/inv-1/send");
  });

  it("cancel sends POST /invoices/:id/cancel", async () => {
    const payload = { reason: "Duplicate" };
    await invoiceService.cancel("inv-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/invoices/inv-1/cancel", payload);
  });
});

describe("paymentService", () => {
  it("has all service methods", () => {
    expect(paymentService.getAll).toBeDefined();
    expect(paymentService.getById).toBeDefined();
    expect(paymentService.record).toBeDefined();
  });

  it("record sends POST /payments/record", async () => {
    const payload = { invoiceId: "inv-1", amount: 5000, method: "CASH" as const };
    await paymentService.record(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/payments/record", payload);
  });
});

describe("creditNoteService", () => {
  it("has all service methods", () => {
    expect(creditNoteService.getAll).toBeDefined();
    expect(creditNoteService.getById).toBeDefined();
    expect(creditNoteService.create).toBeDefined();
    expect(creditNoteService.issue).toBeDefined();
    expect(creditNoteService.apply).toBeDefined();
    expect(creditNoteService.cancel).toBeDefined();
  });

  it("create sends POST /credit-notes", async () => {
    const payload = { invoiceId: "inv-1", amount: 1000, reason: "Damaged goods" };
    await creditNoteService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/credit-notes", payload);
  });
});

describe("refundService", () => {
  it("create sends POST /refunds", async () => {
    const payload = { paymentId: "pay-1", amount: 500, reason: "Overcharged" };
    await refundService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/refunds", payload);
  });
});
