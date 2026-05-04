"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { VerifyModal } from "./VerifyModal";
import { useVerificationStatus } from "../hooks/useEntityVerification";
import type { EntityVerifStatus } from "../types/entity-verification.types";

interface VerifyButtonProps {
  entityType: string;
  entityId: string;
  entityName: string;
  entityEmail?: string | null;
  entityPhone?: string | null;
  initialStatus?: string;
  onVerified?: () => void;
}

export function VerifyButton({
  entityType,
  entityId,
  entityName,
  entityEmail,
  entityPhone,
  initialStatus = "UNVERIFIED",
  onVerified,
}: VerifyButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: statusData, refetch } = useVerificationStatus(
    entityType,
    entityId
  );

  const statusObj = statusData as { verificationStatus?: string } | undefined;
  const status = (statusObj?.verificationStatus ?? initialStatus) as EntityVerifStatus;

  const handleVerified = () => {
    refetch();
    onVerified?.();
  };

  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <VerificationStatusBadge status={status} />
        {status !== "VERIFIED" && (
          <button
            onClick={() => setOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <Icon name="shield-check" size={12} />
            Verify
          </button>
        )}
      </div>

      {open && (
        <VerifyModal
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          entityEmail={entityEmail}
          entityPhone={entityPhone}
          currentStatus={status}
          onClose={() => setOpen(false)}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}
