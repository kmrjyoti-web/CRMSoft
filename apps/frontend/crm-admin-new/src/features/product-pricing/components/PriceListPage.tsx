"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TableFull, Badge, Button, Input, Drawer } from "@/components/ui";
import toast from "react-hot-toast";
import { priceListsService, type CreatePriceListDto, type PriceListRecord } from "../services/price-lists.service";

// ── Hooks ────────────────────────────────────────────────────────────────────

function usePriceLists(params?: { search?: string }) {
  return useQuery({
    queryKey: ["price-lists", params],
    queryFn: () => priceListsService.list(params),
  });
}

function useCreatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePriceListDto) => priceListsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-lists"] });
      toast.success("Price list created");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to create"),

  });
}

function useUpdatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreatePriceListDto> }) => priceListsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-lists"] });
      toast.success("Price list updated");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update"),
  });
}

function useDeletePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => priceListsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-lists"] });
      toast.success("Price list deleted");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to delete"),
  });
}

// ── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "currency", label: "Currency", visible: true },
  { id: "products", label: "Products", visible: true },
  { id: "valid", label: "Valid Period", visible: true },
  { id: "priority", label: "Priority", visible: true },
  { id: "status", label: "Status", visible: true },
];

function flattenRows(lists: PriceListRecord[]) {
  return lists.map((pl) => ({
    id: pl.id,
    name: <span style={{ fontWeight: 600 }}>{pl.name}</span>,
    currency: pl.currency,
    products: <Badge variant="outline">{pl._count?.items ?? 0} products</Badge>,
    valid: pl.validFrom ? `${new Date(pl.validFrom).toLocaleDateString()} – ${pl.validTo ? new Date(pl.validTo).toLocaleDateString() : "∞"}` : "Always",
    priority: pl.priority,
    status: <Badge variant={pl.isActive ? "success" : "secondary"}>{pl.isActive ? "Active" : "Inactive"}</Badge>,
    _raw: pl,
  }));
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface FormState { name: string; description: string; currency: string; priority: number; isActive: boolean; validFrom: string; validTo: string }
const emptyForm = (): FormState => ({ name: "", description: "", currency: "INR", priority: 0, isActive: true, validFrom: "", validTo: "" });

function PriceListForm({ initial, onSubmit, isPending }: { initial: FormState; onSubmit: (v: FormState) => void; isPending: boolean }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input label="Name *" value={form.name} onChange={(v) => set("name", v)} />
      <Input label="Description" value={form.description} onChange={(v) => set("description", v)} />
      <Input label="Currency" value={form.currency} onChange={(v) => set("currency", v)} />
      <Input label="Priority (0=highest)" type="number" value={String(form.priority)} onChange={(v) => set("priority", Number(v))} />
      <Input label="Valid From" type="date" value={form.validFrom} onChange={(v) => set("validFrom", v)} />
      <Input label="Valid To" type="date" value={form.validTo} onChange={(v) => set("validTo", v)} />
      <Button onClick={() => onSubmit(form)} disabled={isPending || !form.name.trim()}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PriceListPage() {
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PriceListRecord | null>(null);

  const { data, isLoading } = usePriceLists({ search: search || undefined });
  const createMutation = useCreatePriceList();
  const updateMutation = useUpdatePriceList();
  const deleteMutation = useDeletePriceList();

  const lists: PriceListRecord[] = useMemo(() => {
    const raw = (data as any)?.data;
    return Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
  }, [data]);

  const rows = useMemo(() => (isLoading ? [] : flattenRows(lists)), [lists, isLoading]);

  const handleCreate = () => { setEditTarget(null); setDrawerOpen(true); };
  const handleRowEdit = (row: any) => { setEditTarget(row._raw); setDrawerOpen(true); };
  const handleDelete = (row: any) => deleteMutation.mutate(row._raw.id);

  const handleSubmit = (form: FormState) => {
    const dto: CreatePriceListDto = {
      name: form.name,
      description: form.description || undefined,
      currency: form.currency,
      priority: form.priority,
      isActive: form.isActive,
      validFrom: form.validFrom || undefined,
      validTo: form.validTo || undefined,
    };
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, dto }, { onSuccess: () => setDrawerOpen(false) });
    } else {
      createMutation.mutate(dto, { onSuccess: () => setDrawerOpen(false) });
    }
  };

  const formInitial = editTarget
    ? { name: editTarget.name, description: editTarget.description ?? "", currency: editTarget.currency, priority: editTarget.priority, isActive: editTarget.isActive, validFrom: editTarget.validFrom?.slice(0, 10) ?? "", validTo: editTarget.validTo?.slice(0, 10) ?? "" }
    : emptyForm();

  return (
    <>
      <TableFull
        data={rows}
        title="Price Lists"
        tableKey="products-price-lists"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        isLoading={isLoading}
        onRowEdit={handleRowEdit}
        onRowDelete={handleDelete}
        onCreate={handleCreate}
      />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editTarget ? "Edit Price List" : "New Price List"} position="right">
        <PriceListForm
          key={editTarget?.id ?? "new"}
          initial={formInitial}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </Drawer>
    </>
  );
}
