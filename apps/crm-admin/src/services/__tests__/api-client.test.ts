import { AxiosError, AxiosHeaders } from "axios";
import toast from "react-hot-toast";

import { useAuthStore } from "@/stores/auth.store";

import { api } from "../api-client";

// ── Mocks ────────────────────────────────────────────────

jest.mock("react-hot-toast", () => ({ error: jest.fn() }));

// ── Helpers ──────────────────────────────────────────────

function mockAdapter(status = 200, data = {}) {
  return jest.fn().mockResolvedValue({
    data,
    status,
    statusText: "OK",
    headers: {},
    config: {},
  });
}

// ── Setup ────────────────────────────────────────────────

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
});

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.getState().clearAuth();
});

// ── Tests ────────────────────────────────────────────────

describe("api-client request interceptor", () => {
  it("attaches Authorization header when token is present", async () => {
    useAuthStore.setState({ token: "test-jwt-token", isAuthenticated: true });

    const adapter = mockAdapter();
    api.defaults.adapter = adapter;

    await api.get("/test");

    const sentConfig = adapter.mock.calls[0][0];
    const authHeader =
      typeof sentConfig.headers?.get === "function"
        ? sentConfig.headers.get("Authorization")
        : sentConfig.headers?.Authorization;
    expect(authHeader).toBe("Bearer test-jwt-token");
  });

  it("attaches X-Tenant-ID header when tenantId is present", async () => {
    useAuthStore.setState({ tenantId: "tenant-123" });

    const adapter = mockAdapter();
    api.defaults.adapter = adapter;

    await api.get("/test");

    const sentConfig = adapter.mock.calls[0][0];
    const tenantHeader =
      typeof sentConfig.headers?.get === "function"
        ? sentConfig.headers.get("X-Tenant-ID")
        : sentConfig.headers?.["X-Tenant-ID"];
    expect(tenantHeader).toBe("tenant-123");
  });
});

describe("api-client response interceptor", () => {
  it("handles 401 — clears auth and redirects to /login when no refresh token", async () => {
    useAuthStore.setState({
      token: "expired",
      refreshToken: null,
      isAuthenticated: true,
    });

    const error401 = new AxiosError(
      "Unauthorized",
      "ERR_BAD_REQUEST",
      { headers: new AxiosHeaders() },
      undefined,
      {
        status: 401,
        data: { message: "Unauthorized" },
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );

    api.defaults.adapter = jest.fn().mockRejectedValue(error401);

    // Suppress jsdom "not implemented: navigation" console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(api.get("/test")).rejects.toBeTruthy();

    // Store is cleared
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();

    // Redirect was attempted (jsdom logs "not implemented: navigation")
    const navError = consoleErrorSpy.mock.calls.find((args) =>
      String(args[0]).includes("navigation"),
    );
    expect(navError).toBeDefined();

    consoleErrorSpy.mockRestore();
  });

  it("handles 500 — shows toast with error message", async () => {

    const error500 = new AxiosError(
      "Internal Server Error",
      "ERR_BAD_RESPONSE",
      { headers: new AxiosHeaders() },
      undefined,
      {
        status: 500,
        data: { message: "Database connection failed" },
        statusText: "Internal Server Error",
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );

    api.defaults.adapter = jest.fn().mockRejectedValue(error500);

    await expect(api.get("/test")).rejects.toBeTruthy();

    expect(toast.error).toHaveBeenCalledWith("Database connection failed");
  });
});
