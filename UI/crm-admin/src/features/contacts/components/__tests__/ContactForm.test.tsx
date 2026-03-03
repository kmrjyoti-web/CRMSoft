import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ContactForm } from "../ContactForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useContacts", () => ({
  useContactDetail: () => ({ data: undefined, isLoading: false }),
  useCreateContact: () => ({ mutateAsync: jest.fn() }),
  useUpdateContact: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

jest.mock("@/hooks/useLookup", () => ({
  useLookup: () => ({ data: [], isLoading: false }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("ContactForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<ContactForm />);
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<ContactForm />);
    expect(screen.getByText(/First Name/)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<ContactForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getAllByText("First name is required").length).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<ContactForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
