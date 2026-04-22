"use client";

import dynamic from "next/dynamic";

const PendingVerificationsTable = dynamic(
  () =>
    import("@/features/entity-verification").then((m) => ({
      default: m.PendingVerificationsTable,
    })),
  { ssr: false }
);

export default function VerificationsPage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Pending Verifications
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          All entities awaiting verification — OTP sent or link pending.
        </p>
      </div>
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <PendingVerificationsTable />
      </div>
    </div>
  );
}
