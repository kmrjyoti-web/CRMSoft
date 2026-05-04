import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { OrganizationForm } from "../OrganizationForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useOrganizations", () => ({
  useOrganizationDetail: () => ({ data: undefined, isLoading: false }),
  useCreateOrganization: () => ({ mutateAsync: jest.fn() }),
  useUpdateOrganization: () => ({ mutateAsync: jest.fn() }),
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

describe("OrganizationForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<OrganizationForm />);
    expect(screen.getByText("Company Information")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
  });

  it("renders required field", () => {
    renderWithProvider(<OrganizationForm />);
    expect(screen.getByText(/Company Name/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<OrganizationForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(
        screen.getAllByText(/Company name is required/).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<OrganizationForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
