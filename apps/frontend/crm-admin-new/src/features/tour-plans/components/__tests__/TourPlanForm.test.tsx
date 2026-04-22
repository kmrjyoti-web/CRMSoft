import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { TourPlanForm } from "../TourPlanForm";

jest.mock("../../hooks/useTourPlans", () => ({
  useTourPlanDetail: () => ({ data: undefined, isLoading: false }),
  useCreateTourPlan: () => ({ mutateAsync: jest.fn() }),
  useUpdateTourPlan: () => ({ mutateAsync: jest.fn() }),
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

describe("TourPlanForm", () => {
  it("renders all fieldset labels", () => {
    renderWithProvider(<TourPlanForm />);
    expect(screen.getByText("Tour Plan Information")).toBeInTheDocument();
    expect(screen.getByText("Route")).toBeInTheDocument();
    expect(screen.getByText("Visits")).toBeInTheDocument();
  });

  it("renders required fields", () => {
    renderWithProvider(<TourPlanForm />);
    expect(screen.getByText(/Title/)).toBeInTheDocument();
  });

  it("renders Save button", () => {
    renderWithProvider(<TourPlanForm />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
