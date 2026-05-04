"use client";

import { useEffect } from "react";
import { Button, Card, Icon } from "@/components/ui";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Layout error:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "24px" }}>
      <Card>
        <div style={{ padding: "48px", textAlign: "center", maxWidth: "480px" }}>
          <div style={{ marginBottom: "16px", color: "#ef4444" }}>
            <Icon name="alert-triangle" size={48} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#6b7280" }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre style={{ margin: "0 0 24px", padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "12px", color: "#ef4444", textAlign: "left", overflow: "auto", maxHeight: "120px" }}>
              {error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button variant="primary" onClick={reset}>
              <Icon name="refresh" size={16} /> Try Again
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
