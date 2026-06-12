import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { TicketForm } from "../TicketForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/usePostSales", () => ({
  useTicketDetail: () => ({ data: undefined, isLoading: false }),
  useCreateTicket: () => ({ mutateAsync: jest.fn() }),
  useUpdateTicket: () => ({ mutateAsync: jest.fn() }),
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

describe("TicketForm", () => {
  it("renders fieldset labels", () => {
    renderWithProvider(<TicketForm />);
    expect(screen.getByText("Ticket Information")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<TicketForm />);
    expect(screen.getByText(/Subject/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<TicketForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("renders Priority select", () => {
    renderWithProvider(<TicketForm />);
    expect(screen.getByText(/Priority/)).toBeInTheDocument();
  });
});
