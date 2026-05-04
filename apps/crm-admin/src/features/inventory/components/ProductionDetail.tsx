"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, NumberInput, Input, Icon } from "@/components/ui";
import { useProductionDetail, useCompleteProduction, useCancelProduction } from "../hooks/useBOM";

const STATUS_VARIANT: Record<string, string> = {
  PLANNED: "warning",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function ProductionDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useProductionDetail(id);
  const completeMutation = useCompleteProduction();
  const cancelMutation = useCancelProduction();

  const [actualQty, setActualQty] = useState<number | null>(null);
  const [scrapQty, setScrapQty] = useState<number | null>(0);
  const [scrapReason, setScrapReason] = useState("");
  const [locationId, setLocationId] = useState("");

  const production = (data as any)?.data;

  const handleComplete = async () => {
    if (!locationId) return;
    await completeMutation.mutateAsync({
      id,
      payload: {
        actualQuantity: actualQty ?? undefined,
        locationId,
        scrapQuantity: scrapQty ?? 0,
        scrapReason: scrapReason || undefined,
      },
    });
  };

  const handleCancel = async () => {
    const reason = prompt("Cancel reason:");
    if (reason) await cancelMutation.mutateAsync({ id, reason });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!production) return <div className="p-4">Production not found</div>;

  const canComplete = production.status === "PLANNED" || production.status === "IN_PROGRESS";

  return (
    <div className="p-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Production: {production.formula?.formulaName ?? production.formulaId}</h4>
          <Badge variant={(STATUS_VARIANT[production.status] ?? "secondary") as any}>{production.status}</Badge>
        </div>
        <Button variant="ghost" onClick={() => router.push("/inventory/production")}>Back</Button>
      </div>

      {/* Info */}
      <div className="card p-3 mb-3">
        <div className="row">
          <div className="col-md-3"><strong>Ordered:</strong> {production.quantityOrdered}</div>
          <div className="col-md-3"><strong>Produced:</strong> {production.quantityProduced}</div>
          <div className="col-md-3"><strong>Scrap:</strong> {production.scrapQuantity}</div>
          <div className="col-md-3"><strong>Date:</strong> {new Date(production.productionDate).toLocaleDateString()}</div>
        </div>
        {production.completedDate && (
          <p className="mt-2 mb-0 text-muted">Completed: {new Date(production.completedDate).toLocaleString()}</p>
        )}
      </div>

      {/* Raw Materials Used */}
      {production.formula?.items && (
        <div className="card p-3 mb-3">
          <h5>Raw Materials</h5>
          <table className="table table-sm table-bordered">
            <thead>
              <tr><th>Material</th><th>Qty/unit</th><th>Effective</th><th>Wastage</th></tr>
            </thead>
            <tbody>
              {production.formula.items.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.rawMaterialId}</td>
                  <td>{Number(item.quantity)} {item.unit}</td>
                  <td><strong>{Number(item.effectiveQuantity ?? item.quantity)}</strong></td>
                  <td>{Number(item.wastagePercent ?? 0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scrap Records */}
      {production.scrapRecords?.length > 0 && (
        <div className="card p-3 mb-3">
          <h5>Scrap Records</h5>
          <table className="table table-sm table-bordered">
            <thead>
              <tr><th>Type</th><th>Qty</th><th>Loss</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {production.scrapRecords.map((s: any) => (
                <tr key={s.id}>
                  <td><Badge variant="danger">{s.scrapType.replace("SCRAP_", "")}</Badge></td>
                  <td>{s.quantity}</td>
                  <td>{s.totalLoss ? `Rs.${s.totalLoss}` : "—"}</td>
                  <td>{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complete Production Form */}
      {canComplete && (
        <div className="card p-3 mb-3 border-primary">
          <h5>Complete Production</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <NumberInput label="Actually Produced" value={actualQty ?? production.quantityOrdered} onChange={setActualQty} />
            </div>
            <div className="col-md-3">
              <NumberInput label="Scrap (failed)" value={scrapQty} onChange={setScrapQty} />
            </div>
            <div className="col-md-3">
              <Input label="Scrap Reason" value={scrapReason} onChange={setScrapReason} />
            </div>
            <div className="col-md-3">
              <Input label="Location ID" value={locationId} onChange={setLocationId} leftIcon={<Icon name="map-pin" size={16} />} />
            </div>
          </div>
          <div className="mt-3 p-2 bg-light rounded text-muted" style={{ fontSize: 13 }}>
            This will: Deduct {production.formula?.items?.length ?? 0} raw materials | Add {actualQty ?? production.quantityOrdered} finished products | Record {scrapQty ?? 0} scrap
          </div>
          <div className="d-flex gap-2 mt-3">
            <Button variant="danger" onClick={handleCancel} disabled={cancelMutation.isPending}>Cancel Production</Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={completeMutation.isPending || !locationId}
            >
              {completeMutation.isPending ? "Completing..." : "Complete Production"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
