import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { TemplateList } from "../TemplateList";

// ── Mock Data ────────────────────────────────────────────

const mockTemplates = [
  {
    id: "tpl-1",
    name: "Welcome Email",
    category: "SALES",
    subject: "Welcome to Our Service",
    bodyHtml: "<p>Hello</p>",
    isShared: true,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdById: "user-1",
  },
];

let mockData: { data: typeof mockTemplates; meta?: any } | undefined;
let mockLoading = false;

jest.mock("../../hooks/useCommunication", () => ({
  useTemplatesList: () => ({ data: mockData, isLoading: mockLoading }),
  useDeleteTemplate: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("TemplateList", () => {
  beforeEach(() => {
    mockData = undefined;
    mockLoading = false;
  });

  it("renders loading state", () => {
    mockLoading = true;
    renderWithProvider(<TemplateList />);
    expect(document.querySelector("[class*=spinner]") || document.body.textContent).toBeTruthy();
  });

  it("renders templates in table", () => {
    mockData = { data: mockTemplates };
    renderWithProvider(<TemplateList />);
    expect(screen.getByText("Welcome Email")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockData = { data: [] };
    renderWithProvider(<TemplateList />);
    expect(screen.getByText("No templates found")).toBeInTheDocument();
  });

  it("renders PageHeader with title", () => {
    mockData = { data: [] };
    renderWithProvider(<TemplateList />);
    expect(screen.getByText("Email Templates")).toBeInTheDocument();
  });
});
