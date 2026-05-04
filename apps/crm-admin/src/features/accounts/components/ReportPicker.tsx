"use client";

import Link from "next/link";

import { Card, Icon } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";

// ---------------------------------------------------------------------------
// Report definitions
// ---------------------------------------------------------------------------

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  href: string;
}

const REPORTS: ReportCard[] = [
  {
    title: "Profit & Loss",
    description:
      "View income vs expenses over a date range to determine net profit or loss.",
    icon: "trending-up",
    href: "/accounts/reports/profit-loss",
  },
  {
    title: "Balance Sheet",
    description:
      "Snapshot of assets, liabilities, and equity as of a specific date.",
    icon: "scale",
    href: "/accounts/reports/balance-sheet",
  },
  {
    title: "Trial Balance",
    description:
      "Summary of all ledger balances to verify debit-credit equality.",
    icon: "columns",
    href: "/accounts/reports/trial-balance",
  },
  {
    title: "Cash Flow",
    description:
      "Track cash inflows and outflows across operating, investing, and financing activities.",
    icon: "banknote",
    href: "/accounts/reports/cash-flow",
  },
  {
    title: "Receivable Aging",
    description:
      "Analyze outstanding customer receivables by aging buckets (30/60/90+ days).",
    icon: "clock",
    href: "/accounts/reports/receivable-aging",
  },
  {
    title: "Payable Aging",
    description:
      "Review pending vendor payables grouped by aging periods.",
    icon: "hourglass",
    href: "/accounts/reports/payable-aging",
  },
  {
    title: "Day Book",
    description:
      "Chronological list of all journal entries for a selected date range.",
    icon: "book-open",
    href: "/accounts/reports/day-book",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportPicker() {
  return (
    <div>
      <PageHeader
        title="Accounting Reports"
        subtitle="Select a report to view financial data"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {REPORTS.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card>
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  height: "100%",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={report.icon as any} size={22} />
                </div>

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  {report.title}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {report.description}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#3b82f6",
                  }}
                >
                  View Report <Icon name="arrow-right" size={14} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
