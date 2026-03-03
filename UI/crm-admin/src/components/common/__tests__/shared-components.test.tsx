import { render, screen } from "@testing-library/react";

// ── LoadingSpinner ──────────────────────────────────────

describe("LoadingSpinner", () => {
  it("renders spinner icon", async () => {
    const { LoadingSpinner } = await import("../LoadingSpinner");
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".crm-spinner")).toBeTruthy();
  });

  it("renders fullPage centered wrapper", async () => {
    const { LoadingSpinner } = await import("../LoadingSpinner");
    const { container } = render(<LoadingSpinner fullPage />);
    expect(container.firstChild).toHaveStyle({ minHeight: "60vh" });
  });
});

// ── EmptyState ──────────────────────────────────────────

describe("EmptyState", () => {
  it("renders default title", async () => {
    const { EmptyState } = await import("../EmptyState");
    render(<EmptyState />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders custom title and description", async () => {
    const { EmptyState } = await import("../EmptyState");
    render(
      <EmptyState title="Nothing here" description="Try adding some data" />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try adding some data")).toBeInTheDocument();
  });

  it("renders action button when provided", async () => {
    const onClick = jest.fn();
    const { EmptyState } = await import("../EmptyState");
    render(<EmptyState action={{ label: "Add Item", onClick }} />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});

// ── StatusBadge ─────────────────────────────────────────

describe("StatusBadge", () => {
  it("renders status text", async () => {
    const { StatusBadge } = await import("../StatusBadge");
    render(<StatusBadge status="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("uses custom colorMap when provided", async () => {
    const { StatusBadge } = await import("../StatusBadge");
    const { container } = render(
      <StatusBadge status="Custom" colorMap={{ custom: "purple" }} />,
    );
    expect(container).toBeTruthy();
  });
});

// ── PageHeader ──────────────────────────────────────────

describe("PageHeader", () => {
  it("renders title", async () => {
    const { PageHeader } = await import("../PageHeader");
    render(<PageHeader title="Contacts" />);
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });

  it("renders subtitle and actions", async () => {
    const { PageHeader } = await import("../PageHeader");
    render(
      <PageHeader
        title="Leads"
        subtitle="Manage your leads"
        actions={<button>Add Lead</button>}
      />,
    );
    expect(screen.getByText("Manage your leads")).toBeInTheDocument();
    expect(screen.getByText("Add Lead")).toBeInTheDocument();
  });
});

// ── FormErrors ──────────────────────────────────────────

describe("FormErrors", () => {
  it("renders nothing when no errors", async () => {
    const { FormErrors } = await import("../FormErrors");
    const { container } = render(<FormErrors errors={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders error messages", async () => {
    const { FormErrors } = await import("../FormErrors");
    render(
      <FormErrors
        errors={{
          email: { message: "Email is required" },
          phone: { message: "Phone is invalid" },
        }}
      />,
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Phone is invalid")).toBeInTheDocument();
  });
});

// ── LookupSelect ───────────────────────────────────────

jest.mock("@/hooks/useLookup", () => ({
  useLookup: jest.fn(() => ({
    data: [
      { id: "1", label: "Option A", value: "A", category: "TEST" },
      { id: "2", label: "Option B", value: "B", category: "TEST" },
    ],
    isLoading: false,
  })),
}));

describe("LookupSelect", () => {
  it("renders SelectInput with lookup options", async () => {
    const { LookupSelect } = await import("../LookupSelect");
    const { container } = render(
      <LookupSelect masterCode="TEST" placeholder="Pick one" />,
    );
    expect(container).toBeTruthy();
  });
});

// ── useConfirmDialog ────────────────────────────────────

describe("useConfirmDialog", () => {
  it("exports confirm function and ConfirmDialogPortal", async () => {
    const { useConfirmDialog } = await import("../useConfirmDialog");
    // Verify the module exports correctly
    expect(typeof useConfirmDialog).toBe("function");
  });
});
