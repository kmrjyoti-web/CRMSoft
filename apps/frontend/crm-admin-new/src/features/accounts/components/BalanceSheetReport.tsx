"use client";

import { useState, useMemo } from "react";

import {
  Card,
  Button,
  DatePicker,
  Icon,
  Badge,
} from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useBalanceSheet } from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "\u20B90.00";
  return `\u20B9${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

interface GroupItem {
  name: string;
  amount: number;
}

interface BalanceSheetGroup {
  group: string;
  items: GroupItem[];
  total: number;
}

// ---------------------------------------------------------------------------
// Section renderer
// ---------------------------------------------------------------------------

function BalanceSection({
  title,
  icon,
  groups,
  sectionTotal,
  badgeVariant,
}: {
  title: string;
  icon: string;
  groups: BalanceSheetGroup[];
  sectionTotal: number;
  badgeVariant: string;
}) {
  return (
    <Card>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icon name={icon as any} size={18} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            {title}
          </h3>
        </div>

        {groups.map((grp, gi) => (
          <div key={gi} style={{ marginBottom: 16 }}>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {grp.group}
            </h4>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {grp.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 12px", fontSize: 13, color: "#334155" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "6px 12px", fontSize: 13, color: "#334155", textAlign: "right" }}>
                      {formatINR(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    Sub Total
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#1e293b", textAlign: "right" }}>
                    {formatINR(grp.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}

        {/* Section total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderTop: "2px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
            Total {title}
          </span>
          <Badge variant={badgeVariant as any}>{formatINR(sectionTotal)}</Badge>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BalanceSheetReport() {
  const today = new Date().toISOString().slice(0, 10);
  const [asOfDate, setAsOfDate] = useState(today);
  const [appliedDate, setAppliedDate] = useState(today);

  const { data, isLoading } = useBalanceSheet(appliedDate);

  const reportData = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? {};
    return {
      assets: (raw.assets ?? []) as BalanceSheetGroup[],
      liabilities: (raw.liabilities ?? []) as BalanceSheetGroup[],
      equity: (raw.equity ?? []) as BalanceSheetGroup[],
      totalAssets: raw.totalAssets ?? 0,
      totalLiabilities: raw.totalLiabilities ?? 0,
      totalEquity: raw.totalEquity ?? 0,
      isBalanced: raw.isBalanced ?? false,
    };
  }, [data]);

  const liabilitiesAndEquityTotal =
    (reportData.totalLiabilities ?? 0) + (reportData.totalEquity ?? 0);

  const handleGenerate = () => {
    setAppliedDate(asOfDate);
  };

  return (
    <div>
      <PageHeader
        title="Balance Sheet"
        subtitle="Assets, liabilities, and equity as of a specific date"
      />

      {/* Date picker */}
      <Card>
        <div style={{ padding: 16, display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 200 }}>
            <DatePicker
              label="As of Date"
              value={asOfDate}
              onChange={(v) => setAsOfDate(v ? String(v) : "")}
            />
          </div>
          <Button variant="primary" onClick={handleGenerate}>
            <Icon name="search" size={16} /> Generate
          </Button>
        </div>
      </Card>

      {/* Report body */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginTop: 20,
            }}
          >
            {/* Left: Assets */}
            <BalanceSection
              title="Assets"
              icon="landmark"
              groups={reportData.assets}
              sectionTotal={reportData.totalAssets}
              badgeVariant="primary"
            />

            {/* Right: Liabilities + Equity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <BalanceSection
                title="Liabilities"
                icon="credit-card"
                groups={reportData.liabilities}
                sectionTotal={reportData.totalLiabilities}
                badgeVariant="danger"
              />
              <BalanceSection
                title="Equity"
                icon="shield"
                groups={reportData.equity}
                sectionTotal={reportData.totalEquity}
                badgeVariant="secondary"
              />
            </div>
          </div>

          {/* Footer: Balance check */}
          <Card>
            <div
              style={{
                padding: 20,
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 32 }}>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Total Assets</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    {formatINR(reportData.totalAssets)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Liabilities + Equity
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    {formatINR(liabilitiesAndEquityTotal)}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {reportData.isBalanced ? (
                  <>
                    <Icon name="check-circle" size={20} />
                    <Badge variant="success">Balanced</Badge>
                  </>
                ) : (
                  <>
                    <Icon name="alert-triangle" size={20} />
                    <Badge variant="danger">Not Balanced</Badge>
                  </>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
