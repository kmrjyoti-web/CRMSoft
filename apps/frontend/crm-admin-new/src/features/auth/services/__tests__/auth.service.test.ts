import type { LoginResponse } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api-response";

// ── Mocks ────────────────────────────────────────────────

const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock("@/services/api-client", () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

jest.mock("react-hot-toast", () => ({ error: jest.fn() }));

import { authService } from "../auth.service";

// ── Fixtures ─────────────────────────────────────────────

const fakeLoginResponse: LoginResponse = {
  user: {
    id: "u1",
    email: "admin@crm.com",
    firstName: "Admin",
    lastName: "User",
    userType: "ADMIN",
    role: "ADMIN",
    roleDisplayName: "Administrator",
  },
  accessToken:
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSIsImVtYWlsIjoiYWRtaW5AY3JtLmNvbSIsInJvbGUiOiJBRE1JTiIsInVzZXJUeXBlIjoiQURNSU4iLCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTcwMDAwMDAwMH0.fake",
  refreshToken: "rt-abc-123",
};

const wrappedResponse: { data: ApiResponse<LoginResponse> } = {
  data: {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: fakeLoginResponse,
    timestamp: new Date().toISOString(),
    path: "/api/v1/auth/admin/login",
    requestId: "req-1",
  },
};

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.getState().clearAuth();
});

// ── Tests ────────────────────────────────────────────────

describe("authService.login", () => {
  it("returns unwrapped login data and updates the store", async () => {
    mockPost.mockResolvedValue(wrappedResponse);

    const result = await authService.login(
      { email: "admin@crm.com", password: "Admin@123" },
      "admin",
    );

    // Correct endpoint
    expect(mockPost).toHaveBeenCalledWith("/api/v1/auth/admin/login", {
      email: "admin@crm.com",
      password: "Admin@123",
    });

    // Returns unwrapped data
    expect(result.accessToken).toBe(fakeLoginResponse.accessToken);
    expect(result.user.email).toBe("admin@crm.com");

    // Store is updated
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(fakeLoginResponse.accessToken);
    expect(state.user?.firstName).toBe("Admin");
  });
});

describe("authService.logout", () => {
  it("clears the auth store and redirects to /login", () => {
    // Pre-populate store
    useAuthStore.getState().setAuth({
      accessToken: "some-token",
      refreshToken: "some-rt",
      user: fakeLoginResponse.user,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Suppress jsdom "not implemented: navigation" console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    authService.logout();

    // Store is cleared
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();

    // Redirect was attempted (jsdom logs "not implemented: navigation")
    const navError = consoleErrorSpy.mock.calls.find((args) =>
      String(args[0]).includes("navigation"),
    );
    expect(navError).toBeDefined();

    consoleErrorSpy.mockRestore();
  });
});
