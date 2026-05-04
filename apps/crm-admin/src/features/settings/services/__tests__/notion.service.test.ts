import apiClient from "@/services/api-client";

import { notionService } from "../notion.service";

jest.mock("@/services/api-client", () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe("notionService", () => {
  it("has all service methods", () => {
    expect(notionService.getConfig).toBeDefined();
    expect(notionService.saveConfig).toBeDefined();
    expect(notionService.testConnection).toBeDefined();
    expect(notionService.listDatabases).toBeDefined();
    expect(notionService.createEntry).toBeDefined();
    expect(notionService.listEntries).toBeDefined();
  });

  it("getConfig calls GET /api/v1/settings/notion", async () => {
    await notionService.getConfig();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/settings/notion");
  });

  it("saveConfig calls PUT /api/v1/settings/notion", async () => {
    const payload = { token: "ntn_abc", databaseId: "db-1" };
    await notionService.saveConfig(payload);
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/settings/notion", payload);
  });

  it("testConnection calls POST /api/v1/settings/notion/test", async () => {
    await notionService.testConnection();
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/settings/notion/test");
  });

  it("listDatabases calls GET /api/v1/settings/notion/databases", async () => {
    await notionService.listDatabases();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/settings/notion/databases");
  });

  it("createEntry calls POST /api/v1/settings/notion/entries", async () => {
    const payload = {
      promptNumber: "P16",
      title: "Notion Integration",
      status: "Completed",
    };
    await notionService.createEntry(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/settings/notion/entries",
      payload,
    );
  });

  it("listEntries calls GET /api/v1/settings/notion/entries", async () => {
    await notionService.listEntries();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/settings/notion/entries");
  });
});
