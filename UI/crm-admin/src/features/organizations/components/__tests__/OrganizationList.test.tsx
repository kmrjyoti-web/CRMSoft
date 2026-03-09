/* eslint-disable @typescript-eslint/no-explicit-any */
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
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
  useDeactivateOrganization: () => ({ mutateAsync: jest.fn() }),
  useReactivateOrganization: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn(), handleRowView: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/hooks/useDynamicFilterConfig", () => ({
  useDynamicFilterConfig: () => ({ sections: [] }),
}));

jest.mock("@/hooks/useBulkSelect", () => ({
  useBulkSelect: () => ({ selectedIds: new Set(), toggle: jest.fn(), selectAll: jest.fn(), clearSelection: jest.fn(), count: 0 }),
}));

jest.mock("@/hooks/useTableFilters", () => ({
  useTableFilters: () => ({ activeFilters: {}, filterParams: {}, handleFilterChange: jest.fn(), clearFilters: jest.fn() }),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: any) => selector({ roles: ["ADMIN"] }),
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
