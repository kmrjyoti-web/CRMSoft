"use client";
import {
  usePendingVerifications,
  useResendVerification,
} from "../hooks/useEntityVerification";

export function PendingVerificationsTable() {
  const { data: records, isLoading, refetch } = usePendingVerifications();
  const resend = useResendVerification();

  const handleResend = async (recordId: string) => {
    await resend.mutateAsync(recordId);
    refetch();
  };

  if (isLoading)
    return (
      <div style={{ padding: 24, color: "#9ca3af", textAlign: "center" }}>
        Loading\u2026
      </div>
    );
  if (!records?.length)
    return (
      <div style={{ padding: 24, color: "#9ca3af", textAlign: "center" }}>
        No pending verifications.
      </div>
    );

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {[
              "Entity",
              "Type",
              "Mode",
              "Channel",
              "Sent At",
              "Expires",
              "Action",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const expiry =
              r.mode === "OTP" ? r.otpExpiresAt : r.linkExpiresAt;
            const isExpiringSoon =
              expiry &&
              new Date(expiry).getTime() - Date.now() < 30 * 60 * 1000;
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                  {r.entityName ?? r.entityId}
                </td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>
                  {r.entityType}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      background:
                        r.mode === "OTP" ? "#e0f2fe" : "#f3e8ff",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {r.mode}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>
                  {r.channel}
                </td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    color: isExpiringSoon ? "#ef4444" : "#6b7280",
                  }}
                >
                  {expiry ? new Date(expiry).toLocaleString() : "\u2014"}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <button
                    onClick={() => handleResend(r.id)}
                    disabled={resend.isPending}
                    style={{
                      padding: "4px 12px",
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Resend
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
