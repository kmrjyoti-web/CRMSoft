"use client";

import { useState, useCallback } from "react";

import { Modal, Button, Input, DatePicker, Icon } from "@/components/ui";

import { useSnoozeFollowUp } from "../hooks/useFollowUps";

// ── Props ───────────────────────────────────────────────

interface SnoozeModalProps {
  open: boolean;
  onClose: () => void;
  followUpId: string;
}

// ── Helpers ─────────────────────────────────────────────

function addHours(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

// ── Component ───────────────────────────────────────────

export function SnoozeModal({ open, onClose, followUpId }: SnoozeModalProps) {
  const snoozeMutation = useSnoozeFollowUp();
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSnooze = useCallback(
    (snoozedUntil: string) => {
      snoozeMutation.mutate(
        {
          id: followUpId,
          dto: {
            snoozedUntil,
            reason: reason.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            setShowCustom(false);
            setCustomDate("");
            setReason("");
            onClose();
          },
        },
      );
    },
    [followUpId, reason, snoozeMutation, onClose],
  );

  const handleCustomSnooze = () => {
    if (!customDate) return;
    handleSnooze(new Date(customDate).toISOString());
  };

  return (
    <Modal open={open} onClose={onClose} title="Snooze Follow-up">
      <div style={{ padding: 16 }}>
        {/* Quick options */}
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16, marginTop: 0 }}>
          Choose when to be reminded:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <Button
            variant="outline"
            onClick={() => handleSnooze(addHours(4))}
            disabled={snoozeMutation.isPending}
            style={{ justifyContent: "flex-start" }}
          >
            <Icon name="clock" size={16} />
            <span style={{ marginLeft: 8 }}>Later Today (+4 hours)</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSnooze(addDays(1))}
            disabled={snoozeMutation.isPending}
            style={{ justifyContent: "flex-start" }}
          >
            <Icon name="sun" size={16} />
            <span style={{ marginLeft: 8 }}>Tomorrow</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSnooze(addDays(7))}
            disabled={snoozeMutation.isPending}
            style={{ justifyContent: "flex-start" }}
          >
            <Icon name="calendar" size={16} />
            <span style={{ marginLeft: 8 }}>Next Week</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCustom(!showCustom)}
            disabled={snoozeMutation.isPending}
            style={{ justifyContent: "flex-start" }}
          >
            <Icon name="settings" size={16} />
            <span style={{ marginLeft: 8 }}>Custom</span>
          </Button>
        </div>

        {/* Custom date picker */}
        {showCustom && (
          <div style={{ marginBottom: 16 }}>
            <DatePicker
              label="Snooze Until"
              value={customDate}
              onChange={(v: string) => setCustomDate(v)}
            />
          </div>
        )}

        {/* Optional reason */}
        <Input
          label="Reason (optional)"
          value={reason}
          onChange={(val: string) => setReason(val)}
          leftIcon={<Icon name="message-square" size={16} />}
        />

        {/* Actions */}
        {showCustom && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button variant="ghost" onClick={onClose} disabled={snoozeMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCustomSnooze}
              disabled={!customDate || snoozeMutation.isPending}
            >
              {snoozeMutation.isPending ? "Snoozing..." : "Snooze"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
