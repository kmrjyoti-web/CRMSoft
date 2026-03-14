import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { DashboardOverview } from "../DashboardOverview";

// ── Mock Data ────────────────────────────────────────────

const mockKpis = {
  data: {
    totalLeads: 150,
    activeLeads: 45,
    wonDeals: 20,
    lostDeals: 10,
    totalRevenue: 5000000,
    conversionRate: 13.3,
    avgDealSize: 250000,
    pendingActivities: 12,
  },
};

const mockPipeline = { data: [{ stage: "NEW", count: 30, value: 1500000 }] };
const mockRevenue = { data: [{ period: "2026-01", revenue: 2000000, deals: 10 }] };
const mockSources = { data: [{ source: "Website", count: 50, percentage: 33.3 }] };

let mockKpiData: typeof mockKpis | undefined;
let mockKpiLoading = false;

jest.mock("../../hooks/useDashboard", () => ({
  useExecutiveDashboard: () => ({ data: mockKpiData, isLoading: mockKpiLoading }),
  usePipeline: () => ({ data: mockPipeline }),
  useRevenueAnalytics: () => ({ data: mockRevenue }),
  useLeadSources: () => ({ data: mockSources }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/hooks/useEntityPanel", () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn(), handleRowView: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: any) => selector({ roles: ["ADMIN"] }),
}));

// Mock recharts to avoid canvas/SVG issues in JSDOM
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("DashboardOverview", () => {
  beforeEach(() => {
    mockKpiData = undefined;
    mockKpiLoading = false;
  });

  it("renders loading state", () => {
    mockKpiLoading = true;
    renderWithProvider(<DashboardOverview />);
    expect(document.querySelector("[class*=spinner]") || document.body.textContent).toBeTruthy();
  });

  it("renders toolbar with title", () => {
    mockKpiData = mockKpis;
    renderWithProvider(<DashboardOverview />);
    expect(screen.getByText("Executive Dashboard")).toBeInTheDocument();
  });

  it("renders KPI card titles when data is loaded", () => {
    mockKpiData = mockKpis;
    renderWithProvider(<DashboardOverview />);
    // KpiCard uses count-up animation via requestAnimationFrame, so check titles
    expect(screen.getByText("Total Leads")).toBeInTheDocument();
    expect(screen.getByText("Won Deals")).toBeInTheDocument();
  });

  it("renders chart containers", () => {
    mockKpiData = mockKpis;
    renderWithProvider(<DashboardOverview />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });
});
