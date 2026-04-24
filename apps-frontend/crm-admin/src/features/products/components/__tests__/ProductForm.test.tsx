import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ProductForm } from "../ProductForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useProducts", () => ({
  useProductDetail: () => ({ data: undefined, isLoading: false }),
  useCreateProduct: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateProduct: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useBrandsList: jest.fn().mockReturnValue({ data: { data: [] } }),
  useManufacturersList: jest.fn().mockReturnValue({ data: { data: [] } }),
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

describe("ProductForm", () => {
  it("renders create form with all fieldset labels", () => {
    renderWithProvider(<ProductForm />);
    expect(screen.getByText("Product Information")).toBeInTheDocument();
    expect(screen.getByText("Brand & Manufacturer")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Tax & Unit")).toBeInTheDocument();
  });

  it("renders all key input fields", () => {
    renderWithProvider(<ProductForm />);
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/HSN Code/)).toBeInTheDocument();
    expect(screen.getByText(/Barcode/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<ProductForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getAllByText(/Name is required/).length).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<ProductForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
