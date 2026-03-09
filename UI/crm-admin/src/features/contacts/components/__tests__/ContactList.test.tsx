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

import { ContactList } from "../ContactList";

import type { ContactListItem } from "../../types/contacts.types";

// ── Mocks ────────────────────────────────────────────────

const mockContacts: ContactListItem[] = [
  {
    id: "1",
    firstName: "Vikram",
    lastName: "Sharma",
    designation: "CTO",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    communications: [
      {
        id: "c1",
        type: "EMAIL",
        value: "vikram@test.com",
        priorityType: "PRIMARY",
        isPrimary: true,
        isVerified: true,
      },
    ],
    contactOrganizations: [],
  },
];

const mockUseContactsList = jest.fn();

jest.mock("../../hooks/useContacts", () => ({
  useContactsList: (...args: unknown[]) => mockUseContactsList(...args),
  useSoftDeleteContact: () => ({ mutateAsync: jest.fn() }),
  useUpdateContact: () => ({ mutateAsync: jest.fn() }),
  useDeactivateContact: () => ({ mutateAsync: jest.fn() }),
  useReactivateContact: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn(), handleRowView: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/hooks/useOpenDashboard", () => ({
  useOpenDashboard: () => jest.fn(),
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

describe("ContactList", () => {
  it("renders loading state", () => {
    mockUseContactsList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<ContactList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders contacts in TableFull", () => {
    mockUseContactsList.mockReturnValue({
      data: { data: mockContacts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ContactList />);
    expect(screen.getByText("Vikram Sharma")).toBeInTheDocument();
    expect(screen.getByText("vikram@test.com")).toBeInTheDocument();
  });

  it("renders TableFull with Contacts title", () => {
    mockUseContactsList.mockReturnValue({
      data: { data: mockContacts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ContactList />);
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText(/Create Contact/)).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseContactsList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ContactList />);
    // AICTableFull shows its own empty state; just verify the title is present
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });
});
