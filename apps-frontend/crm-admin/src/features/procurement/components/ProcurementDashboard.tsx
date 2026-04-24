"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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

// ── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "RFQs",           href: "/procurement/rfq",              icon: "file-question" },
  { label: "Quotations",     href: "/procurement/quotations",       icon: "file-text" },
  { label: "POs",            href: "/procurement/purchase-orders",   icon: "clipboard-list" },
  { label: "GRNs",           href: "/procurement/goods-receipts",    icon: "package-check" },
  { label: "Invoices",       href: "/procurement/invoices",          icon: "receipt" },
  { label: "Compare",        href: "/procurement/compare",           icon: "git-compare" },
] as const;

// ── Sub-components ───────────────────────────────────────────────────────────

function PipelineStage({ label, count, color, pct }: {
  label: string; count: number; color: string; pct: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 font-medium">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ background: color, width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatusFlow({ stages, total }: {
  stages: { label: string; count: number; color: string }[];
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s) => (
        <PipelineStage key={s.label} label={s.label} count={s.count} color={s.color}
          pct={total > 0 ? (s.count / total) * 100 : 0} />
      ))}
    </div>
  );
}

function SectionCard({ title, icon, children, badge, linkHref, linkLabel }: {
  title: string; icon: string; children: React.ReactNode; badge?: number;
  linkHref?: string; linkLabel?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Icon name={icon as any} size={14} color="#6b7280" />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant="warning" style={{ fontSize: 10, padding: "1px 6px" }}>{badge}</Badge>
        )}
        {linkHref && (
          <Link href={linkHref} className="ml-auto text-xs text-blue-600 no-underline hover:underline flex items-center gap-1">
            {linkLabel ?? "View all"} <Icon name="arrow-right" size={11} />
          </Link>
        )}
      </div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function ProcurementDashboard() {
  const router = useRouter();
  const { data, isLoading } = useProcurementDashboard();
  const d = (data?.data ?? null) as DashboardData | null;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-400">
        <Icon name="loader" size={18} className="animate-spin" /> Loading…
      </div>
    );
  }
  if (!d) {
    return <div className="p-6 text-center text-gray-400 text-sm">No data available</div>;
  }

  const rfqTotal = d.rfq.draft + d.rfq.sent + d.rfq.closed;
  const poTotal = d.purchaseOrders.draft + d.purchaseOrders.pendingApproval +
    d.purchaseOrders.approved + d.purchaseOrders.completed;
  const grnTotal = d.goodsReceipts.draft + d.goodsReceipts.accepted + d.goodsReceipts.rejected;

  const kpiItems = [
    { label: "RFQs",      value: d.rfq.sent,                          sub: `${rfqTotal} total`,          color: "#3b82f6" },
    { label: "PO Value",   value: fmt(d.purchaseOrders.totalValue),     sub: `${d.purchaseOrders.approved} approved`, color: "#22c55e" },
    { label: "Approvals",  value: d.purchaseOrders.pendingApproval,     sub: "pending",                    color: "#f59e0b" },
    { label: "Payable",    value: fmt(d.invoices.totalPayable),         sub: `${d.invoices.pending} unpaid`, color: "#ef4444" },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Procurement</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline KPI stats */}
          <div className="flex items-center gap-5">
            {kpiItems.map((k) => (
              <div key={k.label} className="flex items-center gap-1.5">
                <span className="text-base font-bold" style={{ color: k.color }}>
                  {k.value}
                </span>
                <span className="text-xs text-gray-400">{k.label}</span>
                {k.sub && (
                  <span className="text-[10px] text-gray-300">({k.sub})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pending approvals badge */}
          {d.pendingApprovals.totalCount > 0 && (
            <button
              onClick={() => router.push("/procurement/purchase-orders")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
            >
              <Icon name="bell" size={12} />
              {d.pendingApprovals.totalCount} pending
            </button>
          )}

          <div className="h-5 w-px bg-gray-300" />

          {/* Nav links as pill buttons */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            {NAV_LINKS.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded transition-colors no-underline"
              >
                <Icon name={icon as any} size={11} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Pipeline Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="RFQ Pipeline" icon="file-question" linkHref="/procurement/rfq" linkLabel="View RFQs">
            <StatusFlow total={rfqTotal} stages={[
              { label: "Draft", count: d.rfq.draft, color: "#94a3b8" },
              { label: "Sent to Vendors", count: d.rfq.sent, color: "#3b82f6" },
              { label: "Closed", count: d.rfq.closed, color: "#22c55e" },
            ]} />
          </SectionCard>

          <SectionCard title="Purchase Orders" icon="clipboard-list" badge={d.purchaseOrders.pendingApproval} linkHref="/procurement/purchase-orders" linkLabel="View POs">
            <StatusFlow total={poTotal} stages={[
              { label: "Draft", count: d.purchaseOrders.draft, color: "#94a3b8" },
              { label: "Pending Approval", count: d.purchaseOrders.pendingApproval, color: "#f59e0b" },
              { label: "Approved", count: d.purchaseOrders.approved, color: "#3b82f6" },
              { label: "Completed", count: d.purchaseOrders.completed, color: "#22c55e" },
            ]} />
          </SectionCard>

          <SectionCard title="Goods Receipts" icon="package-check" linkHref="/procurement/goods-receipts" linkLabel="View GRNs">
            <StatusFlow total={grnTotal} stages={[
              { label: "Draft", count: d.goodsReceipts.draft, color: "#94a3b8" },
              { label: "Accepted", count: d.goodsReceipts.accepted, color: "#22c55e" },
              { label: "Rejected", count: d.goodsReceipts.rejected, color: "#ef4444" },
            ]} />
            {d.goodsReceipts.rejected > 0 && (
              <div className="flex items-center gap-1 mt-2 bg-red-50 border border-red-200 rounded px-2 py-1 text-[11px] text-red-600">
                <Icon name="alert-circle" size={11} />
                {d.goodsReceipts.rejected} GRN{d.goodsReceipts.rejected !== 1 ? "s" : ""} rejected
              </div>
            )}
          </SectionCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Recent Purchase Orders" icon="clock" linkHref="/procurement/purchase-orders">
            {d.recentPOs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-3">No recent POs</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {d.recentPOs.slice(0, 5).map((po) => (
                  <div key={po.id}
                    onClick={() => router.push("/procurement/purchase-orders")}
                    className="flex items-center justify-between px-2.5 py-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{po.poNumber}</div>
                      <div className="text-[11px] text-gray-400">{fmtDate(po.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{fmt(po.grandTotal)}</span>
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

          <SectionCard title="Invoice Status" icon="receipt" linkHref="/procurement/invoices">
            <StatusFlow total={d.invoices.total || 1} stages={[
              { label: "Draft", count: d.invoices.draft, color: "#94a3b8" },
              { label: "Pending", count: d.invoices.pending, color: "#f59e0b" },
              { label: "Approved", count: d.invoices.approved, color: "#3b82f6" },
              { label: "Paid", count: d.invoices.paid, color: "#22c55e" },
            ]} />
            <div className={`mt-3 px-3 py-2.5 rounded-lg border ${
              d.invoices.totalPayable > 0
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}>
              <div className="text-[11px] text-gray-500 mb-0.5">Outstanding Payable</div>
              <div className={`text-xl font-bold ${
                d.invoices.totalPayable > 0 ? "text-red-600" : "text-green-600"
              }`}>
                {fmt(d.invoices.totalPayable)}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
