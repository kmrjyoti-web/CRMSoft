"use client";

import { useMemo, useState } from "react";
import { TableFull, Badge, Button, Icon, Card, Input } from "@/components/ui";
import { useConversions, useCreateConversion, useUnits } from "../hooks/useProcurement";
import type { UnitConversion } from "../types/procurement.types";

const COLUMNS = [
  { id: "fromUnitId", label: "From Unit", visible: true },
  { id: "toUnitId", label: "To Unit", visible: true },
  { id: "conversionFactor", label: "Factor", visible: true },
  { id: "scope", label: "Scope", visible: true },
];

function flattenConversions(conversions: UnitConversion[]): Record<string, unknown>[] {
  return conversions.map((c) => ({
    id: c.id,
    fromUnitId: c.fromUnitId.slice(0, 8) + "...",
    toUnitId: c.toUnitId.slice(0, 8) + "...",
    conversionFactor: <span style={{ fontWeight: 600 }}>{Number(c.conversionFactor)}</span>,
    scope: c.productId
      ? <Badge variant="warning">Product-specific</Badge>
      : <Badge variant="primary">Global</Badge>,
  }));
}

export function ConversionList() {
  const { data, isLoading } = useConversions();
  const createConversion = useCreateConversion();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromUnitId: "", toUnitId: "", factor: "" });

  const conversions: UnitConversion[] = (data?.data ?? []) as UnitConversion[];
  const rows = useMemo(
    () => (isLoading ? [] : flattenConversions(conversions)),
    [conversions, isLoading],
  );

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fromUnitId || !form.toUnitId || !form.factor) return;
    await createConversion.mutateAsync({
      fromUnitId: form.fromUnitId,
      toUnitId: form.toUnitId,
      factor: parseFloat(form.factor),
    });
    setForm({ fromUnitId: "", toUnitId: "", factor: "" });
    setShowForm(false);
  }

  return (
    <div>
      {showForm && (
        <Card className="mb-4 mx-6 mt-4">
          <form className="p-4" onSubmit={handleCreate}>
            <h6 style={{ fontWeight: 600 }} className="mb-3">New Conversion</h6>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input label="From Unit ID" value={form.fromUnitId} onChange={(v) => set("fromUnitId", v)} leftIcon={<Icon name="arrow-right" size={16} />} />
              <Input label="To Unit ID" value={form.toUnitId} onChange={(v) => set("toUnitId", v)} leftIcon={<Icon name="arrow-left" size={16} />} />
              <Input label="Factor" value={form.factor} onChange={(v) => set("factor", v)} leftIcon={<Icon name="calculator" size={16} />} />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={createConversion.isPending}>
                {createConversion.isPending ? "Creating..." : "Create Conversion"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <TableFull
        data={rows}
        title="Unit Conversions"
        tableKey="procurement-conversions"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onCreate={() => setShowForm(!showForm)}
      />
    </div>
  );
}
