import { useAuthStore } from "../auth.store";

// ── Mock jwt-decode so we control the decoded payload ────

jest.mock("@/features/auth/utils/jwt-decode", () => ({
  decodeToken: jest.fn((token: string) => {
    if (token === "valid-token") {
      return {
        sub: "u1",
        email: "admin@crm.com",
        role: "ADMIN",
        userType: "ADMIN",
        tenantId: "t-100",
        exp: 9999999999,
        iat: 1700000000,
      };
    }
    return null;
  }),
}));

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

// ── Tests ────────────────────────────────────────────────

describe("auth.store setAuth", () => {
  it("updates all fields from a full login response", () => {
    useAuthStore.getState().setAuth({
      accessToken: "valid-token",
      refreshToken: "rt-xyz",
      tenantCode: "aliya",
      user: {
        id: "u1",
        email: "admin@crm.com",
        firstName: "Admin",
        lastName: "User",
        userType: "ADMIN",
        role: "ADMIN",
        roleDisplayName: "Administrator",
      },
    });

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe("valid-token");
    expect(state.refreshToken).toBe("rt-xyz");
    expect(state.user).toEqual({
      id: "u1",
      email: "admin@crm.com",
      firstName: "Admin",
      lastName: "User",
      userType: "ADMIN",
      role: "ADMIN",
      roleDisplayName: "Administrator",
    });
    expect(state.tenantId).toBe("t-100");
    expect(state.tenantCode).toBe("aliya");
    expect(state.roles).toEqual(["ADMIN"]);
  });
});

describe("auth.store clearAuth", () => {
  it("resets all state to initial values", () => {
    // First populate the store
    useAuthStore.getState().setAuth({
      accessToken: "valid-token",
      refreshToken: "rt-xyz",
      user: {
        id: "u1",
        email: "admin@crm.com",
        firstName: "Admin",
        lastName: "User",
        userType: "ADMIN",
        role: "ADMIN",
      },
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Now clear
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.tenantCode).toBeNull();
    expect(state.roles).toEqual([]);
  });
});
