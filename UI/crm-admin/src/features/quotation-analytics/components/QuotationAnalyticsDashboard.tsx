"use client";

import { useState, useMemo } from "react";
import { Button, Card, Badge, Input, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useQuotationOverview,
  useConversionFunnel,
  useIndustryAnalytics,
  useProductAnalytics,
  useBestQuotations,
} from "../hooks/useQuotationAnalytics";
import { ConversionFunnel } from "./ConversionFunnel";
import type { AnalyticsFilters } from "../types/quotation-analytics.types";
import { formatCurrency } from "@/lib/format-currency";

// ── Helpers ───────────────────────────────────────────


function trendBadge(value: number) {
  const isPositive = value >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 500,
        color: isPositive ? "#16a34a" : "#ef4444",
      }}
    >
      <Icon name={isPositive ? "trending-up" : "trending-down"} size={13} color={isPositive ? "#16a34a" : "#ef4444"} />
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

// ── Component ─────────────────────────────────────────

export function QuotationAnalyticsDashboard() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters: AnalyticsFilters = useMemo(
    () => ({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    [dateFrom, dateTo],
  );

  const { data: overviewRaw, isLoading: overviewLoading } = useQuotationOverview(filters);
  const { data: funnelRaw } = useConversionFunnel(filters);
  const { data: industryRaw } = useIndustryAnalytics(filters);
  const { data: productRaw } = useProductAnalytics(filters);
  const { data: bestRaw } = useBestQuotations({ ...filters, limit: 5 });

  // Safely unwrap API responses
  const overview = (overviewRaw as any)?.data ?? overviewRaw ?? null;
  const funnel = (funnelRaw as any)?.data ?? funnelRaw ?? null;
  const industries: any[] = Array.isArray(industryRaw) ? industryRaw : Array.isArray((industryRaw as any)?.data) ? (industryRaw as any).data : [];
  const products: any[] = Array.isArray(productRaw) ? productRaw : Array.isArray((productRaw as any)?.data) ? (productRaw as any).data : [];
  const bestQuotations: any[] = Array.isArray(bestRaw) ? bestRaw : Array.isArray((bestRaw as any)?.data) ? (bestRaw as any).data : [];

  if (overviewLoading) {
    return (
      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Date Range Filter ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Icon name="bar-chart-2" size={20} color="#3b82f6" />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>
          Quotation Analytics
        </h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Input
            label="From"
            type="date"
            value={dateFrom}
            onChange={(val) => setDateFrom(val)}
            leftIcon={<Icon name="calendar" size={16} />}
          />
          <Input
            label="To"
            type="date"
            value={dateTo}
            onChange={(val) => setDateTo(val)}
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
      </div>

      {/* ── KPI Cards Row ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {/* Total Quotations */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Total Quotations</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  {overview?.totalQuotations ?? 0}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="file-text" size={20} color="#3b82f6" />
              </div>
            </div>
            {overview?.vsLastPeriod && (
              <div style={{ marginTop: 8 }}>{trendBadge(overview.vsLastPeriod.quotations)}</div>
            )}
          </div>
        </Card>

        {/* Total Value */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Total Value</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  {formatCurrency(overview?.totalValue ?? 0)}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="indian-rupee" size={20} color="#16a34a" />
              </div>
            </div>
            {overview?.vsLastPeriod && (
              <div style={{ marginTop: 8 }}>{trendBadge(overview.vsLastPeriod.value)}</div>
            )}
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Conversion Rate</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  {overview?.conversionRate?.toFixed(1) ?? 0}%
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#fdf4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="percent" size={20} color="#a855f7" />
              </div>
            </div>
            {overview?.vsLastPeriod && (
              <div style={{ marginTop: 8 }}>{trendBadge(overview.vsLastPeriod.conversionRate)}</div>
            )}
          </div>
        </Card>

        {/* Avg Days to Close */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Avg Days to Close</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  {overview?.avgDaysToClose?.toFixed(0) ?? 0}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#fff7ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="clock" size={20} color="#f97316" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Second Row: Funnel + Industry ──────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Conversion Funnel */}
        <Card>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 16px 0" }}>
              Conversion Funnel
            </h3>
            {funnel ? (
              <ConversionFunnel data={funnel} />
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No funnel data available</p>
            )}
          </div>
        </Card>

        {/* Industry Breakdown */}
        <Card>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 16px 0" }}>
              Industry Breakdown
            </h3>
            {industries.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No industry data available</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {industries.map((ind, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{ind.industry}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {ind.count} quotation{ind.count !== 1 ? "s" : ""} | Avg: {formatCurrency(ind.avgDealSize)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {formatCurrency(ind.value)}
                      </div>
                      <Badge variant={ind.conversionRate >= 50 ? "success" : ind.conversionRate >= 25 ? "warning" : "danger"}>
                        {ind.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Third Row: Products + Best Quotations ──────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Product Analytics Table */}
        <Card>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 16px 0" }}>
              Product Analytics
            </h3>
            {products.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No product data available</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Product</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Quoted</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Qty</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Value</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p.productId ?? idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ fontWeight: 500, color: "#1e293b" }}>{p.productName}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.productSku}</div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155" }}>
                          {p.timesQuoted}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155" }}>
                          {p.totalQuantity}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: "#1e293b", fontWeight: 500 }}>
                          {formatCurrency(p.totalValue)}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>
                          <Badge variant={p.winRate >= 60 ? "success" : p.winRate >= 30 ? "warning" : "danger"}>
                            {p.winRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Best Quotations */}
        <Card>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 16px 0" }}>
              <Icon name="star" size={16} color="#f59e0b" /> Best Quotations
            </h3>
            {bestQuotations.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No data available</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bestQuotations.map((q, idx) => (
                  <div
                    key={q.id ?? idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: idx === 0 ? "#fffbeb" : "#f8fafc",
                      border: `1px solid ${idx === 0 ? "#fef3c7" : "#e2e8f0"}`,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: idx === 0 ? "#f59e0b" : "#94a3b8",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                        {q.quotationNumber}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {q.contactName} | {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {formatCurrency(q.totalAmount)}
                      </div>
                      <Badge variant={q.status === "ACCEPTED" ? "success" : q.status === "SENT" ? "primary" : "secondary"}>
                        {q.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
