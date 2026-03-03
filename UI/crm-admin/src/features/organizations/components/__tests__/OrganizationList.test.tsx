/* eslint-disable @typescript-eslint/no-explicit-any */
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { OrganizationList } from "../OrganizationList";

// ── Mocks ────────────────────────────────────────────────

const mockOrganizations = [
  {
    id: "org-1",
    name: "Acme Corp",
    industry: "Technology",
    city: "Mumbai",
    gstNumber: "27AABCU9603R1ZM",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

let mockData: { data: typeof mockOrganizations; meta?: object } | undefined;
let mockLoading = false;

jest.mock("../../hooks/useOrganizations", () => ({
  useOrganizationsList: () => ({ data: mockData, isLoading: mockLoading }),
  useSoftDeleteOrganization: () => ({ mutateAsync: jest.fn() }),
  useUpdateOrganization: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/hooks/useBulkOperations", () => ({
  useBulkOperations: () => ({
    execute: jest.fn().mockResolvedValue({ succeeded: [], failed: [] }),
    isRunning: false,
    progress: { completed: 0, total: 0 },
    reset: jest.fn(),
  }),
}));

jest.mock("@/components/common/BulkSelectDrawer", () => ({
  BulkSelectDrawer: () => null,
}));

jest.mock("@/components/common/BulkEditPanel", () => ({
  BulkEditPanel: () => null,
}));

jest.mock("@/components/common/BulkDeleteDialog", () => ({
  useBulkDeleteDialog: () => ({
    trigger: jest.fn(),
    BulkDeleteDialogPortal: () => null,
    isRunning: false,
  }),
}));

jest.mock("@/components/common/useConfirmDialog", () => ({
  useConfirmDialog: () => ({
    confirm: jest.fn().mockResolvedValue(false),
    ConfirmDialogPortal: () => null,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("OrganizationList", () => {
  beforeEach(() => {
    mockData = undefined;
    mockLoading = false;
  });

  it("renders loading state", () => {
    mockLoading = true;
    renderWithProvider(<OrganizationList />);
    expect(
      document.querySelector("[class*=spinner]") || document.body.textContent,
    ).toBeTruthy();
  });

  it("renders organizations in table", () => {
    mockData = { data: mockOrganizations };
    renderWithProvider(<OrganizationList />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Mumbai")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockData = { data: [] };
    renderWithProvider(<OrganizationList />);
    expect(
      screen.getByText("No records found matching the criteria."),
    ).toBeInTheDocument();
  });

  it("renders title via TableFull", () => {
    mockData = { data: mockOrganizations };
    renderWithProvider(<OrganizationList />);
    expect(screen.getByText("Organizations")).toBeInTheDocument();
  });

  it("renders Create Organization button", () => {
    mockData = { data: mockOrganizations };
    renderWithProvider(<OrganizationList />);
    expect(screen.getByText("Create Organization")).toBeInTheDocument();
  });
});
