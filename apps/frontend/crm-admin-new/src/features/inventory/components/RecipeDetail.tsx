"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, NumberInput, Input, Icon } from "@/components/ui";
import { useRecipeDetail, useCheckStock, useDuplicateRecipe, useDeactivateRecipe } from "../hooks/useBOM";
import type { StockCheckResult } from "../types/bom.types";

export function RecipeDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useRecipeDetail(id);
  const checkStockMutation = useCheckStock();
  const duplicateMutation = useDuplicateRecipe();
  const deactivateMutation = useDeactivateRecipe();

  const [checkQty, setCheckQty] = useState<number | null>(10);
  const [checkLocation, setCheckLocation] = useState("");
  const [stockResult, setStockResult] = useState<StockCheckResult | null>(null);

  const recipe = (data as any)?.data;

  const handleCheckStock = async () => {
    if (!checkQty || !checkLocation) return;
    const result = await checkStockMutation.mutateAsync({ id, quantity: checkQty, locationId: checkLocation });
    setStockResult((result as any)?.data ?? result);
  };

  const handleDuplicate = async () => {
    const newName = prompt("Name for duplicated recipe:");
    if (newName) {
      await duplicateMutation.mutateAsync({ id, newName });
      router.push("/inventory/recipes");
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!recipe) return <div className="p-4">Recipe not found</div>;

  return (
    <div className="p-4" style={{ maxWidth: 1000 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{recipe.formulaName}</h4>
          <span className="text-muted">{recipe.formulaCode} | v{recipe.version}</span>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline" onClick={handleDuplicate}>Duplicate</Button>
          <Button variant="outline" onClick={() => deactivateMutation.mutate(id)}>
            {recipe.isActive ? "Deactivate" : "Already Inactive"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/inventory/recipes")}>Back</Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-3 mb-3">
        <div className="row">
          <div className="col-md-3"><strong>Yield:</strong> {recipe.yieldQuantity} {recipe.yieldUnit}</div>
          <div className="col-md-3"><strong>Prep:</strong> {recipe.prepTime ? `${recipe.prepTime} min` : "—"}</div>
          <div className="col-md-3"><strong>Cook:</strong> {recipe.cookTime ? `${recipe.cookTime} min` : "—"}</div>
          <div className="col-md-3"><strong>Status:</strong> {recipe.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</div>
        </div>
        {recipe.instructions && <p className="mt-2 mb-0 text-muted">{recipe.instructions}</p>}
      </div>

      {/* Ingredients with Current Stock */}
      <div className="card p-3 mb-3">
        <h5>Ingredients</h5>
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Raw Material</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Wastage%</th>
                <th>Effective Qty</th>
                <th>Current Stock</th>
                <th>Critical</th>
              </tr>
            </thead>
            <tbody>
              {recipe.items?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.rawMaterialId}</td>
                  <td>{Number(item.quantity)}</td>
                  <td>{item.unit}</td>
                  <td>{Number(item.wastagePercent ?? 0)}%</td>
                  <td><strong>{Number(item.effectiveQuantity ?? item.quantity)}</strong></td>
                  <td>
                    <Badge variant={item.currentStock > 0 ? "success" : "danger"}>
                      {item.currentStock ?? 0}
                    </Badge>
                  </td>
                  <td>{item.isCritical ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Check */}
      <div className="card p-3 mb-3">
        <h5>Stock Check</h5>
        <div className="d-flex gap-2 align-items-end mb-3">
          <div style={{ width: 150 }}>
            <NumberInput label="Quantity" value={checkQty} onChange={setCheckQty} />
          </div>
          <div style={{ width: 250 }}>
            <Input label="Location ID" value={checkLocation} onChange={setCheckLocation} leftIcon={<Icon name="map-pin" size={16} />} />
          </div>
          <Button
            variant="primary"
            onClick={handleCheckStock}
            disabled={checkStockMutation.isPending || !checkQty || !checkLocation}
          >
            {checkStockMutation.isPending ? "Checking..." : "Check Stock"}
          </Button>
        </div>

        {stockResult && (
          <div>
            <div className="mb-2">
              {stockResult.canProduce ? (
                <Badge variant="success">Can produce {stockResult.requestedQuantity} units</Badge>
              ) : (
                <Badge variant="danger">
                  Cannot produce {stockResult.requestedQuantity}. Max: {stockResult.maxProducible}
                </Badge>
              )}
            </div>

            <table className="table table-sm table-bordered">
              <thead>
                <tr><th>Ingredient</th><th>Need</th><th>Have</th><th>Status</th><th>Shortage</th></tr>
              </thead>
              <tbody>
                {stockResult.allItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.rawMaterialId}</td>
                    <td>{item.requiredQty} {item.unit}</td>
                    <td>{item.availableQty} {item.unit}</td>
                    <td>
                      {item.sufficient
                        ? <Badge variant="success">OK</Badge>
                        : <Badge variant="danger">SHORT</Badge>}
                    </td>
                    <td>{item.shortageQty > 0 ? `${item.shortageQty} ${item.unit}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stockResult.estimatedCost && (
              <div className="card bg-light p-2 mt-2">
                <strong>Estimated Cost:</strong> Rs.{stockResult.estimatedCost.totalRawMaterialCost}
                {" "}(Rs.{stockResult.estimatedCost.costPerUnit}/unit)
                <br />
                <small className="text-muted">
                  Suggested MRP: 2x = Rs.{stockResult.estimatedCost.suggestedMRP2x} | 3x = Rs.{stockResult.estimatedCost.suggestedMRP3x}
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
