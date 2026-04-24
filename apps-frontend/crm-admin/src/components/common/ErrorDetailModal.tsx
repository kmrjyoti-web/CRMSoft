"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Icon, Modal, Badge } from "@/components/ui";
import type { ParsedApiError } from "@/lib/api-error-handler";
import { onApiError } from "@/lib/api-error-handler";
import apiClient from "@/services/api-client";

// ── Level config ────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; title: string }> = {
  VALIDATION: { icon: "alert-triangle", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", title: "Validation Error" },
  WARNING:    { icon: "copy",           color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", title: "Duplicate Found" },
  ERROR:      { icon: "x-circle",       color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    title: "Error" },
  CRITICAL:   { icon: "alert-octagon",  color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300",    title: "Critical Error" },
  AUTH:       { icon: "lock",           color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200",   title: "Access Denied" },
};

// ── Component ───────────────────────────────────────────

interface ErrorDetailModalProps {
  /** Controlled mode — pass error directly */
  error?: ParsedApiError | null;
  open?: boolean;
  onClose?: () => void;
  /** For duplicates: force create despite warning */
  onForceCreate?: () => void;
}

/**
 * Shared error modal that handles all 5 error levels.
 * Can be used in two modes:
 * 1. Controlled: pass `error`, `open`, `onClose` props
 * 2. Global: mount once in layout — auto-listens via onApiError()
 */
export function ErrorDetailModal({
  error: controlledError,
  open: controlledOpen,
  onClose: controlledOnClose,
  onForceCreate,
}: ErrorDetailModalProps) {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<ParsedApiError | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Subscribe to global error events (uncontrolled mode)
  useEffect(() => {
    if (controlledError !== undefined) return; // controlled mode, skip
    return onApiError((err) => {
      setGlobalError(err);
      setShowRaw(false);
    });
  }, [controlledError]);

  const error = controlledError ?? globalError;
  const isOpen = controlledOpen ?? !!globalError;
  const handleClose = useCallback(() => {
    if (controlledOnClose) controlledOnClose();
    else setGlobalError(null);
    setShowRaw(false);
  }, [controlledOnClose]);

  if (!error) return null;

  const cfg = LEVEL_CONFIG[error.level] ?? LEVEL_CONFIG.ERROR;

  // Copy full error for reporting
  const copyErrorDetails = () => {
    const body = [
      `Error: ${cfg.title}`,
      `Code: ${error.code}`,
      `Message: ${error.message}`,
      error.suggestion ? `Suggestion: ${error.suggestion}` : "",
      "",
      error.fieldErrors.length > 0 ? "Field Errors:" : "",
      ...error.fieldErrors.map((d) => `  - ${d.field}: ${d.message}`),
      "",
      `Error ID: ${error.errorId ?? "N/A"}`,
      `Status: ${error.statusCode}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `User Agent: ${navigator.userAgent}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(body);
    toast.success("Error details copied to clipboard");
  };

  // Report to vendor
  const reportToVendor = async () => {
    setIsReporting(true);
    try {
      await apiClient.post("/api/v1/errors/frontend", {
        errorCode: error.code,
        message: `[USER REPORTED] ${error.message}`,
        stack: error.stackTrace,
        url: window.location.href,
        component: "ErrorDetailModal",
        userAction: "Report to Vendor",
        metadata: {
          level: error.level,
          fieldErrors: error.fieldErrors,
          errorId: error.errorId,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
        },
      });
      toast.success("Error reported successfully");
    } catch {
      toast.error("Failed to send report — please contact support");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={cfg.title}
      size={error.level === "CRITICAL" ? "lg" : "md"}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={copyErrorDetails}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Icon name="copy" size={14} />
            Copy for Report
          </button>
          <div className="flex items-center gap-2">
            {/* Duplicate: force create */}
            {error.level === "WARNING" && error.duplicate?.allowForceCreate && onForceCreate && (
              <Button variant="outline" onClick={() => { onForceCreate(); handleClose(); }}>
                Create Anyway
              </Button>
            )}
            {/* Critical: report to vendor */}
            {error.level === "CRITICAL" && (
              <Button
                variant="danger"
                onClick={reportToVendor}
                loading={isReporting}
                disabled={isReporting}
              >
                <Icon name="send" size={14} /> Report to Vendor
              </Button>
            )}
            <Button variant="primary" onClick={handleClose}>
              {error.level === "VALIDATION" ? "Fix Errors" : "OK"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* ── Summary banner ── */}
        <div className={`flex items-start gap-3 rounded-lg ${cfg.bg} border ${cfg.border} p-3`}>
          <Icon name={cfg.icon as any} size={20} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
          <div>
            <p className={`text-sm font-medium ${cfg.color}`}>{error.message}</p>
            {error.suggestion && (
              <p className="text-xs text-gray-500 mt-1">{error.suggestion}</p>
            )}
          </div>
        </div>

        {/* ── Duplicate info (LEVEL 2) ── */}
        {error.duplicate && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs font-medium text-orange-700 mb-2">Existing record found:</p>
            <div className="flex items-center justify-between bg-white rounded border border-orange-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{error.duplicate.existingEntityName}</p>
                <p className="text-xs text-gray-500">
                  {error.duplicate.existingEntityType} — {error.duplicate.field}: {error.duplicate.value}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const type = error.duplicate!.existingEntityType.toLowerCase();
                  router.push(`/${type}s/${error.duplicate!.existingEntityId}`);
                  handleClose();
                }}
                className="text-xs text-orange-600 hover:underline flex-shrink-0"
              >
                View Existing
              </button>
            </div>
          </div>
        )}

        {/* ── Field-level errors ── */}
        {error.fieldErrors.length > 0 ? (
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            {error.fieldErrors.map((fe, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{fe.field}</p>
                  <p className="text-xs text-gray-500">
                    {fe.message}
                    {fe.value !== undefined && fe.value !== null && (
                      <span className="text-red-400"> (got: &quot;{String(fe.value as string)}&quot;)</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* ── Help link ── */}
        {error.helpUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <Icon name="info" size={16} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs text-blue-700 flex-1">{error.suggestion}</span>
            <button
              type="button"
              onClick={() => { router.push(error.helpUrl!); handleClose(); }}
              className="text-xs text-blue-600 hover:underline flex-shrink-0"
            >
              Go There
            </button>
          </div>
        )}

        {/* ── Error ID (critical) ── */}
        {error.errorId && error.level === "CRITICAL" && (
          <p className="text-xs text-gray-400">
            Error ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{error.errorId}</code>
          </p>
        )}

        {/* ── Technical details (collapsible) ── */}
        {error.raw != null ? (
          <div>
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showRaw ? "chevron-down" : "chevron-right"} size={12} />
              Technical Details
            </button>
            {showRaw && (
              <pre className="mt-1.5 rounded bg-gray-50 border border-gray-200 p-2 text-[11px] text-gray-600 overflow-x-auto max-h-40">
                {JSON.stringify(error.raw, null, 2)}
              </pre>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
