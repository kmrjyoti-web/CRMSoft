"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Card, Icon, Input, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApproveGst } from "../hooks/useVerification";

// ── Styles ────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: 24,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "24px 28px",
  background: "#fff",
  marginBottom: 20,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 6,
};

const infoBoxStyle: React.CSSProperties = {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: 8,
  padding: "12px 16px",
  fontSize: 13,
  color: "#1d4ed8",
  marginBottom: 20,
  lineHeight: 1.6,
};

const fieldRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 12,
  marginTop: 16,
};

const stepStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  marginBottom: 10,
  background: "#f9fafb",
};

// ── Admin Approve Tool ─────────────────────────────────────

function ApproveGstTool() {
  const [userId, setUserId] = useState("");
  const approveGst = useApproveGst();

  const handleApprove = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }
    try {
      await approveGst.mutateAsync(userId.trim());
      toast.success(`GST approved for user: ${userId}`);
      setUserId("");
    } catch {
      toast.error("Failed to approve GST. Check the User ID and try again.");
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <Icon name="check-circle" size={20} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Approve GST Verification</h3>
        <Badge variant="warning">Admin Only</Badge>
      </div>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 0 }}>
        Enter the User ID of the user whose GST submission you want to approve.
      </p>

      <div style={fieldRowStyle}>
        <div style={{ flex: 1 }}>
          <Input
            label="User ID"
            value={userId}
            onChange={setUserId}
            leftIcon={<Icon name="user" size={16} />}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleApprove}
          disabled={approveGst.isPending || !userId.trim()}
        >
          {approveGst.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon name="check" size={14} />
          )}
          Approve GST
        </Button>
      </div>
    </div>
  );
}

// ── Workflow Info ──────────────────────────────────────────

function WorkflowSteps() {
  const steps = [
    { icon: "user", label: "User submits GST number and business name via their account verification page." },
    { icon: "bell", label: "System sets GST status to PENDING and notifies admin." },
    { icon: "eye", label: "Admin reviews the submission (externally or via documents)." },
    { icon: "check-circle", label: "Admin uses the tool above to approve or re-verify pending GST." },
    { icon: "shield", label: "User's account is upgraded to VERIFIED status upon approval." },
  ];

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <Icon name="list" size={20} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>GST Approval Workflow</h3>
      </div>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 14 }}>
        How the GST verification process works end-to-end:
      </p>
      {steps.map((step, idx) => (
        <div key={idx} style={stepStyle}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#3b82f6",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {idx + 1}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name={step.icon as "user"} size={15} />
            <span style={{ fontSize: 13, color: "#374151" }}>{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function VerificationAdmin() {
  return (
    <div style={panelStyle}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Icon name="shield" size={24} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>GST Verification Admin</h2>
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Review and approve pending GST verifications for users.
        </p>
      </div>

      {/* Info Notice */}
      <div style={infoBoxStyle}>
        <strong>Note:</strong> This admin tool allows you to approve GST submissions by User ID.
        A dedicated verification queue listing all pending users will be available once the list endpoint is implemented.
        For now, use this form to approve GST for individual users after manual review.
      </div>

      {/* Approve Tool */}
      <ApproveGstTool />

      {/* Workflow Steps */}
      <WorkflowSteps />
    </div>
  );
}
