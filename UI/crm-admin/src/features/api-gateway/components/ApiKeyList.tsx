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
import type { ApiKey, ApiKeyWithSecret } from "../types/api-gateway.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ──────────────────────────────────────────────────────────────────


const STATUS_VARIANT: Record<string, "success" | "danger"> = {
  ACTIVE: "success",
  REVOKED: "danger",
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface ScopeBadgesProps {
  scopes: string[];
  max?: number;
}

function ScopeBadges({ scopes, max = 2 }: ScopeBadgesProps) {
  const visible = scopes.slice(0, max);
  const hidden = scopes.length - visible.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {visible.map((s) => (
        <Badge key={s} variant="secondary" style={{ fontSize: 11 }}>
          {s}
        </Badge>
      ))}
      {hidden > 0 && (
        <Badge variant="outline" style={{ fontSize: 11 }}>
          +{hidden}
        </Badge>
      )}
    </div>
  );
}

// ── Create Modal ──────────────────────────────────────────────────────────────

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateApiKeyModal({ open, onClose }: CreateApiKeyModalProps) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: scopesData } = useApiKeyScopes();
  const createMutation = useCreateApiKey();

  const scopes = useMemo(() => {
    const raw = scopesData?.data ?? scopesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [scopesData]);

  const toggleScope = (code: string) => {
    setSelectedScopes((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error("At least one scope is required");
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ name: name.trim(), scopes: selectedScopes });
      const secret = (result as any)?.data?.secret ?? (result as any)?.secret;
      if (secret) {
        setCreatedSecret(secret);
      }
      toast.success("API key created");
    } catch {
      toast.error("Failed to create API key");
    }
  };

  const handleCopy = () => {
    if (createdSecret) {
      navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Secret copied to clipboard");
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedScopes([]);
    setCreatedSecret(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={createdSecret ? "API Key Created" : "Create API Key"}
    >
      {createdSecret ? (
        <div style={{ padding: "8px 0" }}>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
            Copy your secret key now. It will not be shown again.
          </p>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <code
              style={{
                flex: 1,
                fontFamily: "monospace",
                fontSize: 13,
                wordBreak: "break-all",
                color: "#0f172a",
              }}
            >
              {createdSecret}
            </code>
            <Button size="sm" variant={copied ? "primary" : "outline"} onClick={handleCopy}>
              <Icon name={copied ? "check" : "copy"} size={14} />
            </Button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
          <Input
            label="Key Name"
            leftIcon={<Icon name="key" size={16} />}
            value={name}
            onChange={setName}
          />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
              Scopes
            </p>
            {scopes.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No scopes available</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {scopes.map((scope: any) => (
                  <label
                    key={scope.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: selectedScopes.includes(scope.code) ? "#eff6ff" : "#f8fafc",
                      border: `1px solid ${selectedScopes.includes(scope.code) ? "#bfdbfe" : "#e2e8f0"}`,
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope.code)}
                      onChange={() => toggleScope(scope.code)}
                    />
                    <span style={{ color: "#374151" }}>{scope.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <LoadingSpinner size="sm" /> : "Create Key"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ApiKeyList() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useApiKeys();
  const revokeMutation = useRevokeApiKey();
  const regenerateMutation = useRegenerateApiKey();

  const apiKeys = useMemo(() => {
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
    if (!confirm(`Regenerate API key "${name}"? The old key will stop working immediately.`)) return;
    try {
      await regenerateMutation.mutateAsync(id);
      toast.success("API key regenerated — check your new secret");
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
            Manage API keys for external integrations
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
              {["Name", "Key Prefix", "Scopes", "Status", "Last Used", "Created", "Actions"].map(
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
            {apiKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  No API keys found. Create one to get started.
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr
                  key={key.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "12px 14px", fontSize: 14, color: "#1e293b", fontWeight: 500 }}>
                    {key.name}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 4,
                        color: "#475569",
                      }}
                    >
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <ScopeBadges scopes={key.scopes} />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge variant={STATUS_VARIANT[key.status] ?? "secondary"}>
                      {key.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {formatDate(key.lastUsedAt)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {formatDate(key.createdAt)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {key.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRevoke(key.id, key.name)}
                          disabled={revokeMutation.isPending}
                        >
                          <Icon name="x-circle" size={14} />
                          Revoke
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerate(key.id, key.name)}
                        disabled={regenerateMutation.isPending}
                      >
                        <Icon name="refresh" size={14} />
                        Regenerate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateApiKeyModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
