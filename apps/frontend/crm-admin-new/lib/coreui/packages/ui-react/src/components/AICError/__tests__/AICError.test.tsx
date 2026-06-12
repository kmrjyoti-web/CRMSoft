/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup, act, waitFor } from "@testing-library/react";
import { AICErrorBoundary } from "../AICErrorBoundary";
import { AICErrorDashboard } from "../AICErrorDashboard";
import {
  normalizeToApiError,
  isApiError,
  isSuccessLikeError,
  logError,
  getRecentErrors,
  clearAllErrors,
  getErrorSeverityStyles,
  matchFormErrors,
} from "@coreui/ui";
import type { ApiError, ErrorLogEntry } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Helper: component that always throws
// ---------------------------------------------------------------------------

function ThrowingChild({ message }: { message: string }): React.ReactElement {
  throw new Error(message);
}

// Suppress console.error from React error boundary logs during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React error boundary noise
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('Error Boundary') ||
      msg.includes('The above error occurred') ||
      msg.includes('Consider adding an error boundary')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  cleanup();
  clearAllErrors();
  console.error = originalConsoleError;
});

// ═══════════════════════════════════════════════════════════════════════════
// AICErrorBoundary
// ═══════════════════════════════════════════════════════════════════════════

describe("AICErrorBoundary", () => {
  // ── 1. Renders children normally ────────────────────
  it("renders children when no error is thrown", () => {
    const { getByText } = render(
      <AICErrorBoundary>
        <p>All good</p>
      </AICErrorBoundary>,
    );

    expect(getByText("All good")).toBeTruthy();
  });

  // ── 2. Catches error and shows default fallback ─────
  it("catches error and shows default fallback UI", () => {
    const { getByTestId, getByText } = render(
      <AICErrorBoundary>
        <ThrowingChild message="Test crash" />
      </AICErrorBoundary>,
    );

    const fallback = getByTestId("aic-error-fallback");
    expect(fallback).toBeTruthy();
    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Test crash")).toBeTruthy();
  });

  // ── 3. Shows custom static fallback ─────────────────
  it("renders static fallback when provided", () => {
    const { getByText, queryByTestId } = render(
      <AICErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild message="Boom" />
      </AICErrorBoundary>,
    );

    expect(getByText("Custom fallback")).toBeTruthy();
    expect(queryByTestId("aic-error-fallback")).toBeNull();
  });

  // ── 4. Shows render function fallback ───────────────
  it("renders function fallback receiving the error", () => {
    const { getByText } = render(
      <AICErrorBoundary fallback={(err: Error) => <div>Error: {err.message}</div>}>
        <ThrowingChild message="FnBoom" />
      </AICErrorBoundary>,
    );

    expect(getByText("Error: FnBoom")).toBeTruthy();
  });

  // ── 5. Retry button resets the boundary ─────────────
  it("retry button resets and re-renders children", () => {
    let shouldThrow = true;

    function MaybeThrow() {
      if (shouldThrow) throw new Error("First render fails");
      return <p>Recovered</p>;
    }

    const { getByTestId, getByText } = render(
      <AICErrorBoundary>
        <MaybeThrow />
      </AICErrorBoundary>,
    );

    // Error state
    expect(getByTestId("aic-error-fallback")).toBeTruthy();

    // Fix the condition, then click retry
    shouldThrow = false;
    fireEvent.click(getByTestId("aic-error-retry"));

    expect(getByText("Recovered")).toBeTruthy();
  });

  // ── 6. Calls onError callback ───────────────────────
  it("calls onError callback with error and errorInfo", () => {
    const onError = vi.fn();

    render(
      <AICErrorBoundary onError={onError}>
        <ThrowingChild message="Callback test" />
      </AICErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("Callback test");
    // errorInfo should be an object with componentStack
    expect(onError.mock.calls[0][1]).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AICErrorDashboard
// ═══════════════════════════════════════════════════════════════════════════

describe("AICErrorDashboard", () => {
  // ── 7. Renders empty state ──────────────────────────
  it("renders empty state when no errors exist", () => {
    const { getByTestId } = render(<AICErrorDashboard />);

    expect(getByTestId("aic-error-dashboard")).toBeTruthy();
    expect(getByTestId("aic-error-empty")).toBeTruthy();
  });

  // ── 8. Renders error entries ────────────────────────
  it("renders provided error entries", () => {
    const errors: ErrorLogEntry[] = [
      {
        id: "1",
        timestamp: Date.now(),
        type: "API",
        message: "Not Found",
        severity: "ERROR",
        scope: "API",
        source: "HTTP_INTERCEPTOR",
      },
      {
        id: "2",
        timestamp: Date.now(),
        type: "COMPONENT",
        message: "Render failed",
        severity: "WARNING",
        scope: "COMPONENT",
        source: "COMPONENT",
      },
    ];

    const { getByTestId } = render(<AICErrorDashboard errors={errors} />);

    expect(getByTestId("aic-error-list")).toBeTruthy();
    expect(getByTestId("aic-error-entry-1")).toBeTruthy();
    expect(getByTestId("aic-error-entry-2")).toBeTruthy();
    expect(getByTestId("aic-error-message-1").textContent).toBe("Not Found");
    expect(getByTestId("aic-error-message-2").textContent).toBe("Render failed");
  });

  // ── 9. Shows severity badges ────────────────────────
  it("displays severity badges for each entry", () => {
    const errors: ErrorLogEntry[] = [
      {
        id: "10",
        timestamp: Date.now(),
        type: "API",
        message: "Server error",
        severity: "CRITICAL",
        scope: "API",
      },
    ];

    const { getByTestId } = render(<AICErrorDashboard errors={errors} />);

    const badge = getByTestId("aic-error-severity-badge-10");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe("CRITICAL");
  });

  // ── 10. Clear button works ──────────────────────────
  it("clear button clears all entries", async () => {
    // Seed some errors in the in-memory store
    const apiErr = normalizeToApiError(new Error("Seeded"), "API", "BASE_HTTP");
    logError(apiErr, { feature: "test" });

    const { getByTestId, queryByTestId } = render(<AICErrorDashboard />);

    // Should have an entry
    expect(getByTestId("aic-error-list")).toBeTruthy();

    // Click clear
    await act(async () => {
      fireEvent.click(getByTestId("aic-error-clear"));
    });

    expect(getByTestId("aic-error-empty")).toBeTruthy();
    expect(queryByTestId("aic-error-list")).toBeNull();
  });

  // ── 11. JSON detail popup opens on click ────────────
  it("opens JSON detail popup when entry is clicked", () => {
    const errors: ErrorLogEntry[] = [
      {
        id: "20",
        timestamp: Date.now(),
        type: "STATE",
        message: "Store error",
        severity: "ERROR",
        scope: "STATE",
        source: "STORE",
      },
    ];

    const { getByTestId, queryByTestId } = render(
      <AICErrorDashboard errors={errors} />,
    );

    // No popup initially
    expect(queryByTestId("aic-error-detail-popup")).toBeNull();

    // Click the entry
    fireEvent.click(getByTestId("aic-error-entry-20"));

    // Popup should appear
    expect(getByTestId("aic-error-detail-popup")).toBeTruthy();
    expect(getByTestId("aic-error-detail-json")).toBeTruthy();
    expect(getByTestId("aic-error-detail-json").textContent).toContain("Store error");
  });

  // ── 12. Detail popup closes on close button ─────────
  it("closes detail popup via close button", () => {
    const errors: ErrorLogEntry[] = [
      {
        id: "30",
        timestamp: Date.now(),
        type: "API",
        message: "Timeout",
        severity: "WARNING",
        scope: "API",
      },
    ];

    const { getByTestId, queryByTestId } = render(
      <AICErrorDashboard errors={errors} />,
    );

    // Open
    fireEvent.click(getByTestId("aic-error-entry-30"));
    expect(getByTestId("aic-error-detail-popup")).toBeTruthy();

    // Close
    fireEvent.click(getByTestId("aic-error-detail-close"));
    expect(queryByTestId("aic-error-detail-popup")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Core logic functions
// ═══════════════════════════════════════════════════════════════════════════

describe("AICError core logic", () => {
  // ── 13. normalizeToApiError handles Error objects ───
  it("normalizeToApiError converts Error to ApiError", () => {
    const err = new Error("Something broke");
    const result = normalizeToApiError(err, "API", "BASE_HTTP");

    expect(result.message).toBe("Something broke");
    expect(result.scope).toBe("API");
    expect(result.source).toBe("BASE_HTTP");
    expect(result.severity).toBe("ERROR");
    expect(result.code).toBe("UNKNOWN");
    expect(result.raw).toBe(err);
  });

  // ── 14. normalizeToApiError handles string errors ───
  it("normalizeToApiError converts string to ApiError", () => {
    const result = normalizeToApiError("string error");

    expect(result.message).toBe("string error");
    expect(result.scope).toBe("COMPONENT");
    expect(result.source).toBe("COMPONENT");
  });

  // ── 15. normalizeToApiError passes through ApiError ─
  it("normalizeToApiError passes through existing ApiError", () => {
    const existing: ApiError = {
      status: 404,
      code: "NOT_FOUND",
      message: "Resource not found",
      scope: "API",
      source: "HTTP_INTERCEPTOR",
    };

    const result = normalizeToApiError(existing);
    expect(result).toBe(existing);
  });

  // ── 16. isSuccessLikeError detects patterns ─────────
  it("isSuccessLikeError detects success patterns", () => {
    expect(isSuccessLikeError({ is_success: true })).toBe(true);
    expect(isSuccessLikeError({ status: "SUCCESS" })).toBe(true);
    expect(isSuccessLikeError({ response_code: "200" })).toBe(true);
    expect(isSuccessLikeError({ response_severity: "INFO" })).toBe(true);
    expect(isSuccessLikeError({ message: "Created successfully" })).toBe(true);
    expect(isSuccessLikeError({ message: "failed" })).toBe(false);
    expect(isSuccessLikeError(null)).toBe(false);
    expect(isSuccessLikeError("string")).toBe(false);
  });

  // ── 17. logError stores entries and caps at 100 ─────
  it("logError stores entries and respects 100 entry limit", () => {
    // Clear first
    clearAllErrors();

    for (let i = 0; i < 105; i++) {
      logError(
        {
          status: 500,
          code: "ERR",
          message: `Error ${i}`,
          scope: "API",
          source: "BASE_HTTP",
        },
        { feature: "test" },
      );
    }

    const recent = getRecentErrors();
    expect(recent.length).toBe(100);
    // Most recent should be last logged
    expect(recent[0].message).toBe("Error 104");
  });

  // ── 18. clearAllErrors empties the store ────────────
  it("clearAllErrors empties the store", () => {
    logError(
      {
        status: 400,
        code: "BAD",
        message: "bad request",
        scope: "API",
        source: "HTTP_INTERCEPTOR",
      },
    );

    expect(getRecentErrors().length).toBeGreaterThan(0);
    clearAllErrors();
    expect(getRecentErrors().length).toBe(0);
  });

  // ── 19. getErrorSeverityStyles returns correct styles
  it("getErrorSeverityStyles returns correct styles for each severity", () => {
    const errorStyles = getErrorSeverityStyles("ERROR");
    expect(errorStyles.bg).toBe("bg-red-50");
    expect(errorStyles.text).toBe("text-red-700");

    const warningStyles = getErrorSeverityStyles("WARNING");
    expect(warningStyles.bg).toBe("bg-yellow-50");

    const infoStyles = getErrorSeverityStyles("INFO");
    expect(infoStyles.bg).toBe("bg-blue-50");

    const defaultStyles = getErrorSeverityStyles("UNKNOWN");
    expect(defaultStyles.bg).toBe("bg-gray-50");
  });

  // ── 20. matchFormErrors maps details to controls ────
  it("matchFormErrors maps server error details to form controls", () => {
    const details = [
      { message: "Email is already taken", field: "email" },
      { message: "Password too short", field: "password" },
    ];

    const rules = [
      { pattern: "email.*taken", control: "emailField" },
      { pattern: "password.*short", control: "passwordField" },
    ];

    const result = matchFormErrors(details, rules);

    expect(result.emailField).toBe("Email is already taken");
    expect(result.passwordField).toBe("Password too short");
  });

  // ── 21. isApiError type guard ───────────────────────
  it("isApiError correctly identifies ApiError objects", () => {
    expect(isApiError({ scope: "API", source: "BASE_HTTP", message: "err" })).toBe(true);
    expect(isApiError({ message: "no scope" })).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError("string")).toBe(false);
    expect(isApiError(42)).toBe(false);
  });
});
