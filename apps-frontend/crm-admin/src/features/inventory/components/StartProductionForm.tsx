"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, NumberInput, Badge, Icon } from "@/components/ui";
import { useCheckStock, useStartProduction } from "../hooks/useBOM";
import type { StockCheckResult } from "../types/bom.types";

export function StartProductionForm() {
  const router = useRouter();
  const checkStockMutation = useCheckStock();
  const startProduction = useStartProduction();

  const [formulaId, setFormulaId] = useState("");
  const [quantity, setQuantity] = useState<number | null>(10);
  const [locationId, setLocationId] = useState("");
  const [stockResult, setStockResult] = useState<StockCheckResult | null>(null);

  const handleCheck = async () => {
    if (!formulaId || !quantity || !locationId) return;
    const result = await checkStockMutation.mutateAsync({ id: formulaId, quantity, locationId });
    setStockResult((result as any)?.data ?? result);
  };

  const handleStart = async (forcePartial: boolean) => {
    if (!formulaId || !quantity || !locationId) return;
    await startProduction.mutateAsync({ formulaId, quantity, locationId, forcePartial });
    router.push("/inventory/production");
  };

  return (
    <div className="p-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Start Production</h4>
        <Button variant="ghost" onClick={() => router.push("/inventory/production")}>Back</Button>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <Input label="Recipe / Formula ID" value={formulaId} onChange={setFormulaId} leftIcon={<Icon name="clipboard-list" size={16} />} />
          </div>
          <div className="col-md-4">
            <NumberInput label="Quantity" value={quantity} onChange={setQuantity} />
          </div>
          <div className="col-md-4">
            <Input label="Location ID" value={locationId} onChange={setLocationId} leftIcon={<Icon name="map-pin" size={16} />} />
          </div>
        </div>
        <div className="mt-3">
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={checkStockMutation.isPending || !formulaId || !quantity || !locationId}
          >
            {checkStockMutation.isPending ? "Checking..." : "Check Stock Availability"}
          </Button>
        </div>
      </div>

      {/* Stock Check Results */}
      {stockResult && (
        <div className="card p-3 mb-3">
          <h5>Stock Check: {stockResult.formulaName}</h5>

          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
              <thead>
                <tr><th>Ingredient</th><th>Need</th><th>Have</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stockResult.allItems?.map((item, idx) => (
                  <tr key={idx} style={{ background: item.sufficient ? undefined : "#fff5f5" }}>
                    <td>{item.rawMaterialId}</td>
                    <td>{item.requiredQty} {item.unit}</td>
                    <td>{item.availableQty} {item.unit}</td>
                    <td>
                      {item.sufficient ? (
                        <Badge variant="success">OK</Badge>
                      ) : (
                        <Badge variant="danger">SHORT ({item.shortageQty} {item.unit})</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-3 p-2 rounded" style={{ background: stockResult.canProduce ? "#e8f5e9" : "#fce4ec" }}>
            {stockResult.canProduce ? (
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                All stock available. Can produce {stockResult.requestedQuantity} units.
              </span>
            ) : (
              <span style={{ color: "#c62828", fontWeight: 600 }}>
                Cannot produce {stockResult.requestedQuantity}. Max possible: {stockResult.maxProducible}.
                {stockResult.shortage?.length > 0 && (
                  <> Short on: {stockResult.shortage.map((s) => `${s.rawMaterialId} (${s.shortageQty} ${s.unit})`).join(", ")}</>
                )}
              </span>
            )}
          </div>

          {stockResult.estimatedCost && (
            <div className="mt-2 text-muted">
              Estimated Cost: Rs.{stockResult.estimatedCost.totalRawMaterialCost}
              {" "}(Rs.{stockResult.estimatedCost.costPerUnit}/unit)
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2 mt-3">
            <Button variant="ghost" onClick={() => router.push("/inventory/production")}>Cancel</Button>
            {stockResult.canProduce ? (
              <Button variant="primary" onClick={() => handleStart(false)} disabled={startProduction.isPending}>
                {startProduction.isPending ? "Starting..." : `Produce ${stockResult.requestedQuantity}`}
              </Button>
            ) : (
              <>
                {stockResult.maxProducible > 0 && (
                  <Button variant="outline" onClick={() => handleStart(true)} disabled={startProduction.isPending}>
                    Produce {stockResult.maxProducible} (partial)
                  </Button>
                )}
                <Button variant="danger" onClick={() => handleStart(false)} disabled={startProduction.isPending}>
                  Produce {stockResult.requestedQuantity} (override)
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
