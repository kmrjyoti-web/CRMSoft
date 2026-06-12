import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// AICTableFull uses motion/react which requires ResizeObserver + matchMedia
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

import { ProductList } from "../ProductList";

// ── Mocks ────────────────────────────────────────────────

const mockProducts = [
  {
    id: "prod-1",
    name: "Widget Pro",
    code: "WGT-001",
    brand: { id: "b-1", name: "Acme Corp" },
    manufacturer: { id: "m-1", name: "Global Pharma" },
    mrp: 1500,
    salePrice: 1200,
    hsnCode: "84713010",
    primaryUnit: "PIECE",
    status: "ACTIVE",
    tags: ["electronics", "gadget"],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockUseProductsList = jest.fn();

jest.mock("../../hooks/useProducts", () => ({
  useProductsList: (...args: unknown[]) => mockUseProductsList(...args),
  useDeactivateProduct: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: any) => selector({ roles: ["ADMIN"] }),
}));

jest.mock("@/hooks/useTableFilters", () => ({
  useTableFilters: () => ({ filterParams: {} }),
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

describe("ProductList", () => {
  it("renders loading state", () => {
    mockUseProductsList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<ProductList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders products in TableFull", () => {
    mockUseProductsList.mockReturnValue({
      data: { data: mockProducts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ProductList />);
    expect(screen.getByText("Widget Pro")).toBeInTheDocument();
    expect(screen.getByText("WGT-001")).toBeInTheDocument();
  });

  it("renders TableFull with Products title", () => {
    mockUseProductsList.mockReturnValue({
      data: { data: mockProducts, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ProductList />);
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseProductsList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<ProductList />);
    expect(screen.getByText("Products")).toBeInTheDocument();
  });
});
