/**
 * React AICError Boundary component.
 * Catches errors in the child component tree, logs them via the AICError
 * system, and renders a configurable fallback UI.
 *
 * Must be a class component (React limitation for error boundaries).
 *
 * Source: Angular AICError system.
 */

import React from "react";
import { normalizeToApiError, logError } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props & State
// ---------------------------------------------------------------------------

interface AICErrorBoundaryProps {
  /** Custom fallback UI. Can be a ReactNode or a render function receiving the error. */
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** Callback invoked when an error is caught. */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Children to render when no error is present. */
  children?: React.ReactNode;
}

interface AICErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class AICErrorBoundary extends React.Component<
  AICErrorBoundaryProps,
  AICErrorBoundaryState
> {
  static displayName = "AICErrorBoundary";

  state: AICErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): AICErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Normalize and log the error into the AICError system
    const apiError = normalizeToApiError(error, 'COMPONENT', 'GLOBAL_HANDLER');
    logError(apiError, { operation: 'COMPONENT_RENDER' });

    // Notify consumer
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render function fallback
      if (typeof this.props.fallback === 'function') {
        return (this.props.fallback as (error: Error) => React.ReactNode)(this.state.error);
      }

      // Static fallback node
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="p-6 border border-red-200 bg-red-50 rounded-lg text-center"
          data-testid="aic-error-fallback"
        >
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {this.state.error.message}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            data-testid="aic-error-retry"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
