import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";

// AICTableFull might be used indirectly; ResizeObserver polyfill
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

// ── Mocks ────────────────────────────────────────────────

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        user: { firstName: "Test", lastName: "User", email: "test@crm.com" },
        token: "mock-token-123",
        refreshToken: "mock-refresh-456",
        tenantId: "tenant-1",
        roles: ["admin"],
      }),
    {
      getState: () => ({
        user: { firstName: "Test", lastName: "User", email: "test@crm.com" },
        token: "mock-token-123",
        refreshToken: "mock-refresh-456",
        tenantId: "tenant-1",
        roles: ["admin"],
      }),
    },
  ),
}));

jest.mock("@/stores/menu.store", () => ({
  useMenuStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({ items: [], isLoaded: true }),
    {
      getState: () => ({ items: [], isLoaded: true }),
    },
  ),
}));

jest.mock("@/stores/permission.store", () => ({
  usePermissionStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        codes: ["contacts:view", "contacts:create", "leads:view"],
        features: ["workflow_engine"],
        hasPermission: (code: string) => ["contacts:view", "contacts:create", "leads:view"].includes(code),
        hasFeature: (key: string) => key === "workflow_engine",
      }),
    {
      getState: () => ({
        codes: ["contacts:view", "contacts:create", "leads:view"],
        features: ["workflow_engine"],
        hasPermission: (code: string) => ["contacts:view", "contacts:create", "leads:view"].includes(code),
        hasFeature: (key: string) => key === "workflow_engine",
      }),
    },
  ),
}));

jest.mock("@/services/api-client", () => ({
  api: {
    request: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { DevPanel } from "../DevPanel";

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("DevPanel", () => {
  it("renders the Developer Tools title", () => {
    renderWithProvider(<DevPanel />);
    expect(screen.getByText("Developer Tools")).toBeInTheDocument();
  });

  it("renders all 9 tab buttons", () => {
    renderWithProvider(<DevPanel />);
    const tabLabels = ["API Health", "Error Log", "UI Kit", "Stores", "Permissions", "Network", "System", "Flags", "Query Cache"];
    tabLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("shows API Health tab by default", () => {
    renderWithProvider(<DevPanel />);
    expect(screen.getByText("Ping all API endpoints, check backend status")).toBeInTheDocument();
  });

  it("switches tabs when clicking a tab button", () => {
    renderWithProvider(<DevPanel />);
    fireEvent.click(screen.getByText("System"));
    expect(screen.getByText("Build, browser, auth, config info")).toBeInTheDocument();
  });

  it("renders system info cards on System tab", () => {
    renderWithProvider(<DevPanel />);
    fireEvent.click(screen.getByText("System"));
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.getByText("CRM Admin")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
  });
});
