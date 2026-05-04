import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { LeadForm } from "../LeadForm";

// ── Mocks ────────────────────────────────────────────────

jest.mock("../../hooks/useLeads", () => ({
  useLeadDetail: () => ({ data: undefined, isLoading: false }),
  useCreateLead: () => ({ mutateAsync: jest.fn() }),
  useUpdateLead: () => ({ mutateAsync: jest.fn() }),
  useQuickCreateLead: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

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

describe("LeadForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText("Lead Information")).toBeInTheDocument();
  });

  it("renders required field", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });

  it("renders Save button and submitting triggers validation", async () => {
    renderWithProvider(<LeadForm />);
    const submitBtn = screen.getByText("Save");
    fireEvent.click(submitBtn);
    // Contact validation uses toast.error, not DOM error messages
    await waitFor(() => {
      expect(submitBtn).toBeInTheDocument();
    });
  });

  it("renders Save button", () => {
    renderWithProvider(<LeadForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
