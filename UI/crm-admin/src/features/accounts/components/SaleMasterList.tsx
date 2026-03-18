"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { TableFull, Input, SelectInput, NumberInput, Icon, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import {
  useSaleMasterList,
  useCreateSaleMaster,
  useUpdateSaleMaster,
} from "../hooks/useAccounts";

// -- Constants ---------------------------------------------------------------

const TAXABILITY_OPTIONS = [
  { value: "TAXABLE",    label: "Taxable" },
  { value: "EXEMPTED",   label: "Exempted" },
  { value: "NIL_RATED",  label: "Nil Rated" },
  { value: "ZERO_RATED", label: "Zero Rated" },
];

const NATURE_OPTIONS = [
  { value: "SALES",        label: "Sales" },
  { value: "SALES_RETURN", label: "Sales Return" },
  { value: "EXPORT",       label: "Export" },
  { value: "SEZ",          label: "SEZ" },
];

const COLUMNS = [
  { id: "name",        label: "Sales Type",  visible: true },
  { id: "igstRate",    label: "IGST %",      visible: true },
  { id: "cgstRate",    label: "CGST %",      visible: true },
  { id: "sgstRate",    label: "SGST %",      visible: true },
  { id: "cessRate",    label: "CESS %",      visible: true },
  { id: "taxability",  label: "Taxability",  visible: true },
  { id: "isDefault",   label: "Default",     visible: true },
];

const INITIAL_FORM = {
  name: "",
  code: "",
  igstRate: null as number | null,
  cgstRate: null as number | null,
  sgstRate: null as number | null,
  cessRate: null as number | null,
  taxability: "TAXABLE",
  natureOfTransaction: "SALES",
  isDefault: false,
  localLedgerId: "",
  centralLedgerId: "",
};

// -- Inner Form (adapted for useEntityPanel) ---------------------------------

function SaleMasterForm({
  saleMasterId,
  onSuccess,
  panelId,
  mode,
}: {
  saleMasterId?: string;
  onSuccess?: () => void;
  panelId?: string;
  mode?: string;
}) {
  const { data } = useSaleMasterList();
  const isEdit = !!saleMasterId;

  // Load initial data from list for edit mode
  const initialData = useMemo(() => {
    if (!isEdit) return INITIAL_FORM;
    const list: any[] = (data as any)?.data ?? [];
    const sm = list.find((s: any) => s.id === saleMasterId);
    if (!sm) return INITIAL_FORM;
    return {
      name:                sm.name,
      code:                sm.code,
      igstRate:            Number(sm.igstRate),
      cgstRate:            Number(sm.cgstRate),
      sgstRate:            Number(sm.sgstRate),
      cessRate:            Number(sm.cessRate),
      taxability:          sm.taxability,
      natureOfTransaction: sm.natureOfTransaction ?? "SALES",
      isDefault:           sm.isDefault,
      localLedgerId:       sm.localLedgerId ?? "",
      centralLedgerId:     sm.centralLedgerId ?? "",
    };
  }, [data, saleMasterId, isEdit]);

  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const createMutation = useCreateSaleMaster();
  const updateMutation = useUpdateSaleMaster();
  const set = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }));

  async function handleSave() {
    if (!form.name || !form.code) {
      toast.error("Name and Code are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: saleMasterId!, data: form });
        toast.success("Sale master updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Sale master created");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      id={`sp-form-sale-master-${saleMasterId ?? "new"}`}
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input
          label="Sales Type Name *"
          value={form.name}
          onChange={(v) => set("name", v)}
          leftIcon={<Icon name="tag" size={16} />}
        />
        <Input
          label="Code *"
          value={form.code}
          onChange={(v) => set("code", v)}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <NumberInput
          label="IGST %"
          value={form.igstRate}
          onChange={(v) => set("igstRate", v)}
        />
        <NumberInput
          label="CGST %"
          value={form.cgstRate}
          onChange={(v) => set("cgstRate", v)}
        />
        <NumberInput
          label="SGST %"
          value={form.sgstRate}
          onChange={(v) => set("sgstRate", v)}
        />
        <NumberInput
          label="CESS %"
          value={form.cessRate}
          onChange={(v) => set("cessRate", v)}
        />
        <SelectInput
          label="Taxability"
          value={form.taxability}
          options={TAXABILITY_OPTIONS}
          onChange={(v) => set("taxability", String(v ?? "TAXABLE"))}
          leftIcon={<Icon name="percent" size={16} />}
        />
        <SelectInput
          label="Nature of Transaction"
          value={form.natureOfTransaction}
          options={NATURE_OPTIONS}
          onChange={(v) => set("natureOfTransaction", String(v ?? "SALES"))}
          leftIcon={<Icon name="file-text" size={16} />}
        />
      </div>
    </form>
  );
}

// -- List Component ----------------------------------------------------------

export function SaleMasterList() {
  const { data } = useSaleMasterList();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "sale-master",
    entityLabel: "Sale Master",
    FormComponent: SaleMasterForm,
    idProp: "saleMasterId",
    editRoute: "/accounts/sale-masters/:id/edit",
    createRoute: "/accounts/sale-masters/new",
    displayField: "name",
    panelWidth: 600,
  });

  const rows = useMemo(() => {
    const list: any[] = (data as any)?.data ?? [];
    return list.map((sm: any) => ({
      id:          sm.id,
      name:        sm.name,
      igstRate:    Number(sm.igstRate ?? 0).toFixed(2),
      cgstRate:    Number(sm.cgstRate ?? 0).toFixed(2),
      sgstRate:    Number(sm.sgstRate ?? 0).toFixed(2),
      cessRate:    Number(sm.cessRate ?? 0).toFixed(2),
      taxability:  sm.taxability,
      isDefault:   sm.isDefault ? <Badge variant="success">Default</Badge> : "\u2014",
    }));
  }, [data]);

  return (
    <TableFull
      data={rows}
      title="Sale Master"
      tableKey="sale-masters"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
