import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { authService } from "@/features/auth/services/auth.service";

import { LoginForm } from "../LoginForm";

// ── Mocks ────────────────────────────────────────────────

const mockPush = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const mockLogin = authService.login as jest.Mock;

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────

describe("LoginForm", () => {
  it("renders email, password, and tenant inputs", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g. acme-corp (optional)"),
    ).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<LoginForm />);
    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
  });

  it("calls authService.login on valid submit", async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "admin@crm.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "Admin@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "admin@crm.com", password: "Admin@123" },
        "admin",
      );
    });
  });
});
