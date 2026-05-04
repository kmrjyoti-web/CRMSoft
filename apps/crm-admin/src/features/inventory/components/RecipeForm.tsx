"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, NumberInput, Badge, Icon } from "@/components/ui";
import { useCreateRecipe } from "../hooks/useBOM";
import type { CreateFormulaItemPayload } from "../types/bom.types";

interface IngredientRow {
  rawMaterialId: string;
  quantity: number;
  unit: string;
  wastagePercent: number;
  isCritical: boolean;
}

export function RecipeForm() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  // Step 1: Basic info
  const [formulaName, setFormulaName] = useState("");
  const [formulaCode, setFormulaCode] = useState("");
  const [finishedProductId, setFinishedProductId] = useState("");
  const [yieldQuantity, setYieldQuantity] = useState<number | null>(1);
  const [yieldUnit, setYieldUnit] = useState("piece");
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [cookTime, setCookTime] = useState<number | null>(null);
  const [industryCode, setIndustryCode] = useState("");
  const [instructions, setInstructions] = useState("");

  // Step 2: Ingredients
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { rawMaterialId: "", quantity: 0, unit: "gm", wastagePercent: 0, isCritical: true },
  ]);

  const [step, setStep] = useState(1);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [
      ...prev,
      { rawMaterialId: "", quantity: 0, unit: "gm", wastagePercent: 0, isCritical: true },
    ]);
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof IngredientRow, value: any) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const costPreview = useMemo(() => {
    return ingredients.map((ing) => {
      const effective = ing.quantity * (1 + ing.wastagePercent / 100);
      return {
        ...ing,
        effectiveQty: Math.round(effective * 1000) / 1000,
      };
    });
  }, [ingredients]);

  const handleSubmit = async () => {
    const items: CreateFormulaItemPayload[] = ingredients
      .filter((i) => i.rawMaterialId && i.quantity > 0)
      .map((i, idx) => ({
        rawMaterialId: i.rawMaterialId,
        quantity: i.quantity,
        unit: i.unit,
        wastagePercent: i.wastagePercent,
        isCritical: i.isCritical,
        sortOrder: idx,
      }));

    await createRecipe.mutateAsync({
      formulaName,
      formulaCode: formulaCode || undefined,
      finishedProductId,
      yieldQuantity: yieldQuantity ?? 1,
      yieldUnit,
      prepTime: prepTime ?? undefined,
      cookTime: cookTime ?? undefined,
      instructions: instructions || undefined,
      industryCode: industryCode || undefined,
      items,
    });

    router.push("/inventory/recipes");
  };

  return (
    <div className="p-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Create Recipe / BOM</h4>
        <div className="d-flex gap-2">
          {[1, 2, 3].map((s) => (
            <Badge key={s} variant={step === s ? "primary" : "secondary"}>
              Step {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="d-flex flex-column gap-3">
          <h5>Basic Information</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <Input label="Recipe Name" value={formulaName} onChange={setFormulaName} leftIcon={<Icon name="clipboard-list" size={16} />} />
            </div>
            <div className="col-md-6">
              <Input label="Recipe Code (auto)" value={formulaCode} onChange={setFormulaCode} leftIcon={<Icon name="hash" size={16} />} />
            </div>
            <div className="col-md-6">
              <Input label="Finished Product ID" value={finishedProductId} onChange={setFinishedProductId} leftIcon={<Icon name="package" size={16} />} />
            </div>
            <div className="col-md-3">
              <NumberInput label="Yield Quantity" value={yieldQuantity} onChange={setYieldQuantity} />
            </div>
            <div className="col-md-3">
              <Input label="Yield Unit" value={yieldUnit} onChange={setYieldUnit} />
            </div>
            <div className="col-md-3">
              <NumberInput label="Prep Time (min)" value={prepTime} onChange={setPrepTime} />
            </div>
            <div className="col-md-3">
              <NumberInput label="Cook Time (min)" value={cookTime} onChange={setCookTime} />
            </div>
            <div className="col-md-6">
              <Input label="Industry Code" value={industryCode} onChange={setIndustryCode} leftIcon={<Icon name="building" size={16} />} />
            </div>
          </div>
          <div>
            <Input label="Instructions" value={instructions} onChange={setInstructions} />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="ghost" onClick={() => router.push("/inventory/recipes")}>Cancel</Button>
            <Button variant="primary" onClick={() => setStep(2)} disabled={!formulaName || !finishedProductId}>Next: Ingredients</Button>
          </div>
        </div>
      )}

      {/* Step 2: Ingredients */}
      {step === 2 && (
        <div className="d-flex flex-column gap-3">
          <h5>Raw Materials / Ingredients</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ingredient (Product ID)</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Wastage%</th>
                  <th>Effective Qty</th>
                  <th>Critical</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, idx) => {
                  const cp = costPreview[idx];
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <Input
                          label=""
                          value={ing.rawMaterialId}
                          onChange={(v) => updateIngredient(idx, "rawMaterialId", v)}
                        />
                      </td>
                      <td style={{ width: 100 }}>
                        <NumberInput
                          label=""
                          value={ing.quantity}
                          onChange={(v) => updateIngredient(idx, "quantity", v ?? 0)}
                        />
                      </td>
                      <td style={{ width: 80 }}>
                        <Input label="" value={ing.unit} onChange={(v) => updateIngredient(idx, "unit", v)} />
                      </td>
                      <td style={{ width: 80 }}>
                        <NumberInput
                          label=""
                          value={ing.wastagePercent}
                          onChange={(v) => updateIngredient(idx, "wastagePercent", v ?? 0)}
                        />
                      </td>
                      <td>
                        <Badge variant="secondary">{cp?.effectiveQty ?? 0} {ing.unit}</Badge>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={ing.isCritical}
                          onChange={(e) => updateIngredient(idx, "isCritical", e.target.checked)}
                        />
                      </td>
                      <td>
                        {ingredients.length > 1 && (
                          <Button variant="ghost" onClick={() => removeIngredient(idx)}>
                            <Icon name="trash-2" size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="outline" onClick={addIngredient}>+ Add Ingredient</Button>
          <div className="d-flex justify-content-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button
              variant="primary"
              onClick={() => setStep(3)}
              disabled={ingredients.filter((i) => i.rawMaterialId && i.quantity > 0).length === 0}
            >
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="d-flex flex-column gap-3">
          <h5>Review & Save</h5>
          <div className="card p-3">
            <p><strong>Recipe:</strong> {formulaName} ({formulaCode || "auto"})</p>
            <p><strong>Yield:</strong> {yieldQuantity} {yieldUnit}</p>
            {prepTime && <p><strong>Prep:</strong> {prepTime} min</p>}
            {cookTime && <p><strong>Cook:</strong> {cookTime} min</p>}
          </div>
          <div className="card p-3">
            <h6>Ingredients ({ingredients.filter((i) => i.rawMaterialId).length})</h6>
            <table className="table table-sm">
              <thead>
                <tr><th>Ingredient</th><th>Qty</th><th>Unit</th><th>Wastage</th><th>Effective</th></tr>
              </thead>
              <tbody>
                {costPreview.filter((i) => i.rawMaterialId).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.rawMaterialId}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.wastagePercent}%</td>
                    <td><strong>{item.effectiveQty} {item.unit}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createRecipe.isPending}
            >
              {createRecipe.isPending ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
