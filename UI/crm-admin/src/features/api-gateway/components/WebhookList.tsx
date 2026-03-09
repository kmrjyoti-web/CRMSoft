"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useWebhooks,
  useWebhookEvents,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookDeliveries,
} from "../hooks/useApiGateway";
import type { Webhook, WebhookEvent, WebhookDelivery } from "../types/api-gateway.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateUrl(url: string, max = 50) {
  return url.length > max ? url.slice(0, max) + "..." : url;
}

// ── Deliveries Modal ──────────────────────────────────────────────────────────

interface DeliveriesModalProps {
  webhookId: string | null;
  onClose: () => void;
}

function DeliveriesModal({ webhookId, onClose }: DeliveriesModalProps) {
  const { data, isLoading } = useWebhookDeliveries(webhookId ?? "");

  const deliveries = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as WebhookDelivery[];

  return (
    <Modal open={!!webhookId} onClose={onClose} title="Webhook Deliveries">
      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>
          <LoadingSpinner />
        </div>
      ) : deliveries.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>No deliveries yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Event", "Status", "Code", "Duration", "Attempts", "Created"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#64748b",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>{d.eventType}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <Badge
                      variant={
                        d.status === "SUCCESS"
                          ? "success"
                          : d.status === "FAILURE"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>{d.statusCode ?? "—"}</td>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>
                    {d.duration != null ? `${d.duration}ms` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>{d.attempts}</td>
                  <td style={{ padding: "8px 12px", color: "#64748b" }}>{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

// ── Webhook Form Modal ────────────────────────────────────────────────────────

interface WebhookFormModalProps {
  open: boolean;
  onClose: () => void;
  editWebhook?: Webhook | null;
}

function WebhookFormModal({ open, onClose, editWebhook }: WebhookFormModalProps) {
  const [url, setUrl] = useState(editWebhook?.url ?? "");
  const [description, setDescription] = useState(editWebhook?.description ?? "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(editWebhook?.events ?? []);

  const { data: eventsData } = useWebhookEvents();
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();

  const events = useMemo(() => {
    const raw = eventsData?.data ?? eventsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [eventsData]) as WebhookEvent[];

  const toggleEvent = (code: string) => {
    setSelectedEvents((prev) =>
      prev.includes(code) ? prev.filter((e) => e !== code) : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("At least one event is required");
      return;
    }
    try {
      if (editWebhook) {
        await updateMutation.mutateAsync({
          id: editWebhook.id,
          dto: { url: url.trim(), description: description.trim() || undefined, events: selectedEvents },
        });
        toast.success("Webhook updated");
      } else {
        await createMutation.mutateAsync({
          url: url.trim(),
          description: description.trim() || undefined,
          events: selectedEvents,
        });
        toast.success("Webhook created");
      }
      handleClose();
    } catch {
      toast.error(`Failed to ${editWebhook ? "update" : "create"} webhook`);
    }
  };

  const handleClose = () => {
    setUrl(editWebhook?.url ?? "");
    setDescription(editWebhook?.description ?? "");
    setSelectedEvents(editWebhook?.events ?? []);
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Group events by category
  const grouped = useMemo(() => {
    const map: Record<string, WebhookEvent[]> = {};
    events.forEach((e) => {
      const cat = e.category ?? "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(e);
    });
    return map;
  }, [events]);

  return (
    <Modal open={open} onClose={handleClose} title={editWebhook ? "Edit Webhook" : "Create Webhook"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
        <Input
          label="Endpoint URL"
          leftIcon={<Icon name="link" size={16} />}
          value={url}
          onChange={setUrl}
        />
        <Input
          label="Description (optional)"
          leftIcon={<Icon name="file-text" size={16} />}
          value={description}
          onChange={setDescription}
        />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
            Events
          </p>
          <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(grouped).map(([cat, catEvents]) => (
              <div key={cat}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  {cat}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {catEvents.map((ev) => (
                    <label
                      key={ev.code}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: selectedEvents.includes(ev.code) ? "#eff6ff" : "#f8fafc",
                        border: `1px solid ${selectedEvents.includes(ev.code) ? "#bfdbfe" : "#e2e8f0"}`,
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev.code)}
                        onChange={() => toggleEvent(ev.code)}
                      />
                      <span style={{ color: "#374151" }}>{ev.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <LoadingSpinner size="sm" /> : editWebhook ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function WebhookList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editWebhook, setEditWebhook] = useState<Webhook | null>(null);
  const [deliveriesWebhookId, setDeliveriesWebhookId] = useState<string | null>(null);

  const { data, isLoading } = useWebhooks();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();

  const webhooks = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as Webhook[];

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(`Delete webhook for "${truncateUrl(url, 40)}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Webhook deleted");
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const handleTest = async (id: string) => {
    try {
      await testMutation.mutateAsync(id);
      toast.success("Test delivery sent");
    } catch {
      toast.error("Test delivery failed");
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Webhooks
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Receive real-time notifications for events
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Icon name="plus" size={16} />
          Create Webhook
        </Button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["URL", "Events", "Active", "Failures", "Last Delivery", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {webhooks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  No webhooks configured. Create one to receive event notifications.
                </td>
              </tr>
            ) : (
              webhooks.map((wh) => (
                <tr
                  key={wh.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", maxWidth: 280 }}>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#3b82f6",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                      title={wh.url}
                    >
                      {truncateUrl(wh.url, 60)}
                    </span>
                    {wh.description && (
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {wh.description}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge variant="secondary">{wh.events.length} events</Badge>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: wh.isActive ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                    {wh.failureCount ?? 0}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {formatDate(wh.lastDeliveryAt)}
                    {wh.lastDeliveryStatus && (
                      <Badge
                        variant={wh.lastDeliveryStatus === "SUCCESS" ? "success" : "danger"}
                        style={{ marginLeft: 6, fontSize: 11 }}
                      >
                        {wh.lastDeliveryStatus}
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditWebhook(wh)}
                      >
                        <Icon name="edit" size={13} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTest(wh.id)}
                        disabled={testMutation.isPending}
                      >
                        <Icon name="send" size={13} />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setDeliveriesWebhookId(wh.id)}
                      >
                        <Icon name="list" size={13} />
                        Deliveries
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(wh.id, wh.url)}
                        disabled={deleteMutation.isPending}
                      >
                        <Icon name="trash" size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <WebhookFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      {editWebhook && (
        <WebhookFormModal
          open={!!editWebhook}
          editWebhook={editWebhook}
          onClose={() => setEditWebhook(null)}
        />
      )}
      <DeliveriesModal
        webhookId={deliveriesWebhookId}
        onClose={() => setDeliveriesWebhookId(null)}
      />
    </div>
  );
}
