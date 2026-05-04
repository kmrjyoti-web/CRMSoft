import api from "../api-client";
import { permissionService } from "../permission.service";

jest.mock("../api-client", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// ── Fixtures ────────────────────────────────────────────

const fakePermissions = ["leads.view", "leads.create", "contacts.view"];

const wrappedResponse = {
  data: {
    success: true,
    statusCode: 200,
    message: "OK",
    data: fakePermissions,
    timestamp: "2026-02-28T00:00:00Z",
    path: "/api/v1/auth/permissions",
    requestId: "req-2",
  },
};

const doubleWrappedResponse = {
  data: {
    success: true,
    statusCode: 200,
    message: "OK",
    data: { success: true, message: "Success", data: fakePermissions },
    timestamp: "2026-02-28T00:00:00Z",
    path: "/api/v1/auth/permissions",
    requestId: "req-3",
  },
};

// ── Tests ────────────────────────────────────────────────

describe("permissionService.getMyPermissions", () => {
  it("calls GET /api/v1/auth/permissions and returns flat array", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(wrappedResponse);

    const result = await permissionService.getMyPermissions();

    expect(api.get).toHaveBeenCalledWith("/api/v1/auth/permissions");
    expect(result).toEqual(fakePermissions);
  });

  it("unwraps double-wrapped response", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(doubleWrappedResponse);

    const result = await permissionService.getMyPermissions();

    expect(result).toEqual(fakePermissions);
  });
});
