import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PackageForm } from "../PackageForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useProducts", () => ({
  usePackageDetail: () => ({ data: undefined, isLoading: false }),
  useCreatePackage: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdatePackage: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("@/stores/side-panel.store", () => ({
  useSidePanelStore: jest.fn((selector: any) =>
    selector({ updatePanelConfig: jest.fn(), setFooterButtons: jest.fn() })
  ),
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

describe("PackageForm", () => {
  it("renders create form with fieldset label", () => {
    renderWithProvider(<PackageForm />);
    expect(screen.getByText("Package Information")).toBeInTheDocument();
    expect(screen.getByText("New Package")).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    renderWithProvider(<PackageForm />);
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/Code/)).toBeInTheDocument();
    expect(screen.getByText(/Type/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<PackageForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getAllByText(/Name is required/).length).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<PackageForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
