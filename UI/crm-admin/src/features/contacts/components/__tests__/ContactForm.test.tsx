import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ContactForm } from "../ContactForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useContacts", () => ({
  useContactDetail: () => ({ data: undefined, isLoading: false }),
  useCreateContact: () => ({ mutateAsync: jest.fn() }),
  useUpdateContact: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

jest.mock("@/hooks/useLookup", () => ({
  useLookup: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/stores/side-panel.store", () => ({
  useSidePanelStore: (selector: any) => selector({ updatePanelConfig: jest.fn(), openPanel: jest.fn(), closePanel: jest.fn() }),
}));

jest.mock("@/features/form-config/hooks/useFormConfig", () => ({
  useFormConfig: () => ({ fields: [], isFieldVisible: () => true, getFieldLabel: (id: string) => id, isLoading: false, saveConfig: jest.fn(), resetToDefault: jest.fn(), isSaving: false }),
}));

jest.mock("@/features/form-config/components/FormConfigButton", () => ({
  FormConfigButton: () => null,
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: any) => selector({ roles: ["ADMIN"] }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe("ContactForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<ContactForm />);
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<ContactForm />);
    // getFieldLabel mock returns field id as-is
    expect(screen.getByText(/firstName/)).toBeInTheDocument();
    expect(screen.getByText(/lastName/)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProvider(<ContactForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getAllByText("First name is required").length).toBeGreaterThan(0);
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<ContactForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
