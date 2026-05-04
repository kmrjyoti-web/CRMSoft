'use client';

import { AICErrorBoundary, AICErrorDashboard } from '@coreui/ui-react';

type ErrorBoundaryProps = React.ComponentProps<typeof AICErrorBoundary>;
type ErrorDashboardProps = React.ComponentProps<typeof AICErrorDashboard>;

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <AICErrorBoundary {...props} />;
}

export function ErrorDashboard(props: ErrorDashboardProps) {
  return <AICErrorDashboard {...props} />;
}
