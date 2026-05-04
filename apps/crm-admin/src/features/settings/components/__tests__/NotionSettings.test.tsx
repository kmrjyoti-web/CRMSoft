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

import { NotionSettings } from "../NotionSettings";

// ── Mocks ────────────────────────────────────────────────

const mockConfig = {
  id: "cfg-1",
  tenantId: "t1",
  tokenMasked: "ntn_abcd...**********",
  databaseId: "db-1",
  isActive: true,
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
};

const mockEntries = [
  {
    id: "p1",
    promptNumber: "P15",
    title: "Communication & Workflows",
    description: "Templates, signatures, workflow builder",
    status: "Completed",
    filesChanged: "20 files",
    testResults: "341 tests pass",
    date: "2026-02-28",
  },
];

jest.mock("../../hooks/useNotion", () => ({
  useNotionConfig: () => ({ data: { data: mockConfig } }),
  useSaveNotionConfig: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useTestNotionConnection: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useNotionDatabases: () => ({
    data: { data: [{ id: "db-1", title: "Dev Sessions" }] },
  }),
  useNotionEntries: () => ({ data: { data: mockEntries } }),
  useCreateNotionEntry: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("NotionSettings", () => {
  it("renders the page title", () => {
    renderWithProvider(<NotionSettings />);
    expect(screen.getByText("Notion Integration")).toBeInTheDocument();
  });

  it("shows configuration section with token saved badge", () => {
    renderWithProvider(<NotionSettings />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Token saved")).toBeInTheDocument();
  });

  it("renders the push session entry form", () => {
    renderWithProvider(<NotionSettings />);
    expect(screen.getByText("Push Session Entry")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("P16")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Notion Integration"),
    ).toBeInTheDocument();
  });

  it("shows the session log table when entries exist", () => {
    renderWithProvider(<NotionSettings />);
    expect(screen.getByText(/Session Log/)).toBeInTheDocument();
  });

  it("renders test connection button", () => {
    renderWithProvider(<NotionSettings />);
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
  });
});
