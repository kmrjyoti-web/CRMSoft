"use client";

import { useState } from "react";
import { activatePortalWithChannels } from "../services/customer-portal.service";
import type {
  ActivatePortalWithChannelsResponse,
  InviteChannel,
} from "../types/customer-portal.types";

type Props = {
  open: boolean;
  onClose: () => void;
  entityType: "CONTACT" | "ORGANIZATION" | "LEDGER";
  entityId: string;
  entityName: string;
  availableEmail?: string | null;
  availablePhone?: string | null;
  onSuccess?: (result: ActivatePortalWithChannelsResponse) => void;
};

const STATUS_BADGE: Record<string, string> = {
  SENT: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-200 text-green-900",
  QUEUED_AWAITING_PLUGIN_IMPL: "bg-yellow-100 text-yellow-800",
  SKIPPED: "bg-gray-200 text-gray-600",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-700",
};

export function PortalInviteDialog({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  availableEmail,
  availablePhone,
  onSuccess,
}: Props) {
  const [channels, setChannels] = useState<InviteChannel[]>(() =>
    availableEmail ? ["EMAIL"] : availablePhone ? ["WHATSAPP"] : [],
  );
  const [customMessage, setCustomMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ActivatePortalWithChannelsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleChannel = (channel: InviteChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  };

  const handleSubmit = async () => {
    if (channels.length === 0) {
      setError("Select at least one delivery channel");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await activatePortalWithChannels({
        entityType,
        entityId,
        channels,
        customMessage: customMessage.trim() || undefined,
      });
      setResult(response);
      onSuccess?.(response);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to send invite";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setCustomMessage("");
    setChannels(availableEmail ? ["EMAIL"] : availablePhone ? ["WHATSAPP"] : []);
    onClose();
  };

  if (!open) return null;

  const hasQueuedDelivery = result?.deliveries.some(
    (d) => d.status === "QUEUED_AWAITING_PLUGIN_IMPL",
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {result ? (
          <div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Portal Activated</h2>
            <p className="mb-4 text-sm text-gray-600">
              {entityName} has been given portal access. Credentials are below — share them
              manually if delivery is still pending.
            </p>

            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">Login</div>
              <div className="font-mono text-sm">{result.email}</div>
              <div className="mt-2 text-xs font-semibold uppercase text-gray-500">
                Temporary Password
              </div>
              <div className="font-mono text-sm">{result.tempPassword}</div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-sm font-semibold text-gray-700">Delivery Status</div>
              <div className="space-y-2">
                {result.deliveries.length === 0 && (
                  <div className="text-sm italic text-gray-500">No channels requested</div>
                )}
                {result.deliveries.map((d, i) => (
                  <div
                    key={`${d.channel}-${i}`}
                    className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm"
                  >
                    <span className="font-medium">
                      {d.channel === "EMAIL" ? "Email" : "WhatsApp"}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        STATUS_BADGE[d.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {hasQueuedDelivery && (
              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                Plugin delivery is pending implementation. Please share credentials manually
                for Day-1 onboarding.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Invite {entityName} to Portal
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Activate portal access and send credentials via selected channels.
            </p>

            <div className="mb-4">
              <div className="mb-2 text-sm font-semibold text-gray-700">Delivery Channels</div>

              <label className="mb-2 flex cursor-pointer items-center gap-3 rounded border border-gray-200 p-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={channels.includes("EMAIL")}
                  onChange={() => toggleChannel("EMAIL")}
                  disabled={!availableEmail}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Email</div>
                  <div className="text-xs text-gray-500">
                    {availableEmail || "No email on record — add email to enable"}
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded border border-gray-200 p-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={channels.includes("WHATSAPP")}
                  onChange={() => toggleChannel("WHATSAPP")}
                  disabled={!availablePhone}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-xs text-gray-500">
                    {availablePhone || "No phone on record — add phone to enable"}
                  </div>
                </div>
              </label>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Custom Message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Welcome to our customer portal..."
                maxLength={500}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {customMessage.length}/500
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || channels.length === 0}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending…" : `Send Invite (${channels.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
