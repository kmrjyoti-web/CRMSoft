"use client";

import { Button, Card, Icon } from "@/components/ui";

interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorState({ message = "Failed to load data", onRetry }: QueryErrorStateProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 24px" }}>
      <Card>
        <div style={{ padding: "32px", textAlign: "center", maxWidth: "360px" }}>
          <div style={{ marginBottom: "12px", color: "#ef4444" }}>
            <Icon name="alert-circle" size={40} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>Error</h3>
          <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#6b7280" }}>{message}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <Icon name="refresh" size={16} /> Retry
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
