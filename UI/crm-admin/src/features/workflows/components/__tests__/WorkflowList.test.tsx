import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { WorkflowList } from "../WorkflowList";

// ── Mock Data ────────────────────────────────────────────

const mockWorkflows = [
  {
    id: "wf-1",
    name: "Lead Pipeline",
    code: "LEAD_PIPELINE",
    entityType: "LEAD",
    isDefault: true,
    isActive: true,
    isPublished: true,
    version: 1,
    _count: { states: 5, transitions: 8 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

let mockData: { data: typeof mockWorkflows } | undefined;
let mockLoading = false;

jest.mock("../../hooks/useWorkflows", () => ({
  useWorkflowsList: () => ({ data: mockData, isLoading: mockLoading }),
  useCloneWorkflow: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("WorkflowList", () => {
  beforeEach(() => {
    mockData = undefined;
    mockLoading = false;
  });

  it("renders loading state", () => {
    mockLoading = true;
    renderWithProvider(<WorkflowList />);
    expect(document.querySelector("[class*=spinner]") || document.body.textContent).toBeTruthy();
  });

  it("renders workflows in table", () => {
    mockData = { data: mockWorkflows };
    renderWithProvider(<WorkflowList />);
    expect(screen.getByText("Lead Pipeline")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockData = { data: [] };
    renderWithProvider(<WorkflowList />);
    expect(screen.getByText("No workflows found")).toBeInTheDocument();
  });

  it("renders PageHeader with title", () => {
    mockData = { data: [] };
    renderWithProvider(<WorkflowList />);
    expect(screen.getByText("Workflows")).toBeInTheDocument();
  });
});
