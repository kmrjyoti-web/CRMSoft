"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { Button, Icon } from "@/components/ui";

import { useConfirmDialog } from "./useConfirmDialog";
import { useBulkOperations } from "@/hooks/useBulkOperations";

interface BulkDeleteDialogProps {
  ids: string[];
  entityName?: string;
  action: (id: string) => Promise<unknown>;
  onComplete: (result: { succeeded: string[]; failed: string[] }) => void;
  onCancel?: () => void;
}

/**
 * Double-confirmation bulk delete:
 *   Step 1 — ConfirmDialog: "Delete N records?"
 *   Step 2 — Type "DELETE" in an input to confirm
 *
 * Usage: call `trigger()` to start the flow.
 * Render `<BulkDeleteDialogPortal />` in the parent.
 */
export function useBulkDeleteDialog({
  ids,
  entityName = "record",
  action,
  onComplete,
  onCancel,
}: BulkDeleteDialogProps) {
  const [step2Open, setStep2Open] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const { execute, isRunning, progress } = useBulkOperations();

  const trigger = async () => {
    const count = ids.length;
    if (count === 0) return;

    // Step 1
    const step1Ok = await confirm({
      title: `Delete ${count} ${entityName}${count !== 1 ? "s" : ""}`,
      message: `You are about to delete ${count} ${entityName}${count !== 1 ? "s" : ""}. This action cannot be undone. Proceed?`,
      type: "danger",
      confirmText: "Continue",
    });
    if (!step1Ok) {
      onCancel?.();
      return;
    }

    // Step 2
    setConfirmText("");
    setStep2Open(true);
  };

  const handleFinalConfirm = async () => {
    setStep2Open(false);
    const result = await execute(ids, action);
    const { succeeded, failed } = result;

    if (failed.length === 0) {
      toast.success(
        `${succeeded.length} ${entityName}${succeeded.length !== 1 ? "s" : ""} deleted successfully`,
      );
    } else if (succeeded.length === 0) {
      toast.error(`Failed to delete all ${entityName}s`);
    } else {
      toast.success(
        `${succeeded.length} deleted · ${failed.length} failed`,
      );
    }
    onComplete(result);
  };

  const handleCancel = () => {
    setStep2Open(false);
    setConfirmText("");
    onCancel?.();
  };

  function BulkDeleteDialogPortal() {
    return (
      <>
        <ConfirmDialogPortal />

        {step2Open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 28,
                width: 400,
                maxWidth: "90vw",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#dc2626", display: "flex" }}><Icon name="alert-triangle" size={20} /></span>
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Final confirmation</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                    {ids.length} {entityName}{ids.length !== 1 ? "s" : ""} will be deleted
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#374151", marginBottom: 16 }}>
                Type <strong>DELETE</strong> in the box below to confirm:
              </p>

              <input
                type="text"
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                style={{
                  width: "100%",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                  boxSizing: "border-box",
                  borderColor: confirmText === "DELETE" ? "#dc2626" : "#e5e7eb",
                }}
              />

              {/* Progress bar during execution */}
              {isRunning && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2 }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#dc2626",
                        borderRadius: 2,
                        transition: "width 0.3s ease",
                        width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, textAlign: "center" }}>
                    {progress.completed} / {progress.total}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <Button
                  variant="danger"
                  onClick={handleFinalConfirm}
                  disabled={confirmText !== "DELETE" || isRunning}
                  loading={isRunning}
                  style={{ flex: 1 }}
                >
                  <Icon name="trash-2" size={14} /> Delete {ids.length}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isRunning}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return { trigger, BulkDeleteDialogPortal, isRunning };
}
