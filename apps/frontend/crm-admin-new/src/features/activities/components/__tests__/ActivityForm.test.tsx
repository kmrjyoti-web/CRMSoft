import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { ActivityForm } from "../ActivityForm";

jest.mock("../../hooks/useActivities", () => ({
  useActivityDetail: () => ({ data: undefined, isLoading: false }),
  useCreateActivity: () => ({ mutateAsync: jest.fn() }),
  useUpdateActivity: () => ({ mutateAsync: jest.fn() }),
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

describe("ActivityForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<ActivityForm />);
    expect(screen.getByText("Activity Information")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Association")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<ActivityForm />);
    expect(screen.getByText(/Subject/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<ActivityForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
