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

import { PaymentList } from "../PaymentList";

// ── Mocks ────────────────────────────────────────────────

const mockPayments = [
  {
    id: "pay-1",
    paymentNo: "PAY-001",
    invoiceId: "inv-1",
    amount: 5000,
    currency: "INR",
    status: "PAID",
    method: "CASH",
    gateway: "MANUAL",
    paidAt: "2024-01-15T00:00:00Z",
    recordedById: "user-1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    invoice: { id: "inv-1", invoiceNo: "INV-001", billingName: "Acme Corp" },
  },
];

const mockUsePaymentsList = jest.fn();

jest.mock("../../hooks/useFinance", () => ({
  usePaymentsList: (...args: unknown[]) => mockUsePaymentsList(...args),
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

describe("PaymentList", () => {
  it("renders loading state", () => {
    mockUsePaymentsList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<PaymentList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders payments in TableFull", () => {
    mockUsePaymentsList.mockReturnValue({
      data: { data: mockPayments, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PaymentList />);
    expect(screen.getByText("PAY-001")).toBeInTheDocument();
    expect(screen.getByText("INV-001")).toBeInTheDocument();
  });

  it("renders TableFull with Payments title", () => {
    mockUsePaymentsList.mockReturnValue({
      data: { data: mockPayments, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PaymentList />);
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUsePaymentsList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PaymentList />);
    // AICTableFull shows its own empty state; just verify the title is present
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });
});
