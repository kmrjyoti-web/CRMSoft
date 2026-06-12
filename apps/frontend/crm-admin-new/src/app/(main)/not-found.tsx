"use client";

import { Button, Card, Icon } from "@/components/ui";

export default function NotFound() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "24px" }}>
      <Card>
        <div style={{ padding: "48px", textAlign: "center", maxWidth: "480px" }}>
          <div style={{ marginBottom: "16px", color: "#6b7280" }}>
            <Icon name="search" size={48} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700 }}>404</h2>
          <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>Page Not Found</h3>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#6b7280" }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button variant="primary" onClick={() => window.location.href = "/dashboard"}>
              <Icon name="home" size={16} /> Go to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => window.history.back()}>
              <Icon name="arrow-left" size={16} /> Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
