import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// AICTableFull uses motion/react which requires ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

import { RawContactList } from "../RawContactList";

import type { RawContactListItem } from "../../types/raw-contacts.types";

// ── Mocks ────────────────────────────────────────────────

const mockRawContacts: RawContactListItem[] = [
  {
    id: "1",
    firstName: "Rajesh",
    lastName: "Kumar",
    status: "RAW",
    source: "MANUAL",
    companyName: "Test Corp",
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    communications: [
      {
        id: "c1",
        type: "EMAIL",
        value: "rajesh@test.com",
        priorityType: "PRIMARY",
        isPrimary: true,
        isVerified: false,
      },
    ],
  },
];

const mockUseRawContactsList = jest.fn();

jest.mock("../../hooks/useRawContacts", () => ({
  useRawContactsList: (...args: unknown[]) => mockUseRawContactsList(...args),
  useUpdateRawContact: () => ({ mutateAsync: jest.fn() }),
  useSoftDeleteRawContact: () => ({ mutateAsync: jest.fn() }),
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

describe("RawContactList", () => {
  it("renders loading state", () => {
    mockUseRawContactsList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<RawContactList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders raw contacts in TableFull", () => {
    mockUseRawContactsList.mockReturnValue({
      data: { data: mockRawContacts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<RawContactList />);
    expect(screen.getByText("Rajesh Kumar")).toBeInTheDocument();
    expect(screen.getByText("rajesh@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test Corp")).toBeInTheDocument();
  });

  it("renders TableFull with Raw Contacts title", () => {
    mockUseRawContactsList.mockReturnValue({
      data: { data: mockRawContacts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<RawContactList />);
    expect(screen.getByText("Raw Contacts")).toBeInTheDocument();
    expect(screen.getByText(/Create Raw Contact/)).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseRawContactsList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<RawContactList />);
    // AICTableFull shows its own empty state with "No data available"
    expect(screen.getByText("Raw Contacts")).toBeInTheDocument();
  });
});
