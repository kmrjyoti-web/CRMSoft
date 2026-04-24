import apiClient from "@/services/api-client";

import { installationService, trainingService, ticketService } from "../post-sales.service";

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

describe("installationService", () => {
  it("has all service methods", () => {
    expect(installationService.getAll).toBeDefined();
    expect(installationService.getById).toBeDefined();
    expect(installationService.create).toBeDefined();
    expect(installationService.update).toBeDefined();
    expect(installationService.start).toBeDefined();
    expect(installationService.complete).toBeDefined();
    expect(installationService.cancel).toBeDefined();
  });

  it("getAll calls GET /installations with params", async () => {
    await installationService.getAll({ page: 1, limit: 10, status: "SCHEDULED" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/installations", {
      params: { page: 1, limit: 10, status: "SCHEDULED" },
    });
  });

  it("getById calls GET /installations/:id", async () => {
    await installationService.getById("inst-1");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/installations/inst-1");
  });

  it("create sends POST /installations", async () => {
    const payload = { title: "Test", scheduledDate: "2024-02-01" };
    await installationService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/installations", payload);
  });

  it("start sends POST /installations/:id/start", async () => {
    await installationService.start("inst-1");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/installations/inst-1/start");
  });

  it("complete sends POST /installations/:id/complete", async () => {
    await installationService.complete("inst-1");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/installations/inst-1/complete");
  });

  it("cancel sends POST /installations/:id/cancel", async () => {
    await installationService.cancel("inst-1");
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/installations/inst-1/cancel");
  });
});

describe("trainingService", () => {
  it("has all service methods", () => {
    expect(trainingService.getAll).toBeDefined();
    expect(trainingService.getById).toBeDefined();
    expect(trainingService.create).toBeDefined();
    expect(trainingService.update).toBeDefined();
    expect(trainingService.start).toBeDefined();
    expect(trainingService.complete).toBeDefined();
    expect(trainingService.cancel).toBeDefined();
  });

  it("getAll calls GET /trainings", async () => {
    await trainingService.getAll({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/trainings", {
      params: { page: 1, limit: 10 },
    });
  });

  it("create sends POST /trainings", async () => {
    const payload = { title: "Training 1", mode: "ONSITE", scheduledDate: "2024-03-01" };
    await trainingService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/trainings", payload);
  });
});

describe("ticketService", () => {
  it("has all service methods", () => {
    expect(ticketService.getAll).toBeDefined();
    expect(ticketService.getById).toBeDefined();
    expect(ticketService.create).toBeDefined();
    expect(ticketService.update).toBeDefined();
    expect(ticketService.assign).toBeDefined();
    expect(ticketService.resolve).toBeDefined();
    expect(ticketService.close).toBeDefined();
    expect(ticketService.reopen).toBeDefined();
    expect(ticketService.addComment).toBeDefined();
  });

  it("getAll calls GET /tickets", async () => {
    await ticketService.getAll({ page: 1, limit: 10, status: "OPEN" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/tickets", {
      params: { page: 1, limit: 10, status: "OPEN" },
    });
  });

  it("create sends POST /tickets", async () => {
    const payload = { subject: "Help", priority: "HIGH", category: "GENERAL" };
    await ticketService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/tickets", payload);
  });

  it("assign sends POST /tickets/:id/assign", async () => {
    const payload = { assignedToId: "user-1" };
    await ticketService.assign("tkt-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/tickets/tkt-1/assign", payload);
  });

  it("resolve sends POST /tickets/:id/resolve", async () => {
    const payload = { resolution: "Fixed" };
    await ticketService.resolve("tkt-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/tickets/tkt-1/resolve", payload);
  });

  it("addComment sends POST /tickets/:id/comments", async () => {
    const payload = { content: "Looking into it" };
    await ticketService.addComment("tkt-1", payload);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/tickets/tkt-1/comments", payload);
  });
});
