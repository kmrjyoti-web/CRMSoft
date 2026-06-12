"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useIpRules, useAddIpRule, useRemoveIpRule } from "../hooks/useSecurity";
import type { IpAccessRule, IpRuleType } from "../types/security.types";
import { formatDate } from "@/lib/format-date";

// ── Add IP Rule Modal ──────────────────────────────────────────────────────────

interface AddIpRuleModalProps {
  open: boolean;
  onClose: () => void;
}

function AddIpRuleModal({ open, onClose }: AddIpRuleModalProps) {
  const [ruleType, setRuleType] = useState<IpRuleType>("WHITELIST");
  const [ipAddress, setIpAddress] = useState("");
  const [description, setDescription] = useState("");
  const addRule = useAddIpRule();

  const handleSubmit = async () => {
    const trimmed = ipAddress.trim();
    if (!trimmed) {
      toast.error("IP address is required");
      return;
    }
    try {
      await addRule.mutateAsync({
        ruleType,
        ipAddress: trimmed,
        description: description.trim() || undefined,
      });
      toast.success(`${ruleType === "WHITELIST" ? "Whitelist" : "Blacklist"} rule added`);
      handleClose();
    } catch {
      toast.error("Failed to add IP rule");
    }
  };

  const handleClose = () => {
    setRuleType("WHITELIST");
    setIpAddress("");
    setDescription("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add IP Rule">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Type toggle */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
            Rule Type
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["WHITELIST", "BLACKLIST"] as IpRuleType[]).map((t) => (
              <button
                key={t}
                onClick={() => setRuleType(t)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `2px solid ${ruleType === t ? (t === "WHITELIST" ? "#22c55e" : "#ef4444") : "#e2e8f0"}`,
                  background: ruleType === t ? (t === "WHITELIST" ? "#f0fdf4" : "#fef2f2") : "#fff",
                  color: ruleType === t ? (t === "WHITELIST" ? "#15803d" : "#dc2626") : "#6b7280",
                  fontWeight: ruleType === t ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t === "WHITELIST" ? "Whitelist (Allow)" : "Blacklist (Block)"}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="IP Address / CIDR"
          leftIcon={<Icon name="globe" size={16} />}
          value={ipAddress}
          onChange={setIpAddress}
          placeholder="e.g. 192.168.1.0/24 or 10.0.0.1"
        />
        <Input
          label="Description (optional)"
          leftIcon={<Icon name="file-text" size={16} />}
          value={description}
          onChange={setDescription}
          placeholder="e.g. Office network"
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={addRule.isPending}
          >
            {addRule.isPending ? <LoadingSpinner size="sm" /> : "Add Rule"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function IpRuleList() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useIpRules();
  const removeRule = useRemoveIpRule();

  const rules: IpAccessRule[] = Array.isArray((data as any)?.data)
    ? ((data as any).data as IpAccessRule[])
    : Array.isArray(data)
    ? (data as IpAccessRule[])
    : [];

  const handleRemove = async (id: string, ip: string) => {
    if (!confirm(`Remove IP rule for ${ip}?`)) return;
    try {
      await removeRule.mutateAsync(id);
      toast.success("IP rule removed");
    } catch {
      toast.error("Failed to remove IP rule");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const whitelisted = rules.filter((r) => r.ruleType === "WHITELIST");
  const blacklisted = rules.filter((r) => r.ruleType === "BLACKLIST");

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
            IP Access Rules
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Control which IP addresses can access the CRM. Whitelist to allow only specific IPs; blacklist to block specific IPs.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} />
          Add Rule
        </Button>
      </div>

      {/* Tables */}
      {rules.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "48px 24px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          No IP rules configured. All IPs are allowed by default.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Whitelist */}
          {whitelisted.length > 0 && (
            <IpRuleSection
              title="Whitelist"
              subtitle="These IPs are explicitly allowed"
              color="#22c55e"
              badgeVariant="success"
              rules={whitelisted}
              onRemove={handleRemove}
              removing={removeRule.isPending}
            />
          )}
          {/* Blacklist */}
          {blacklisted.length > 0 && (
            <IpRuleSection
              title="Blacklist"
              subtitle="These IPs are explicitly blocked"
              color="#ef4444"
              badgeVariant="danger"
              rules={blacklisted}
              onRemove={handleRemove}
              removing={removeRule.isPending}
            />
          )}
        </div>
      )}

      <AddIpRuleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

// ── Rule Section ───────────────────────────────────────────────────────────────

interface IpRuleSectionProps {
  title: string;
  subtitle: string;
  color: string;
  badgeVariant: "success" | "danger";
  rules: IpAccessRule[];
  onRemove: (id: string, ip: string) => void;
  removing: boolean;
}

function IpRuleSection({
  title,
  subtitle,
  color,
  badgeVariant,
  rules,
  onRemove,
  removing,
}: IpRuleSectionProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            {title}{" "}
            <span style={{ fontWeight: 400, color: "#64748b" }}>({rules.length})</span>
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["IP Address", "Description", "Type", "Added", ""].map((h) => (
              <th
                key={h}
                style={{
                  padding: "9px 14px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid #f1f5f9",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr
              key={rule.id}
              style={{ borderBottom: "1px solid #f8fafc" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "11px 14px" }}>
                <code style={{ fontFamily: "monospace", fontSize: 13, color: "#1e293b" }}>
                  {rule.ipAddress}
                </code>
              </td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>
                {rule.description || "—"}
              </td>
              <td style={{ padding: "11px 14px" }}>
                <Badge variant={badgeVariant}>{rule.ruleType}</Badge>
              </td>
              <td style={{ padding: "11px 14px", fontSize: 12, color: "#94a3b8" }}>
                {formatDate(rule.createdAt)}
              </td>
              <td style={{ padding: "11px 14px", textAlign: "right" }}>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={removing}
                  onClick={() => onRemove(rule.id, rule.ipAddress)}
                >
                  <Icon name="trash" size={13} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
