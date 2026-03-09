"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useVendors,
  useApproveVendor,
  useSuspendVendor,
} from "../hooks/useMarketplace";
import type { MarketplaceVendor } from "../types/marketplace.types";

// ── Status helpers ────────────────────────────────────────────────────────────

type BadgeVariant = "warning" | "success" | "danger" | "secondary";

function vendorStatusVariant(status: MarketplaceVendor["status"]): BadgeVariant {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "SUSPENDED":
      return "danger";
    default:
      return "secondary";
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

// ── Table styles ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function VendorList() {
  const { data, isLoading } = useVendors();
  const approveMutation = useApproveVendor();
  const suspendMutation = useSuspendVendor();
  const [actionId, setActionId] = useState<string | null>(null);

  const vendors = useMemo<MarketplaceVendor[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleApprove = async (vendor: MarketplaceVendor) => {
    setActionId(vendor.id);
    try {
      await approveMutation.mutateAsync(vendor.id);
      toast.success(`Vendor "${vendor.name}" approved`);
    } catch {
      toast.error("Failed to approve vendor");
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (vendor: MarketplaceVendor) => {
    if (!window.confirm(`Suspend vendor "${vendor.name}"?`)) return;
    setActionId(vendor.id);
    try {
      await suspendMutation.mutateAsync(vendor.id);
      toast.success(`Vendor "${vendor.name}" suspended`);
    } catch {
      toast.error("Failed to suspend vendor");
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name="briefcase" size={18} color="#6366f1" />
        <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
          Vendors
        </span>
        <Badge variant="secondary" style={{ marginLeft: "auto" }}>
          {vendors.length}
        </Badge>
      </div>

      {vendors.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
          <div style={{ marginBottom: 10 }}>
            <Icon name="briefcase" size={40} color="#9ca3af" />
          </div>
          <p style={{ margin: 0 }}>No vendors registered yet</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Modules</th>
                <th style={thStyle}>Joined</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "#ede9fe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="briefcase" size={16} color="#7c3aed" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{vendor.name}</div>
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 12, color: "#6366f1" }}
                          >
                            {vendor.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <a
                      href={`mailto:${vendor.email}`}
                      style={{ color: "#6366f1", textDecoration: "none" }}
                    >
                      {vendor.email}
                    </a>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={vendorStatusVariant(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: "#111827", fontSize: 15 }}>
                      {vendor.moduleCount ?? 0}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatDate(vendor.createdAt)}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {vendor.status === "PENDING" && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionId === vendor.id}
                          onClick={() => handleApprove(vendor)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="check" size={14} />
                            Approve
                          </span>
                        </Button>
                      )}
                      {vendor.status === "APPROVED" && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={actionId === vendor.id}
                          onClick={() => handleSuspend(vendor)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="pause" size={14} />
                            Suspend
                          </span>
                        </Button>
                      )}
                      {vendor.status === "SUSPENDED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionId === vendor.id}
                          onClick={() => handleApprove(vendor)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="play" size={14} />
                            Reinstate
                          </span>
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
  );
}
