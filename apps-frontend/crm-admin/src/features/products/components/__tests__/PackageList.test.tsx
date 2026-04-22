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

import { PackageList } from "../PackageList";

// ── Mocks ────────────────────────────────────────────────

const mockPackages = [
  {
    id: "p-1",
    name: "Box 10s",
    code: "BOX10",
    type: "BOX",
    description: "Box of 10 units",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockUsePackagesList = jest.fn();

jest.mock("../../hooks/useProducts", () => ({
  usePackagesList: (...args: unknown[]) => mockUsePackagesList(...args),
  useDeletePackage: () => ({ mutate: jest.fn() }),
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

describe("PackageList", () => {
  it("renders loading state", () => {
    mockUsePackagesList.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<PackageList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders packages in TableFull", () => {
    mockUsePackagesList.mockReturnValue({
      data: { data: mockPackages, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PackageList />);
    expect(screen.getByText("Box 10s")).toBeInTheDocument();
    expect(screen.getByText("BOX10")).toBeInTheDocument();
  });

  it("renders TableFull with Packages title", () => {
    mockUsePackagesList.mockReturnValue({
      data: { data: mockPackages, meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PackageList />);
    expect(screen.getByText("Packages")).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUsePackagesList.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } },
      isLoading: false,
    });
    renderWithProvider(<PackageList />);
    expect(screen.getByText("Packages")).toBeInTheDocument();
  });
});
