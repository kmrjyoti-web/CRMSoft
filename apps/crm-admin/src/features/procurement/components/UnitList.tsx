"use client";

import { useMemo, useState } from "react";
import { TableFull, Badge, Button, Icon, Card, Input, SelectInput } from "@/components/ui";
import { useUnits, useCreateUnit, useDeleteUnit } from "../hooks/useProcurement";
import type { UnitMaster } from "../types/procurement.types";

const COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "symbol", label: "Symbol", visible: true },
  { id: "unitCategory", label: "Category", visible: true },
  { id: "isBase", label: "Base Unit", visible: true },
  { id: "isSystem", label: "System", visible: true },
  { id: "actions", label: "Actions", visible: true },
];

const CATEGORIES = [
  { value: "WEIGHT", label: "Weight" },
  { value: "VOLUME", label: "Volume" },
  { value: "LENGTH", label: "Length" },
  { value: "QUANTITY", label: "Quantity" },
  { value: "AREA", label: "Area" },
];

function flattenUnits(units: UnitMaster[], onDelete: (id: string) => void): Record<string, unknown>[] {
  return units.map((unit) => ({
    id: unit.id,
    name: <span style={{ fontWeight: 600 }}>{unit.name}</span>,
    symbol: <Badge variant="primary">{unit.symbol}</Badge>,
    unitCategory: <Badge variant="secondary">{unit.unitCategory}</Badge>,
    isBase: unit.isBase ? <Badge variant="success">Base</Badge> : "—",
    isSystem: unit.isSystem ? <Badge variant="warning">System</Badge> : "Custom",
    actions: !unit.isSystem ? (
      <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(unit.id);
      }}>
        <Icon name="trash-2" size={14} />
      </Button>
    ) : null,
  }));
}

export function UnitList() {
  const { data, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", symbol: "", category: "QUANTITY" });

  const units: UnitMaster[] = (data?.data ?? []) as UnitMaster[];
  const rows = useMemo(
    () => (isLoading ? [] : flattenUnits(units, (id) => deleteUnit.mutate(id))),
    [units, isLoading, deleteUnit],
  );

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.symbol) return;
    await createUnit.mutateAsync({ name: form.name, symbol: form.symbol, category: form.category });
    setForm({ name: "", symbol: "", category: "QUANTITY" });
    setShowForm(false);
  }

  return (
    <div>
      {showForm && (
        <Card className="mb-4 mx-6 mt-4">
          <form className="p-4" onSubmit={handleCreate}>
            <h6 style={{ fontWeight: 600 }} className="mb-3">New Unit</h6>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input label="Name" value={form.name} onChange={(v) => set("name", v)} leftIcon={<Icon name="type" size={16} />} />
              <Input label="Symbol" value={form.symbol} onChange={(v) => set("symbol", v)} leftIcon={<Icon name="hash" size={16} />} />
              <SelectInput
                label="Category"
                value={form.category}
                options={CATEGORIES}
                onChange={(v) => set("category", String(v ?? "QUANTITY"))}
              />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={createUnit.isPending}>
                {createUnit.isPending ? "Creating..." : "Create Unit"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <TableFull
        data={rows}
        title="Units of Measurement"
        tableKey="procurement-units"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onCreate={() => setShowForm(!showForm)}
      />
    </div>
  );
}
