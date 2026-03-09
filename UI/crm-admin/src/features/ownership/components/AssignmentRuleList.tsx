"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon } from "@/components/ui";

import {
  useAssignmentRules,
  useDeleteAssignmentRule,
} from "../hooks/useOwnership";
import { testAssignmentRule } from "../services/ownership.service";
import type { AssignmentRule, AssignmentRuleStatus } from "../types/ownership.types";

// ── Status badge mapping ───────────────────────────────────

const STATUS_VARIANT: Record<AssignmentRuleStatus, string> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  DRAFT: "warning",
};

const STATUS_LABEL: Record<AssignmentRuleStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DRAFT: "Draft",
};

// ── Method labels ──────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  ROUND_ROBIN: "Round Robin",
  RULE_BASED: "Rule Based",
  WORKLOAD_BALANCE: "Workload Balance",
  ESCALATION: "Escalation",
  AUTO_REVERT: "Auto Revert",
};

// ── Entity type labels ─────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  LEAD: "Lead",
  CONTACT: "Contact",
  ORGANIZATION: "Organization",
  QUOTATION: "Quotation",
  TICKET: "Ticket",
  RAW_CONTACT: "Raw Contact",
  PRODUCT: "Product",
};

// ── Date formatter ─────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Rule row ───────────────────────────────────────────────

function RuleRow({
  rule,
  onDelete,
  onTest,
  isTesting,
}: {
  rule: AssignmentRule;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  isTesting: boolean;
}) {
  return (
    <tr>
      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            {rule.name}
          </p>
          {rule.description && (
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: "2px 0 0 0",
              }}
            >
              {rule.description}
            </p>
          )}
        </div>
      </td>
      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {ENTITY_LABELS[rule.entityType] ?? rule.entityType}
        </span>
      </td>
      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {METHOD_LABELS[rule.assignmentMethod] ?? rule.assignmentMethod}
        </span>
      </td>
      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <Badge variant={STATUS_VARIANT[rule.status] as any}>
          {STATUS_LABEL[rule.status]}
        </Badge>
      </td>
      <td
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #f3f4f6",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
          {rule.priority}
        </span>
      </td>
      <td
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #f3f4f6",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {rule.executionCount}
        </span>
      </td>
      <td style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(rule.id)}
            disabled={isTesting}
          >
            <Icon name="play" size={14} />
            Test
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(rule.id)}
          >
            <Icon name="trash-2" size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Component ──────────────────────────────────────────────

export function AssignmentRuleList() {
  const { data, isLoading, isError } = useAssignmentRules();
  const deleteMut = useDeleteAssignmentRule();
  const [testingId, setTestingId] = useState<string | null>(null);

  const rules = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("Rule deleted"),
      onError: () => toast.error("Failed to delete rule"),
    });
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await testAssignmentRule(id);
      toast.success(`Test completed successfully`);
      console.log("Test result:", result);
    } catch {
      toast.error("Rule test failed");
    } finally {
      setTestingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
        Loading assignment rules...
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
        Failed to load assignment rules.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            Assignment Rules
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
            Manage automated assignment rules for entities
          </p>
        </div>

        <Badge variant="secondary">{rules.length} rules</Badge>
      </div>

      {/* Table */}
      {rules.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 14,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <Icon name="settings" size={32} />
          <p style={{ marginTop: 8 }}>No assignment rules configured.</p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Name",
                    "Entity Type",
                    "Method",
                    "Status",
                    "Priority",
                    "Executions",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: h === "Priority" || h === "Executions" ? "center" : "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onDelete={handleDelete}
                    onTest={handleTest}
                    isTesting={testingId === rule.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
