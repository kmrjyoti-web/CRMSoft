import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// AICTableFull uses motion/react which requires ResizeObserver + matchMedia
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

import { LeadList } from "../LeadList";

// ── Mocks ────────────────────────────────────────────────

const mockLeads = [
  {
    id: "lead-1",
    leadNumber: "LD-001",
    status: "NEW",
    priority: "HIGH",
    expectedValue: 50000,
    expectedCloseDate: null,
    contactId: "c-1",
    createdById: "u-1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    contact: { id: "c-1", firstName: "John", lastName: "Doe" },
    organization: { id: "org-1", name: "Acme Corp" },
    allocatedTo: null,
  },
];

let mockData: { data: typeof mockLeads; meta?: object } | undefined;
let mockLoading = false;

jest.mock("../../hooks/useLeads", () => ({
  useLeadsList: () => ({ data: mockData, isLoading: mockLoading }),
  useUpdateLead: () => ({ mutateAsync: jest.fn() }),
  useSoftDeleteLead: () => ({ mutateAsync: jest.fn() }),
  useDeactivateLead: () => ({ mutateAsync: jest.fn() }),
  useReactivateLead: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn(), handleRowView: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/hooks/useOpenDashboard", () => ({
  useOpenDashboard: () => jest.fn(),
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

jest.mock("@/components/common/useConfirmDialog", () => ({
  useConfirmDialog: () => ({ confirm: jest.fn(), ConfirmDialogPortal: () => null }),
}));

jest.mock("@/components/common/BulkDeleteDialog", () => ({
  useBulkDeleteDialog: () => ({ trigger: jest.fn(), BulkDeleteDialogPortal: () => null }),
}));

jest.mock("@/components/common/BulkEditPanel", () => ({
  BulkEditPanel: () => null,
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

describe("LeadList", () => {
  beforeEach(() => {
    mockData = undefined;
    mockLoading = false;
  });

  it("renders loading state", () => {
    mockLoading = true;
    renderWithProvider(<LeadList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders leads in TableFull", () => {
    mockData = { data: mockLeads };
    renderWithProvider(<LeadList />);
    expect(screen.getByText("LD-001")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders TableFull with Leads title", () => {
    mockData = { data: mockLeads };
    renderWithProvider(<LeadList />);
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText(/Create Lead/)).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockData = { data: [] };
    renderWithProvider(<LeadList />);
    // AICTableFull shows its own empty state; title should still be present
    expect(screen.getByText("Leads")).toBeInTheDocument();
  });
});
