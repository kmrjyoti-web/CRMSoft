"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Card, Badge } from "@/components/ui";
import { useBulkCreateSerials } from "../hooks/useInventory";

export function BulkImport() {
  const router = useRouter();
  const bulkCreate = useBulkCreateSerials();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ created: number; errors: any[]; total: number } | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          if (values[i]) obj[h] = values[i];
        });
        return obj;
      });

      // Map CSV headers to payload fields
      const mapped = rows.map((row) => ({
        productId: row.productid || row.product_id || "",
        serialNo: row.serialno || row.serial_no || row.serial || "",
        code1: row.code1 || row.activation_key || undefined,
        code2: row.code2 || row.license_id || undefined,
        batchNo: row.batchno || row.batch_no || undefined,
        expiryType: row.expirytype || row.expiry_type || undefined,
        expiryDate: row.expirydate || row.expiry_date || undefined,
        mrp: row.mrp ? parseFloat(row.mrp) : undefined,
        purchaseRate: row.purchaserate || row.purchase_rate ? parseFloat(row.purchaserate || row.purchase_rate) : undefined,
        saleRate: row.salerate || row.sale_rate ? parseFloat(row.salerate || row.sale_rate) : undefined,
        costPrice: row.costprice || row.cost_price ? parseFloat(row.costprice || row.cost_price) : undefined,
        locationId: row.locationid || row.location_id || undefined,
      })).filter((r) => r.productId && r.serialNo);

      setCsvData(mapped);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (csvData.length === 0) return;
    const res = await bulkCreate.mutateAsync(csvData);
    setResult(res.data as any);
  }

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>
          <Icon name="upload" size={22} /> Bulk Import Serials
        </h4>
      </div>

      <Card>
        <div className="p-4">
          <h6 style={{ fontWeight: 600 }} className="mb-3">Upload CSV File</h6>
          <p className="text-muted" style={{ fontSize: 13 }}>
            CSV headers: productId, serialNo, code1, code2, batchNo, expiryType, expiryDate, mrp, purchaseRate, saleRate, costPrice, locationId
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={14} /> Choose File
            </Button>
            {fileName && <span className="text-muted" style={{ fontSize: 13 }}>{fileName}</span>}
          </div>

          {csvData.length > 0 && (
            <div className="mt-3">
              <Badge variant="primary">{csvData.length} rows parsed</Badge>
              <div className="mt-2" style={{ maxHeight: 200, overflow: "auto", fontSize: 12 }}>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Serial No</th>
                      <th>Product ID</th>
                      <th>Code 1</th>
                      <th>MRP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.serialNo}</td>
                        <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{row.productId}</td>
                        <td>{row.code1 ?? "—"}</td>
                        <td>{row.mrp ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="text-muted mb-0 mt-1">...and {csvData.length - 10} more rows</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {result && (
        <Card className="mt-3">
          <div className="p-4">
            <h6 style={{ fontWeight: 600 }}>Import Result</h6>
            <div className="d-flex gap-3 mt-2">
              <Badge variant="success">{result.created} created</Badge>
              {result.errors.length > 0 && (
                <Badge variant="danger">{result.errors.length} errors</Badge>
              )}
              <Badge variant="secondary">{result.total} total</Badge>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2" style={{ fontSize: 12 }}>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-danger mb-1">
                    Row {err.row}: {err.serialNo} — {err.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={csvData.length === 0 || bulkCreate.isPending}
        >
          {bulkCreate.isPending ? "Importing..." : `Import ${csvData.length} Serials`}
        </Button>
      </div>
    </div>
  );
}
