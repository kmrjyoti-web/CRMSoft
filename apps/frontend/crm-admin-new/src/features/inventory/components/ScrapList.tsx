"use client";

import { useMemo, useState } from "react";
import { TableFull, Badge, Button, Input, NumberInput, Icon } from "@/components/ui";
import { useScrapList, useRecordScrap, useWriteOffScrap } from "../hooks/useBOM";
import type { ScrapRecord } from "../types/bom.types";

const SCRAP_TYPE_LABELS: Record<string, string> = {
  SCRAP_EXPIRED: "Expired",
  SCRAP_DAMAGED: "Damaged",
  SCRAP_PRODUCTION_WASTE: "Production Waste",
  SCRAP_RETURNED_DEFECTIVE: "Returned Defective",
  SCRAP_QUALITY_FAILURE: "Quality Failure",
};

const COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "productId", label: "Product", visible: true },
  { id: "scrapType", label: "Type", visible: true },
  { id: "quantity", label: "Qty", visible: true },
  { id: "totalLoss", label: "Loss", visible: true },
  { id: "reason", label: "Reason", visible: true },
  { id: "material", label: "Material Type", visible: true },
  { id: "disposal", label: "Disposal", visible: true },
];

function flatten(records: ScrapRecord[]): Record<string, unknown>[] {
  return records.map((r) => ({
    id: r.id,
    date: new Date(r.createdAt).toLocaleDateString(),
    productId: r.productId,
    scrapType: <Badge variant="danger">{SCRAP_TYPE_LABELS[r.scrapType] ?? r.scrapType}</Badge>,
    quantity: r.quantity,
    totalLoss: r.totalLoss ? <span style={{ color: "#e55353", fontWeight: 600 }}>Rs.{Number(r.totalLoss).toFixed(2)}</span> : "—",
    reason: r.reason,
    material: r.isRawMaterial ? <Badge variant="secondary">Raw</Badge> : r.isFinishedProduct ? <Badge variant="primary">Finished</Badge> : "—",
    disposal: r.disposalMethod ?? <span className="text-muted">Pending</span>,
  }));
}

export function ScrapList() {
  const { data, isLoading } = useScrapList();
  const recordScrap = useRecordScrap();
  const writeOff = useWriteOffScrap();

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [scrapType, setScrapType] = useState("SCRAP_DAMAGED");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState("");
  const [unitCost, setUnitCost] = useState<number | null>(null);

  const records: ScrapRecord[] = ((data as any)?.data ?? []) as ScrapRecord[];
  const rows = useMemo(() => (isLoading ? [] : flatten(records)), [records, isLoading]);

  const handleRecordScrap = async () => {
    if (!productId || !quantity || !reason) return;
    await recordScrap.mutateAsync({
      productId,
      scrapType,
      quantity,
      reason,
      locationId: locationId || undefined,
      unitCost: unitCost ?? undefined,
    });
    setShowForm(false);
    setProductId("");
    setQuantity(1);
    setReason("");
  };

  return (
    <div>
      {showForm && (
        <div className="card p-3 m-3">
          <h5>Record Scrap</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <Input label="Product ID" value={productId} onChange={setProductId} leftIcon={<Icon name="package" size={16} />} />
            </div>
            <div className="col-md-3">
              <Input label="Scrap Type" value={scrapType} onChange={setScrapType} />
            </div>
            <div className="col-md-2">
              <NumberInput label="Quantity" value={quantity} onChange={setQuantity} />
            </div>
            <div className="col-md-2">
              <NumberInput label="Unit Cost" value={unitCost} onChange={setUnitCost} />
            </div>
            <div className="col-md-2">
              <Input label="Location ID" value={locationId} onChange={setLocationId} />
            </div>
            <div className="col-md-8">
              <Input label="Reason" value={reason} onChange={setReason} />
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleRecordScrap} disabled={recordScrap.isPending}>
                {recordScrap.isPending ? "Saving..." : "Record"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <TableFull
        data={rows}
        title="Scrap Records"
        tableKey="inventory-scrap"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onCreate={() => setShowForm(true)}
      />
    </div>
  );
}
