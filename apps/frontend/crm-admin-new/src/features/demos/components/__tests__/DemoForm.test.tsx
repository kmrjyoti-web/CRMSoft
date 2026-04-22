import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { DemoForm } from "../DemoForm";

jest.mock("../../hooks/useDemos", () => ({
  useDemoDetail: () => ({ data: undefined, isLoading: false }),
  useCreateDemo: () => ({ mutateAsync: jest.fn() }),
  useUpdateDemo: () => ({ mutateAsync: jest.fn() }),
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

describe("DemoForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<DemoForm />);
    expect(screen.getByText("Demo Information")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<DemoForm />);
    expect(screen.getByText(/Lead ID/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<DemoForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
