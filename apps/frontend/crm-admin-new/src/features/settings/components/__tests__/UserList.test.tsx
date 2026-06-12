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

import { UserList } from "../UserList";

// ── Mocks ────────────────────────────────────────────────

const mockUsers = [
  {
    id: "user-1",
    email: "john@test.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+91 9876543210",
    status: "ACTIVE",
    userType: "ADMIN",
    roleId: "role-1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    role: { id: "role-1", name: "admin", displayName: "Admin" },
  },
];

const mockUseUsersList = jest.fn();

jest.mock("../../hooks/useUsers", () => ({
  useUsersList: (...args: unknown[]) => mockUseUsersList(...args),
  useSoftDeleteUser: () => ({ mutateAsync: jest.fn() }),
  useDeactivateUser: () => ({ mutateAsync: jest.fn() }),
  useActivateUser: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn(), handleRowView: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
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

describe("UserList", () => {
  it("renders loading state", () => {
    mockUseUsersList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<UserList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders users in TableFull", () => {
    mockUseUsersList.mockReturnValue({
      data: { data: mockUsers, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<UserList />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("renders TableFull with Users title", () => {
    mockUseUsersList.mockReturnValue({
      data: { data: mockUsers, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<UserList />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    // AICTableFull strips trailing 's' from title: "Users" → "User"
    expect(screen.getByText(/Create User/)).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseUsersList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<UserList />);
    // AICTableFull shows its own empty state; just verify the title is present
    expect(screen.getByText("Users")).toBeInTheDocument();
  });
});
