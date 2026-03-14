"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge, Button, Icon } from "@/components/ui";
import { useProductionReport, useYieldReport } from "../hooks/useBOM";
import type { ProductionReport, YieldReport } from "../types/bom.types";

const PRODUCTION_COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "recipe", label: "Recipe", visible: true },
  { id: "ordered", label: "Ordered", visible: true },
  { id: "produced", label: "Produced", visible: true },
  { id: "scrap", label: "Scrap", visible: true },
  { id: "status", label: "Status", visible: true },
];

const YIELD_COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "formulaName", label: "Recipe", visible: true },
  { id: "ordered", label: "Ordered", visible: true },
  { id: "produced", label: "Produced", visible: true },
  { id: "scrap", label: "Scrap", visible: true },
  { id: "yieldRate", label: "Yield %", visible: true },
];

export function ProductionReportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"production" | "yield">("production");

  const { data: prodData, isLoading: prodLoading } = useProductionReport();
  const { data: yieldData, isLoading: yieldLoading } = useYieldReport();

  const prodReport = (prodData as any)?.data as ProductionReport | undefined;
  const yReport = (yieldData as any)?.data as YieldReport | undefined;

  const prodRows = useMemo(() => {
    if (!prodReport?.runs) return [];
    return prodReport.runs.map((p) => ({
      id: p.id,
      date: new Date(p.productionDate).toLocaleDateString(),
      recipe: p.formula?.formulaName ?? p.formulaId,
      ordered: p.quantityOrdered,
      produced: p.quantityProduced,
      scrap: p.scrapQuantity,
      status: <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "CANCELLED" ? "danger" : "warning"}>{p.status}</Badge>,
    }));
  }, [prodReport]);

  const yieldRows = useMemo(() => {
    if (!yReport?.runs) return [];
    return yReport.runs.map((y) => ({
      id: y.id,
      date: new Date(y.date).toLocaleDateString(),
      formulaName: y.formulaName,
      ordered: y.ordered,
      produced: y.produced,
      scrap: y.scrap,
      yieldRate: (
        <span style={{ fontWeight: 600, color: y.yieldRate >= 90 ? "#2eb85c" : y.yieldRate >= 70 ? "#f9b115" : "#e55353" }}>
          {y.yieldRate}%
        </span>
      ),
    }));
  }, [yReport]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Production Reports</h4>
        <Button variant="ghost" onClick={() => router.push("/inventory/reports")}>
          <Icon name="arrow-left" size={16} /> Back to Reports
        </Button>
      </div>

      {/* Summary KPIs */}
      {prodReport?.summary && (
        <div className="row g-3 mb-4">
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Total Runs</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{prodReport.summary.totalRuns}</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Total Produced</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#2eb85c" }}>{prodReport.summary.totalProduced}</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Total Scrap</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#e55353" }}>{prodReport.summary.totalScrap}</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Yield Rate</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{prodReport.summary.yieldRate}%</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Completed</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{prodReport.summary.completedRuns}</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card p-3 text-center">
              <div className="text-muted" style={{ fontSize: 12 }}>Cancelled</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{prodReport.summary.cancelledRuns}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <Button variant={tab === "production" ? "primary" : "outline"} onClick={() => setTab("production")}>Production Runs</Button>
        <Button variant={tab === "yield" ? "primary" : "outline"} onClick={() => setTab("yield")}>Yield Analysis</Button>
      </div>

      {tab === "production" && (
        <TableFull
          data={prodLoading ? [] : prodRows}
          title="Production Runs"
          tableKey="report-production-runs"
          columns={PRODUCTION_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
        />
      )}

      {tab === "yield" && (
        <>
          {yReport && (
            <div className="mb-3">
              <Badge variant="primary">Average Yield: {yReport.averageYieldRate}%</Badge>
            </div>
          )}
          <TableFull
            data={yieldLoading ? [] : yieldRows}
            title="Yield Analysis"
            tableKey="report-yield-analysis"
            columns={YIELD_COLUMNS}
            defaultViewMode="table"
            defaultDensity="compact"
          />
        </>
      )}
    </div>
  );
}
