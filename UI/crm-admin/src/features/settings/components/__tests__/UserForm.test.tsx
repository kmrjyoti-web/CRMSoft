import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { UserForm } from "../UserForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useUsers", () => ({
  useUserDetail: () => ({ data: undefined, isLoading: false }),
  useCreateUser: () => ({ mutateAsync: jest.fn() }),
  useUpdateUser: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("../../hooks/useRoles", () => ({
  useRolesList: () => ({ data: undefined }),
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

describe("UserForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<UserForm />);
    expect(screen.getByText("User Information")).toBeInTheDocument();
    expect(screen.getByText("Role & Access")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<UserForm />);
    expect(screen.getByText(/First Name/)).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<UserForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
