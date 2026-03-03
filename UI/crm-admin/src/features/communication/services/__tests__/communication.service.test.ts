import apiClient from "@/services/api-client";

import { emailTemplatesService, emailSignaturesService } from "../communication.service";

jest.mock("@/services/api-client", () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe("emailTemplatesService", () => {
  it("has all service methods", () => {
    expect(emailTemplatesService.getAll).toBeDefined();
    expect(emailTemplatesService.getById).toBeDefined();
    expect(emailTemplatesService.create).toBeDefined();
    expect(emailTemplatesService.update).toBeDefined();
    expect(emailTemplatesService.delete).toBeDefined();
    expect(emailTemplatesService.preview).toBeDefined();
  });

  it("getAll calls GET /email-templates with params", async () => {
    const params = { search: "welcome", page: 1 };
    await emailTemplatesService.getAll(params);
    expect(apiClient.get).toHaveBeenCalledWith("/email-templates", { params });
  });

  it("getById calls GET /email-templates/:id", async () => {
    await emailTemplatesService.getById("tpl-1");
    expect(apiClient.get).toHaveBeenCalledWith("/email-templates/tpl-1");
  });

  it("create calls POST /email-templates", async () => {
    const payload = { name: "Welcome", subject: "Hi", body: "<p>Hello</p>" };
    await emailTemplatesService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/email-templates", payload);
  });

  it("delete calls DELETE /email-templates/:id", async () => {
    await emailTemplatesService.delete("tpl-1");
    expect(apiClient.delete).toHaveBeenCalledWith("/email-templates/tpl-1");
  });

  it("preview calls POST /email-templates/:id/preview", async () => {
    const payload = { variables: { name: "John" } };
    await emailTemplatesService.preview("tpl-1", payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/email-templates/tpl-1/preview", payload);
  });
});

describe("emailSignaturesService", () => {
  it("has all service methods", () => {
    expect(emailSignaturesService.getAll).toBeDefined();
    expect(emailSignaturesService.create).toBeDefined();
    expect(emailSignaturesService.update).toBeDefined();
    expect(emailSignaturesService.delete).toBeDefined();
  });

  it("getAll calls GET /email-signatures", async () => {
    await emailSignaturesService.getAll();
    expect(apiClient.get).toHaveBeenCalledWith("/email-signatures");
  });

  it("create calls POST /email-signatures", async () => {
    const payload = { name: "Default", body: "<p>Regards</p>" };
    await emailSignaturesService.create(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith("/email-signatures", payload);
  });
});
