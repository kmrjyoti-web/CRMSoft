"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useApiKeys,
  useApiKeyScopes,
  useCreateApiKey,
  useRevokeApiKey,
  useRegenerateApiKey,
} from "../hooks/useApiGateway";
import type {
  ApiKey,
  ApiScope,
  ApiKeyWithSecret,
  CreateApiKeyDto,
} from "../types/api-gateway.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ──────────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard"),
      () => toast.error("Failed to copy")
    );
  }
}

// ── Secret Reveal Modal ──────────────────────────────────────────────────────

interface SecretRevealModalProps {
  secret: string | null;
  onClose: () => void;
}

function SecretRevealModal({ secret, onClose }: SecretRevealModalProps) {
  return (
    <Modal open={!!secret} onClose={onClose} title="API Key Secret">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
        <p style={{ fontSize: 13, color: "#b91c1c", fontWeight: 500, margin: 0 }}>
          This secret will be shown only once. Copy it now and store it securely.
        </p>
        <div
          style={{
            padding: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 13,
            wordBreak: "break-all",
            color: "#0f172a",
          }}
        >
          {secret}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={() => secret && copyToClipboard(secret)}>
            <Icon name="copy" size={14} />
            Copy
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Create Key Modal ─────────────────────────────────────────────────────────

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (secret: string) => void;
}

function CreateKeyModal({ open, onClose, onCreated }: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");

  const { data: scopesData } = useApiKeyScopes();
  const createMutation = useCreateApiKey();

  const scopes = useMemo(() => {
    const raw = scopesData?.data ?? scopesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [scopesData]) as ApiScope[];

  const grouped = useMemo(() => {
    const map: Record<string, ApiScope[]> = {};
    scopes.forEach((s) => {
      const cat = s.category ?? "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [scopes]);

  const toggleScope = (code: string) => {
    setSelectedScopes((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  const reset = () => {
    setName("");
    setSelectedScopes([]);
    setExpiresAt("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error("At least one scope is required");
      return;
    }
    const dto: CreateApiKeyDto = {
      name: name.trim(),
      scopes: selectedScopes,
      expiresAt: expiresAt || undefined,
    };
    try {
      const res = await createMutation.mutateAsync(dto);
      const created = (res?.data ?? res) as ApiKeyWithSecret;
      toast.success("API key created");
      reset();
      onClose();
      if (created?.secret) onCreated(created.secret);
    } catch {
      toast.error("Failed to create API key");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create API Key">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
        <Input
          label="Name"
          leftIcon={<Icon name="tag" size={16} />}
          value={name}
          onChange={setName}
        />
        <Input
          label="Expires At (optional, ISO date)"
          leftIcon={<Icon name="calendar" size={16} />}
          value={expiresAt}
          onChange={setExpiresAt}
        />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
            Scopes
          </p>
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {Object.entries(grouped).map(([cat, catScopes]) => (
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
                  {catScopes.map((s) => (
                    <label
                      key={s.code}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: selectedScopes.includes(s.code) ? "#eff6ff" : "#f8fafc",
                        border: `1px solid ${
                          selectedScopes.includes(s.code) ? "#bfdbfe" : "#e2e8f0"
                        }`,
                        fontSize: 13,
                      }}
                      title={s.description}
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(s.code)}
                        onChange={() => toggleScope(s.code)}
                      />
                      <span style={{ color: "#374151" }}>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {scopes.length === 0 && (
              <p style={{ fontSize: 12, color: "#94a3b8" }}>No scopes available.</p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <LoadingSpinner size="sm" /> : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ApiKeyList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [revealSecret, setRevealSecret] = useState<string | null>(null);

  const { data, isLoading } = useApiKeys();
  const revokeMutation = useRevokeApiKey();
  const regenMutation = useRegenerateApiKey();

  const keys = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as ApiKey[];

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    try {
      await revokeMutation.mutateAsync(id);
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const handleRegenerate = async (id: string, name: string) => {
    if (!confirm(`Regenerate API key "${name}"? The old secret will stop working immediately.`))
      return;
    try {
      const res = await regenMutation.mutateAsync(id);
      const regenerated = (res?.data ?? res) as ApiKeyWithSecret;
      toast.success("API key regenerated");
      if (regenerated?.secret) setRevealSecret(regenerated.secret);
    } catch {
      toast.error("Failed to regenerate API key");
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
            API Keys
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Create and manage API keys for programmatic access
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Icon name="plus" size={16} />
          Create API Key
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
              {["Name", "Prefix", "Scopes", "Status", "Last Used", "Expires", "Created", "Actions"].map(
                (h) => (
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
                )
              )}
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 14,
                  }}
                >
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr
                  key={k.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                    {k.name}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "monospace", color: "#3b82f6" }}>
                    {k.keyPrefix}…
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge variant="secondary">{k.scopes.length} scopes</Badge>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge variant={k.status === "ACTIVE" ? "success" : "danger"}>
                      {k.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {k.lastUsedAt ? formatDate(k.lastUsedAt) : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {k.expiresAt ? formatDate(k.expiresAt) : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {formatDate(k.createdAt)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerate(k.id, k.name)}
                        disabled={k.status !== "ACTIVE" || regenMutation.isPending}
                      >
                        <Icon name="refresh-cw" size={13} />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRevoke(k.id, k.name)}
                        disabled={k.status !== "ACTIVE" || revokeMutation.isPending}
                      >
                        <Icon name="trash" size={13} />
                        Revoke
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
      <CreateKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(secret) => setRevealSecret(secret)}
      />
      <SecretRevealModal
        secret={revealSecret}
        onClose={() => setRevealSecret(null)}
      />
    </div>
  );
}
