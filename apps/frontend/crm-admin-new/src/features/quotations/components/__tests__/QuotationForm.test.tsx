import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { QuotationForm } from "../QuotationForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useQuotations", () => ({
  useQuotationDetail: () => ({ data: undefined, isLoading: false }),
  useCreateQuotation: () => ({ mutateAsync: jest.fn() }),
  useUpdateQuotation: () => ({ mutateAsync: jest.fn() }),
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

describe("QuotationForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<QuotationForm />);
    expect(screen.getByText("Quotation Information")).toBeInTheDocument();
    expect(screen.getByText("Line Items")).toBeInTheDocument();
    expect(screen.getAllByText("Summary").length).toBeGreaterThan(0);
  });

  it("renders required fields", () => {
    renderWithProvider(<QuotationForm />);
    expect(screen.getByText(/Lead ID/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<QuotationForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
