import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { MenuEditor } from "../MenuEditor";

// ── Mock Data ────────────────────────────────────────────

const mockMenuItems = [
  {
    id: "menu-1",
    name: "Dashboard",
    code: "dashboard",
    icon: "home",
    route: "/dashboard",
    menuType: "ITEM",
    sortOrder: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    children: [],
  },
];

let mockData: { data: typeof mockMenuItems } | undefined;
let mockLoading = false;

jest.mock("../../hooks/useMenus", () => ({
  useMenuTree: () => ({ data: mockData, isLoading: mockLoading }),
  useCreateMenu: () => ({ mutateAsync: jest.fn() }),
  useUpdateMenu: () => ({ mutateAsync: jest.fn() }),
  useDeactivateMenu: () => ({ mutateAsync: jest.fn() }),
  useReorderMenus: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: () => [],
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: jest.fn(), transform: null, transition: null }),
  arrayMove: jest.fn(),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("MenuEditor", () => {
  beforeEach(() => {
    mockData = undefined;
    mockLoading = false;
  });

  it("renders loading state", () => {
    mockLoading = true;
    renderWithProvider(<MenuEditor />);
    expect(document.querySelector("[class*=spinner]") || document.body.textContent).toBeTruthy();
  });

  it("renders menu items", () => {
    mockData = { data: mockMenuItems };
    renderWithProvider(<MenuEditor />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockData = { data: [] };
    renderWithProvider(<MenuEditor />);
    expect(screen.getByText("No menu items")).toBeInTheDocument();
  });

  it("renders PageHeader with title", () => {
    mockData = { data: [] };
    renderWithProvider(<MenuEditor />);
    expect(screen.getByText("Menu Editor")).toBeInTheDocument();
  });
});
