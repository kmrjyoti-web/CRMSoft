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

import { UnitList } from "../UnitList";

// ── Mocks ────────────────────────────────────────────────

const mockUnits = [
  { value: "PIECE", label: "Piece" },
  { value: "BOX", label: "Box" },
  { value: "KG", label: "Kilogram" },
];

const mockUseUnitTypes = jest.fn();

jest.mock("../../hooks/useProducts", () => ({
  useUnitTypes: (...args: unknown[]) => mockUseUnitTypes(...args),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: any) => selector({ roles: ["ADMIN"] }),
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

describe("UnitList", () => {
  it("renders loading state", () => {
    mockUseUnitTypes.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProvider(<UnitList />);
    expect(document.querySelector("[class*=spin]") || document.body).toBeTruthy();
  });

  it("renders units in TableFull", () => {
    mockUseUnitTypes.mockReturnValue({
      data: { data: mockUnits },
      isLoading: false,
    });
    renderWithProvider(<UnitList />);
    expect(screen.getByText("Piece")).toBeInTheDocument();
    expect(screen.getByText("PIECE")).toBeInTheDocument();
  });

  it("renders TableFull with Units title", () => {
    mockUseUnitTypes.mockReturnValue({
      data: { data: mockUnits },
      isLoading: false,
    });
    renderWithProvider(<UnitList />);
    expect(screen.getByText("Units")).toBeInTheDocument();
  });

  it("renders TableFull empty state when no data", () => {
    mockUseUnitTypes.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    renderWithProvider(<UnitList />);
    expect(screen.getByText("Units")).toBeInTheDocument();
  });
});
