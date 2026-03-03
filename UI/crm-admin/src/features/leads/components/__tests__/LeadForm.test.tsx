import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { LeadForm } from "../LeadForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useLeads", () => ({
  useLeadDetail: () => ({ data: undefined, isLoading: false }),
  useCreateLead: () => ({ mutateAsync: jest.fn() }),
  useUpdateLead: () => ({ mutateAsync: jest.fn() }),
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

describe("LeadForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText("Lead Information")).toBeInTheDocument();
  });

  it("renders required field", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<LeadForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(
        screen.getAllByText(/Contact is required/).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
