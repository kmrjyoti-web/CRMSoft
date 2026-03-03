import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { InvoiceForm } from "../InvoiceForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useFinance", () => ({
  useInvoiceDetail: () => ({ data: undefined, isLoading: false }),
  useCreateInvoice: () => ({ mutateAsync: jest.fn() }),
  useUpdateInvoice: () => ({ mutateAsync: jest.fn() }),
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

describe("InvoiceForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<InvoiceForm />);
    expect(screen.getByText("Invoice Information")).toBeInTheDocument();
    expect(screen.getByText("Billing Address")).toBeInTheDocument();
    expect(screen.getByText("Line Items")).toBeInTheDocument();
    expect(screen.getAllByText("Summary").length).toBeGreaterThan(0);
  });

  it("renders required fields", () => {
    renderWithProvider(<InvoiceForm />);
    expect(screen.getByText(/Billing Name/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<InvoiceForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
