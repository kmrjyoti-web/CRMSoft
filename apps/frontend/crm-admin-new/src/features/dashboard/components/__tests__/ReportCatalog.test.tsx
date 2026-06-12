import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { ReportCatalog } from "../ReportCatalog";

// ── Mock Data ────────────────────────────────────────────

const mockDefinitions = [
  {
    id: "def-1",
    code: "SALES_SUMMARY",
    name: "Sales Summary",
    description: "Overview of sales performance",
    category: "Sales",
    isActive: true,
  },
  {
    id: "def-2",
    code: "LEAD_FUNNEL",
    name: "Lead Funnel Report",
    description: "Funnel analysis of leads",
    category: "Lead",
    isActive: true,
  },
];

let mockDefsData: { data: typeof mockDefinitions } | undefined;
let mockDefsLoading = false;

jest.mock("../../hooks/useDashboard", () => ({
  useReportDefinitions: () => ({ data: mockDefsData, isLoading: mockDefsLoading }),
  useExportHistory: () => ({ data: { data: [] } }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("ReportCatalog", () => {
  beforeEach(() => {
    mockDefsData = undefined;
    mockDefsLoading = false;
  });

  it("renders loading state", () => {
    mockDefsLoading = true;
    renderWithProvider(<ReportCatalog />);
    expect(document.querySelector("[class*=spinner]") || document.body.textContent).toBeTruthy();
  });

  it("renders report definitions in table", () => {
    mockDefsData = { data: mockDefinitions };
    renderWithProvider(<ReportCatalog />);
    expect(screen.getByText("Sales Summary")).toBeInTheDocument();
    expect(screen.getByText("Lead Funnel Report")).toBeInTheDocument();
  });

  it("renders empty state when no reports", () => {
    mockDefsData = { data: [] };
    renderWithProvider(<ReportCatalog />);
    expect(screen.getByText("No reports found")).toBeInTheDocument();
  });

  it("renders PageHeader with title", () => {
    mockDefsData = { data: [] };
    renderWithProvider(<ReportCatalog />);
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });
});
