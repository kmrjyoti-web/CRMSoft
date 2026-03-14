"use client";

import { useRouter } from "next/navigation";
import { Icon, Badge, Button, Card } from "@/components/ui";
import { useValuationReport } from "../hooks/useInventory";
import type { ValuationReport as ValuationReportType } from "../types/inventory.types";

export function ValuationReport() {
  const router = useRouter();
  const { data, isLoading } = useValuationReport();
  const report = data?.data as ValuationReportType | undefined;

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.push("/inventory/reports")}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>Stock Valuation</h4>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted"><Icon name="loader" size={24} /> Loading...</div>
      ) : !report ? (
        <Card>
          <div className="text-center py-5 text-muted">
            <Icon name="indian-rupee" size={40} />
            <p className="mt-3 mb-0">No inventory data available.</p>
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <Card>
              <div className="p-4 text-center">
                <p className="text-muted mb-1" style={{ fontSize: 12 }}>Total Value</p>
                <h3 className="mb-0" style={{ fontWeight: 700, color: "#321fdb" }}>
                  {formatCurrency(report.totalValue)}
                </h3>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-muted mb-1" style={{ fontSize: 12 }}>Total Stock</p>
                <h3 className="mb-0" style={{ fontWeight: 700 }}>{report.totalStock.toLocaleString()}</h3>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-muted mb-1" style={{ fontSize: 12 }}>Products</p>
                <h3 className="mb-0" style={{ fontWeight: 700 }}>{report.totalProducts}</h3>
              </div>
            </Card>
          </div>

          <Card>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Avg Cost</th>
                    <th>Total Value</th>
                    <th>HSN</th>
                  </tr>
                </thead>
                <tbody>
                  {report.products.map((p, i) => (
                    <tr key={i}>
                      <td>{p.productId.slice(0, 8)}...</td>
                      <td><Badge variant="secondary">{p.inventoryType}</Badge></td>
                      <td style={{ fontWeight: 600 }}>{p.currentStock.toLocaleString()}</td>
                      <td>{formatCurrency(p.avgCostPrice)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.totalValue)}</td>
                      <td>{p.hsnCode ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
