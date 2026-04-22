"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useApprovalRules,
  useDeleteApprovalRule,
} from "../hooks/useApprovals";
import { ApprovalRuleForm } from "./ApprovalRuleForm";

import type { ApprovalRule } from "../types/approval.types";

// ── Styles ──────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e5e7eb",
};

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
};

// ── Component ───────────────────────────────────────────

export function ApprovalRuleList() {
  const { data, isLoading } = useApprovalRules();
  const deleteMutation = useDeleteApprovalRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editRule, setEditRule] = useState<ApprovalRule | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const rules: ApprovalRule[] = useMemo(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: ApprovalRule[] };
    return nested?.data ?? [];
  }, [data]);

  const handleEdit = (rule: ApprovalRule) => {
    setEditRule(rule);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditRule(undefined);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditRule(undefined);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Approval rule deleted");
      setConfirmDeleteId(null);
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
            Approval Rules
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            Configure which actions require maker-checker approval
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Icon name="plus" size={16} /> New Rule
        </Button>
      </div>

      {/* ── Table ── */}
      <div style={cardStyle}>
        {rules.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Icon name="inbox" size={40} style={{ color: "#d1d5db" }} />
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
              No approval rules configured yet
            </p>
            <Button variant="outline" onClick={handleCreate} style={{ marginTop: 12 }}>
              <Icon name="plus" size={16} /> Create First Rule
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Entity Type</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Checker Role</th>
                  <th style={thStyle}>Min Checkers</th>
                  <th style={thStyle}>Expiry (hrs)</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={tdStyle}>
                      <Badge variant="primary">{rule.entityType}</Badge>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500 }}>{rule.action}</span>
                    </td>
                    <td style={tdStyle}>{rule.checkerRole}</td>
                    <td style={tdStyle}>{rule.minCheckers}</td>
                    <td style={tdStyle}>{rule.expiryHours}h</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: rule.isActive ? "#22c55e" : "#9ca3af",
                            display: "inline-block",
                          }}
                        />
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 4,
                        }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(rule)}
                          style={{ padding: "4px 8px" }}
                        >
                          <Icon name="edit" size={14} />
                        </Button>
                        {confirmDeleteId === rule.id ? (
                          <>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(rule.id)}
                              loading={deleteMutation.isPending}
                              style={{ padding: "4px 8px", fontSize: 12 }}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ padding: "4px 8px", fontSize: 12 }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(rule.id)}
                            style={{ padding: "4px 8px" }}
                          >
                            <Icon name="trash-2" size={14} style={{ color: "#ef4444" }} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      <ApprovalRuleForm
        open={formOpen}
        onClose={handleCloseForm}
        rule={editRule}
      />
    </div>
  );
}
