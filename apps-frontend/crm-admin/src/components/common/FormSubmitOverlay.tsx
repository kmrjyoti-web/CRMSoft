"use client";

import { Icon } from "@/components/ui";

interface FormSubmitOverlayProps {
  isSubmitting: boolean;
  isEdit?: boolean;
}

/**
 * Absolute-positioned overlay that blocks the form during submission.
 * Place inside a `position: relative` container wrapping the form.
 */
export function FormSubmitOverlay({ isSubmitting, isEdit }: FormSubmitOverlayProps) {
  if (!isSubmitting) return null;

  const label = isEdit ? "Updating..." : "Saving...";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.88)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        backdropFilter: "blur(2px)",
      }}
    >
      {/* Spinner */}
      <span className="crm-spinner" style={{ display: "inline-flex", marginBottom: 16 }}>
        <Icon name="loader" size={32} />
      </span>

      {/* Skeleton lines */}
      <div style={{ width: "60%", maxWidth: 260 }}>
        <div
          className="animate-pulse bg-gray-200 rounded"
          style={{ height: 8, marginBottom: 8 }}
        />
        <div
          className="animate-pulse bg-gray-200 rounded"
          style={{ height: 8, width: "80%", marginBottom: 8 }}
        />
        <div
          className="animate-pulse bg-gray-200 rounded"
          style={{ height: 8, width: "55%" }}
        />
      </div>

      {/* Status text */}
      <p
        style={{
          marginTop: 14,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-primary, #1e5f74)",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </p>
    </div>
  );
}
