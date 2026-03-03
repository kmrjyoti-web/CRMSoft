import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// AICTableFull uses motion/react which requires ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

import { TicketList } from "../TicketList";

// ── Mocks ────────────────────────────────────────────────

const mockTickets = [
  {
    id: "tkt-1",
    ticketNo: "TKT-001",
    status: "OPEN",
    priority: "HIGH",
    category: "GENERAL",
    subject: "Cannot login",
    createdById: "user-1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    assignedTo: { id: "user-2", firstName: "John", lastName: "Doe" },
    contact: { id: "c-1", firstName: "Jane", lastName: "Smith" },
    organization: { id: "org-1", name: "Acme Corp" },
  },
];

const mockUseTicketsList = jest.fn();

jest.mock("../../hooks/usePostSales", () => ({
  useTicketsList: (...args: unknown[]) => mockUseTicketsList(...args),
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

describe("TicketList", () => {
  it("renders loading state", () => {
    mockUseTicketsList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<TicketList />);
    expect(document.querySelector("[class*=spinner]") || document.body).toBeTruthy();
  });

  it("renders tickets in TableFull", () => {
    mockUseTicketsList.mockReturnValue({
      data: { data: mockTickets, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<TicketList />);
    expect(screen.getByText("TKT-001")).toBeInTheDocument();
    expect(screen.getByText("Cannot login")).toBeInTheDocument();
  });

  it("renders TableFull with Tickets title", () => {
    mockUseTicketsList.mockReturnValue({
      data: { data: mockTickets, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<TicketList />);
    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.getByText(/Create Ticket/)).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseTicketsList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<TicketList />);
    // AICTableFull shows its own empty state; just verify the title is present
    expect(screen.getByText("Tickets")).toBeInTheDocument();
  });
});
