"use client";

import { useRouter } from "next/navigation";
import { Card, Badge, Icon } from "@/components/ui";
import { useProcurementDashboard } from "../hooks/useProcurement";
import type { ProcurementDashboard as DashboardData } from "../types/procurement.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number): string {
  if (val >= 10_00_000) return `₹${(val / 10_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiTile({ label, value, sub, icon, color, onClick }: {
  label: string; value: string | number; sub?: string;
  icon: string; color: string; onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      className="h-100"
    >
      <div className="p-3 d-flex align-items-center gap-3">
        <div style={{
          flexShrink: 0, width: 44, height: 44, borderRadius: 10,
          background: `${color}18`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: "#111827" }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

function PipelineStage({ label, count, color, pct }: {
  label: string; count: number; color: string; pct: number;
}) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{count}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color,
          width: `${Math.min(pct, 100)}%`, transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function StatusFlow({ stages, total }: {
  stages: { label: string; count: number; color: string }[];
  total: number;
}) {
  return (
    <div className="d-flex flex-column gap-2">
      {stages.map((s) => (
        <PipelineStage key={s.label} label={s.label} count={s.count} color={s.color}
          pct={total > 0 ? (s.count / total) * 100 : 0} />
      ))}
    </div>
  );
}

function SectionCard({ title, icon, children, badge }: {
  title: string; icon: string; children: React.ReactNode; badge?: number;
}) {
  return (
    <Card className="h-100">
      <div className="p-4" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Icon name={icon} size={15} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="warning" style={{ fontSize: 10, padding: "1px 6px" }}>{badge}</Badge>
          )}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </Card>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function ProcurementDashboard() {
  const router = useRouter();
  const { data, isLoading } = useProcurementDashboard();
  const d = (data?.data ?? null) as DashboardData | null;

  if (isLoading) {
    return (
      <div className="p-6 d-flex align-items-center gap-2" style={{ color: "#9ca3af" }}>
        <Icon name="loader" size={18} className="animate-spin" /> Loading…
      </div>
    );
  }
  if (!d) {
    return <div className="p-6 text-center" style={{ color: "#9ca3af", fontSize: 14 }}>No data available</div>;
  }

  const rfqTotal = d.rfq.draft + d.rfq.sent + d.rfq.closed;
  const poTotal = d.purchaseOrders.draft + d.purchaseOrders.pendingApproval +
    d.purchaseOrders.approved + d.purchaseOrders.completed;
  const grnTotal = d.goodsReceipts.draft + d.goodsReceipts.accepted + d.goodsReceipts.rejected;

  return (
    <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h5 style={{ fontWeight: 700, margin: 0, color: "#111827" }}>Procurement Dashboard</h5>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Purchase pipeline at a glance</p>
        </div>
        {d.pendingApprovals.totalCount > 0 && (
          <div
            onClick={() => router.push("/procurement/purchase-orders")}
            className="d-flex align-items-center gap-2"
            style={{ cursor: "pointer", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "6px 12px" }}
          >
            <Icon name="bell" size={14} color="#f97316" />
            <span style={{ fontSize: 12, color: "#ea580c", fontWeight: 600 }}>
              {d.pendingApprovals.totalCount} pending approval{d.pendingApprovals.totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiTile label="Open RFQs" value={d.rfq.sent} sub={`${rfqTotal} total`}
          icon="file-question" color="#3b82f6" onClick={() => router.push("/procurement/rfq")} />
        <KpiTile label="PO Value" value={fmt(d.purchaseOrders.totalValue)}
          sub={`${d.purchaseOrders.approved} approved POs`}
          icon="indian-rupee" color="#22c55e" onClick={() => router.push("/procurement/purchase-orders")} />
        <KpiTile label="Pending Approvals" value={d.purchaseOrders.pendingApproval}
          sub="purchase orders" icon="clock" color="#f59e0b"
          onClick={() => router.push("/procurement/purchase-orders")} />
        <KpiTile label="Payable" value={fmt(d.invoices.totalPayable)}
          sub={`${d.invoices.pending} unpaid invoices`} icon="receipt" color="#ef4444"
          onClick={() => router.push("/procurement/invoices")} />
      </div>

      {/* Pipeline Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <SectionCard title="RFQ Pipeline" icon="file-question">
          <StatusFlow total={rfqTotal} stages={[
            { label: "Draft", count: d.rfq.draft, color: "#94a3b8" },
            { label: "Sent to Vendors", count: d.rfq.sent, color: "#3b82f6" },
            { label: "Closed", count: d.rfq.closed, color: "#22c55e" },
          ]} />
          <div onClick={() => router.push("/procurement/rfq")}
            className="d-flex align-items-center gap-1 mt-3"
            style={{ cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 500 }}>
            View all RFQs <Icon name="arrow-right" size={12} />
          </div>
        </SectionCard>

        <SectionCard title="Purchase Orders" icon="clipboard-list" badge={d.purchaseOrders.pendingApproval}>
          <StatusFlow total={poTotal} stages={[
            { label: "Draft", count: d.purchaseOrders.draft, color: "#94a3b8" },
            { label: "Pending Approval", count: d.purchaseOrders.pendingApproval, color: "#f59e0b" },
            { label: "Approved", count: d.purchaseOrders.approved, color: "#3b82f6" },
            { label: "Completed", count: d.purchaseOrders.completed, color: "#22c55e" },
          ]} />
          <div onClick={() => router.push("/procurement/purchase-orders")}
            className="d-flex align-items-center gap-1 mt-3"
            style={{ cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 500 }}>
            View all POs <Icon name="arrow-right" size={12} />
          </div>
        </SectionCard>

        <SectionCard title="Goods Receipts" icon="package-check">
          <StatusFlow total={grnTotal} stages={[
            { label: "Draft", count: d.goodsReceipts.draft, color: "#94a3b8" },
            { label: "Accepted", count: d.goodsReceipts.accepted, color: "#22c55e" },
            { label: "Rejected", count: d.goodsReceipts.rejected, color: "#ef4444" },
          ]} />
          {d.goodsReceipts.rejected > 0 && (
            <div className="d-flex align-items-center gap-1 mt-2"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 8px", fontSize: 11, color: "#dc2626" }}>
              <Icon name="alert-circle" size={11} />
              &nbsp;{d.goodsReceipts.rejected} GRN{d.goodsReceipts.rejected !== 1 ? "s" : ""} rejected
            </div>
          )}
          <div onClick={() => router.push("/procurement/goods-receipts")}
            className="d-flex align-items-center gap-1 mt-3"
            style={{ cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 500 }}>
            View all GRNs <Icon name="arrow-right" size={12} />
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        <SectionCard title="Recent Purchase Orders" icon="clock">
          {d.recentPOs.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", margin: "12px 0" }}>No recent POs</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {d.recentPOs.slice(0, 5).map((po) => (
                <div key={po.id}
                  className="d-flex align-items-center justify-content-between"
                  onClick={() => router.push("/procurement/purchase-orders")}
                  style={{ padding: "6px 8px", borderRadius: 6, background: "#f9fafb", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{po.poNumber}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(po.createdAt)}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{fmt(po.grandTotal)}</span>
                    <Badge
                      variant={po.status === "COMPLETED" ? "success" : po.status === "APPROVED" ? "primary" : po.status === "PENDING_APPROVAL" ? "warning" : "default"}
                      style={{ fontSize: 10, padding: "2px 6px" }}>
                      {po.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Invoice Status" icon="receipt">
          <StatusFlow total={d.invoices.total || 1} stages={[
            { label: "Draft", count: d.invoices.draft, color: "#94a3b8" },
            { label: "Pending", count: d.invoices.pending, color: "#f59e0b" },
            { label: "Approved", count: d.invoices.approved, color: "#3b82f6" },
            { label: "Paid", count: d.invoices.paid, color: "#22c55e" },
          ]} />
          <div style={{
            marginTop: 12, padding: "10px 12px", borderRadius: 8,
            background: d.invoices.totalPayable > 0 ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${d.invoices.totalPayable > 0 ? "#fecaca" : "#bbf7d0"}`,
          }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Outstanding Payable</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: d.invoices.totalPayable > 0 ? "#dc2626" : "#16a34a" }}>
              {fmt(d.invoices.totalPayable)}
            </div>
          </div>
          <div onClick={() => router.push("/procurement/invoices")}
            className="d-flex align-items-center gap-1 mt-3"
            style={{ cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 500 }}>
            View all invoices <Icon name="arrow-right" size={12} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
