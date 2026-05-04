"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Button, Icon, NumberInput, CurrencyInput, SelectInput, Badge, Checkbox } from "@/components/ui";
import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";
import {
  usePriceList,
  useSetPrices,
  useSetSlabPrices,
  useSetGroupPrice,
  useEffectivePrice,
} from "../hooks/useProductPricing";
import type { PriceType, EffectivePrice } from "../types/product-pricing.types";
import { formatCurrency } from "@/lib/format-currency";

// ── Constants ─────────────────────────────────────────────────────────

const PRICE_TYPES: PriceType[] = ["BASE", "MRP", "SELLING", "WHOLESALE", "DISTRIBUTOR", "SPECIAL"];
const PRICE_TYPE_OPTIONS = PRICE_TYPES.map((t) => ({ label: t, value: t }));

const CURRENCY_SYMBOLS_MAP: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const CURRENCY_OPTIONS_LIST = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
];

const PRICE_TYPE_DESC: Record<PriceType, string> = {
  BASE: "Cost / reference price",
  MRP: "Max Retail Price (printed on product)",
  SELLING: "Default customer price",
  WHOLESALE: "Bulk / wholesale buyers",
  DISTRIBUTOR: "Distribution channel",
  SPECIAL: "Promotional / custom",
};

// ── Tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "base",  label: "Base Prices",  icon: "indian-rupee" },
  { id: "slabs", label: "Slab Pricing", icon: "layers" },
  { id: "groups",label: "Group Prices", icon: "users" },
  { id: "calc",  label: "Calculator",   icon: "calculator" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Interfaces ────────────────────────────────────────────────────────

interface PriceRow  { priceType: PriceType; amount: number | null; currency: string; }
interface SlabRow   { minQty: number; maxQty: number | null; pricePerUnit: number | null; }
interface GroupRow  { groupId: string; priceType: PriceType; amount: number | null; }

interface ProductDefaults {
  mrp?: number | null;
  salePrice?: number | null;
  basePrice?: number | null;
}

interface PriceDrawerFormProps {
  productId: string;
  productName?: string;
  productDefaults?: ProductDefaults;
  panelId?: string;
  initialTab?: TabId;
  onSuccess?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
      {children}
    </div>
  );
}


// ── Base Prices Tab ───────────────────────────────────────────────────

function BasePricesTab({ productId, productDefaults }: { productId: string; productDefaults?: ProductDefaults }) {
  const { data, isLoading, isError } = usePriceList(productId);
  const setPricesMut = useSetPrices();

  // data = ApiResponse<PriceList>, data.data = PriceList
  // Handle possible double-nesting from some backend versions
  const raw = (data as any)?.data;
  const priceList: { prices?: any[] } | null = raw?.prices != null ? raw : (raw?.data ?? null);

  // Build rows from product defaults (shown immediately, before API loads)
  const buildRows = useCallback((prices: any[]): PriceRow[] => {
    return PRICE_TYPES.map((t) => {
      const existing = prices.find((p: any) => p.priceType === t);
      let fallback: number | null = null;
      if (t === "MRP")     fallback = productDefaults?.mrp      ?? null;
      if (t === "SELLING") fallback = productDefaults?.salePrice ?? null;
      if (t === "BASE")    fallback = productDefaults?.basePrice ?? null;
      return {
        priceType: t,
        amount: existing?.amount ?? fallback,
        currency: existing?.currency ?? "INR",
      };
    });
  }, [productDefaults]);

  const [rows, setRows] = useState<PriceRow[]>(() => buildRows([]));

  // When API responds (or errors), rebuild rows
  useEffect(() => {
    if (isLoading) return;
    const prices = priceList?.prices ?? [];
    setRows(buildRows(prices));
  }, [priceList, isLoading, isError, buildRows]);

  const updateRow = (index: number, field: "amount" | "currency", value: string | number | null) =>
    setRows((prev) => {
      const u = [...prev];
      u[index] = { ...u[index], [field]: value };
      return u;
    });

  const handleSave = useCallback(async () => {
    const toSave = rows.filter((r) => r.amount != null && r.amount > 0);
    if (toSave.length === 0) { toast.error("Enter at least one price"); return; }
    try {
      await setPricesMut.mutateAsync({
        productId,
        dto: { prices: toSave.map((r) => ({ priceType: r.priceType, amount: r.amount!, currency: r.currency })) },
      });
      toast.success("Base prices saved");
    } catch { toast.error("Failed to save prices"); }
  }, [productId, rows, setPricesMut]);

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280", textAlign: "center" }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
      <SectionTitle>Set prices for each price type</SectionTitle>

      {rows.map((row, idx) => (
        <div key={row.priceType} style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
          {/* Type badge + description */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Badge variant="outline">{row.priceType}</Badge>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{PRICE_TYPE_DESC[row.priceType]}</span>
            {row.amount != null && row.amount > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#059669" }}>
                {formatCurrency(row.amount)}
              </span>
            )}
          </div>

          <CurrencyInput
            label="Amount"
            value={row.amount}
            onChange={(v) => updateRow(idx, "amount", v)}
            currency={CURRENCY_SYMBOLS_MAP[row.currency] ?? row.currency}
            currencies={CURRENCY_OPTIONS_LIST}
            onCurrencyChange={(opt) => updateRow(idx, "currency", opt.code)}
          />
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
        <Button variant="primary" onClick={handleSave} disabled={setPricesMut.isPending}>
          <Icon name="save" size={16} /> Save Base Prices
        </Button>
      </div>
    </div>
  );
}

// ── Slab Pricing Tab ──────────────────────────────────────────────────

type SlabRowState = SlabRow & { editing: boolean; isNew: boolean };

function SlabPricingTab({ productId }: { productId: string }) {
  const { data, isLoading } = usePriceList(productId);
  const setSlabsMut = useSetSlabPrices();
  const priceList = data?.data;

  const [rows, setRows] = useState<SlabRowState[]>([
    { minQty: 1, maxQty: null, pricePerUnit: null, editing: true, isNew: true },
  ]);

  useEffect(() => {
    if (priceList?.slabPrices?.length) {
      setRows(priceList.slabPrices.map((s: any) => ({
        minQty: s.minQty,
        maxQty: s.maxQty ?? null,
        pricePerUnit: s.pricePerUnit,
        editing: false,
        isNew: false,
      })));
    }
  }, [priceList]);

  const update = (idx: number, field: keyof SlabRow, value: number | null) =>
    setRows((prev) => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });

  const setEditing = (idx: number, editing: boolean) =>
    setRows((prev) => { const u = [...prev]; u[idx] = { ...u[idx], editing }; return u; });

  const addRow = () =>
    setRows((prev) => [...prev, { minQty: 1, maxQty: null, pricePerUnit: null, editing: true, isNew: true }]);

  const removeRow = (idx: number) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSaveAll = useCallback(async () => {
    try {
      await setSlabsMut.mutateAsync({
        productId,
        dto: { slabs: rows.map((r) => ({ minQty: r.minQty, maxQty: r.maxQty ?? undefined, pricePerUnit: r.pricePerUnit ?? 0 })) },
      });
      setRows((prev) => prev.map((r) => ({ ...r, editing: false, isNew: false })));
      toast.success("Slab prices saved");
    } catch { toast.error("Failed to save slabs"); }
  }, [productId, rows, setSlabsMut]);

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280", textAlign: "center" }}>Loading…</div>;

  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th style={{
      padding: "8px 10px", fontSize: 11, fontWeight: 600, color: "#6b7280",
      textTransform: "uppercase", letterSpacing: "0.05em", background: "#f3f4f6",
      textAlign: right ? "right" : "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
    }}>{children}</th>
  );

  const hasEditing = rows.some((r) => r.editing);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
      <SectionTitle>Quantity-based tier pricing</SectionTitle>
      <div style={{ background: "#eff6ff", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="info" size={13} /> Customers automatically get the price for their order quantity range.
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr>
              <TH>Min Qty</TH>
              <TH>Max Qty</TH>
              <TH right>Price / Unit (₹)</TH>
              <TH right>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6", background: row.editing ? "#fafafa" : "#fff" }}>
                {/* Min Qty */}
                <td style={{ padding: "6px 8px" }}>
                  {row.editing ? (
                    <NumberInput value={row.minQty} onChange={(v) => update(idx, "minQty", v)} min={1} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{row.minQty}</span>
                  )}
                </td>
                {/* Max Qty */}
                <td style={{ padding: "6px 8px" }}>
                  {row.editing ? (
                    <NumberInput value={row.maxQty} onChange={(v) => update(idx, "maxQty", v)} placeholder="∞" />
                  ) : (
                    <span style={{ fontSize: 13, color: row.maxQty == null ? "#9ca3af" : "#111827" }}>
                      {row.maxQty ?? "∞"}
                    </span>
                  )}
                </td>
                {/* Price/Unit */}
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {row.editing ? (
                    <NumberInput value={row.pricePerUnit} onChange={(v) => update(idx, "pricePerUnit", v)} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>
                      {row.pricePerUnit != null ? `₹${row.pricePerUnit.toLocaleString("en-IN")}` : "—"}
                    </span>
                  )}
                </td>
                {/* Actions */}
                <td style={{ padding: "6px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    {row.editing ? (
                      <>
                        {/* Save row (check) */}
                        <button
                          title="Confirm row"
                          onClick={() => setEditing(idx, false)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#059669" }}
                        >
                          <Icon name="check" size={15} />
                        </button>
                        {/* Discard new row */}
                        {row.isNew && rows.length > 1 && (
                          <button
                            title="Remove row"
                            onClick={() => removeRow(idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" }}
                          >
                            <Icon name="x" size={15} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Edit */}
                        <button
                          title="Edit"
                          onClick={() => setEditing(idx, true)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}
                        >
                          <Icon name="pencil" size={14} />
                        </button>
                        {/* Delete */}
                        <button
                          title="Delete"
                          onClick={() => removeRow(idx)}
                          disabled={rows.length <= 1}
                          style={{ background: "none", border: "none", cursor: rows.length <= 1 ? "not-allowed" : "pointer", padding: 4, color: rows.length <= 1 ? "#d1d5db" : "#ef4444" }}
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={addRow}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed #d1d5db", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#6b7280" }}
        >
          <Icon name="plus" size={15} /> Add Slab
        </button>
        <Button variant="primary" onClick={handleSaveAll} disabled={setSlabsMut.isPending || hasEditing}>
          <Icon name="save" size={16} />
          {setSlabsMut.isPending ? "Saving…" : `Save All Slabs${rows.length > 0 ? ` (${rows.length})` : ""}`}
        </Button>
      </div>
      {hasEditing && (
        <p style={{ fontSize: 11, color: "#f59e0b", margin: 0 }}>
          ⚠ Confirm all rows (✓) before saving.
        </p>
      )}
    </div>
  );
}

// ── Group Prices Tab ──────────────────────────────────────────────────

type GroupRowState = GroupRow & { editing: boolean; isNew: boolean };

function GroupPricesTab({ productId }: { productId: string }) {
  const { data, isLoading } = usePriceList(productId);
  const setGroupMut = useSetGroupPrice();
  const priceList = data?.data;

  const [rows, setRows] = useState<GroupRowState[]>([
    { groupId: "", priceType: "SELLING", amount: null, editing: true, isNew: true },
  ]);

  useEffect(() => {
    if (priceList?.groupPrices?.length) {
      setRows(priceList.groupPrices.map((g: any) => ({
        groupId: g.groupId, priceType: g.priceType, amount: g.amount,
        editing: false, isNew: false,
      })));
    }
  }, [priceList]);

  const update = (idx: number, field: keyof GroupRow, value: string | number | null) =>
    setRows((prev) => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value as any }; return u; });

  const setEditing = (idx: number, editing: boolean) =>
    setRows((prev) => { const u = [...prev]; u[idx] = { ...u[idx], editing }; return u; });

  const addRow = () =>
    setRows((prev) => [...prev, { groupId: "", priceType: "SELLING", amount: null, editing: true, isNew: true }]);

  const removeRow = (idx: number) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSaveRow = useCallback(async (idx: number, row: GroupRowState) => {
    if (!row.groupId.trim()) { toast.error("Group ID is required"); return; }
    try {
      await setGroupMut.mutateAsync({ productId, dto: { groupId: row.groupId, priceType: row.priceType, amount: row.amount ?? 0 } });
      setEditing(idx, false);
      setRows((prev) => { const u = [...prev]; u[idx] = { ...u[idx], editing: false, isNew: false }; return u; });
      toast.success("Group price saved");
    } catch { toast.error("Failed to save group price"); }
  }, [productId, setGroupMut]);

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280", textAlign: "center" }}>Loading…</div>;

  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th style={{
      padding: "8px 10px", fontSize: 11, fontWeight: 600, color: "#6b7280",
      textTransform: "uppercase", letterSpacing: "0.05em", background: "#f3f4f6",
      textAlign: right ? "right" : "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
    }}>{children}</th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
      <SectionTitle>Customer group-specific prices</SectionTitle>
      <div style={{ background: "#f0fdf4", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#16a34a", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="info" size={13} /> Overrides the default selling price for customers in a specific price group.
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <TH>Group ID</TH>
              <TH>Price Type</TH>
              <TH right>Amount (₹)</TH>
              <TH right>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6", background: row.editing ? "#fafafa" : "#fff" }}>
                {/* Group ID */}
                <td style={{ padding: "6px 8px" }}>
                  {row.editing ? (
                    <input
                      value={row.groupId}
                      onChange={(e) => update(idx, "groupId", e.target.value)}
                      placeholder="e.g. RETAIL"
                      style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12, outline: "none" }}
                    />
                  ) : (
                    <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{row.groupId}</code>
                  )}
                </td>
                {/* Price Type */}
                <td style={{ padding: "6px 8px" }}>
                  {row.editing ? (
                    <SelectInput
                      options={PRICE_TYPE_OPTIONS}
                      value={row.priceType}
                      onChange={(v) => update(idx, "priceType", v as string)}
                    />
                  ) : (
                    <span style={{ fontSize: 12, color: "#374151" }}>{row.priceType}</span>
                  )}
                </td>
                {/* Amount */}
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {row.editing ? (
                    <NumberInput value={row.amount} onChange={(v) => update(idx, "amount", v)} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>
                      {row.amount != null ? `₹${row.amount.toLocaleString("en-IN")}` : "—"}
                    </span>
                  )}
                </td>
                {/* Actions */}
                <td style={{ padding: "6px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    {row.editing ? (
                      <>
                        {/* Save this row to API */}
                        <button
                          title="Save"
                          onClick={() => handleSaveRow(idx, row)}
                          disabled={setGroupMut.isPending}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#2563eb" }}
                        >
                          <Icon name="save" size={14} />
                        </button>
                        {/* Discard */}
                        {row.isNew && rows.length > 1 && (
                          <button
                            title="Cancel"
                            onClick={() => removeRow(idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" }}
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Edit */}
                        <button
                          title="Edit"
                          onClick={() => setEditing(idx, true)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}
                        >
                          <Icon name="pencil" size={14} />
                        </button>
                        {/* Delete */}
                        <button
                          title="Delete"
                          onClick={() => removeRow(idx)}
                          disabled={rows.length <= 1}
                          style={{ background: "none", border: "none", cursor: rows.length <= 1 ? "not-allowed" : "pointer", padding: 4, color: rows.length <= 1 ? "#d1d5db" : "#ef4444" }}
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <button
        onClick={addRow}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed #d1d5db", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#6b7280", alignSelf: "flex-start" }}
      >
        <Icon name="plus" size={15} /> Add Group Price
      </button>
    </div>
  );
}

// ── Calculator Tab ────────────────────────────────────────────────────

function CalculatorTab({ productId }: { productId: string }) {
  const effectivePriceMut = useEffectivePrice();

  const [quantity,       setQuantity]       = useState<number | null>(1);
  const [contactId,      setContactId]      = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isInterState,   setIsInterState]   = useState(false);
  const [result,         setResult]         = useState<EffectivePrice | null>(null);

  const runCalculate = useCallback(async (
    qty: number | null,
    cId: string | null,
    oId: string | null,
    interstate: boolean,
  ) => {
    if (!qty || qty <= 0) { toast.error("Enter a valid quantity"); return; }
    try {
      const res = await effectivePriceMut.mutateAsync({
        productId,
        quantity: qty,
        contactId: cId || undefined,
        organizationId: oId || undefined,
        isInterState: interstate,
      });
      setResult((res as any)?.data ?? res);
      toast.success("Price calculated");
    } catch {
      toast.error("Failed to calculate price");
    }
  }, [productId, effectivePriceMut]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px" }}>
      <SectionTitle>Simulate effective price for a customer</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NumberInput
          label="Quantity"
          value={quantity}
          onChange={(v) => setQuantity(v)}
          min={1}
        />
        <div style={{ display: "flex", alignItems: "center", paddingTop: 8 }}>
          <Checkbox
            checked={isInterState}
            onChange={() => setIsInterState((v) => !v)}
            label="Inter-State GST (IGST)"
          />
        </div>
        <ContactSelect
          value={contactId}
          onChange={(v) => setContactId(v as string | null)}
          label="Contact (Optional)"
          leftIcon={<Icon name="user" size={16} />}
        />
        <OrganizationSelect
          value={organizationId}
          onChange={(v) => setOrganizationId(v as string | null)}
          label="Organization (Optional)"
          leftIcon={<Icon name="building-2" size={16} />}
        />
      </div>

      <Button
        variant="primary"
        onClick={() => runCalculate(quantity, contactId, organizationId, isInterState)}
        disabled={effectivePriceMut.isPending}
        style={{ alignSelf: "flex-start" }}
      >
        <Icon name="calculator" size={16} />
        {effectivePriceMut.isPending ? "Calculating…" : "Calculate Price"}
      </Button>

      {/* Result */}
      {result && (
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 16, border: "1px solid #bbf7d0" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#166534", marginBottom: 12 }}>
            Price Breakup — Qty: {quantity}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Base Price",    value: formatCurrency(result.basePrice) },
              { label: "Selling Price", value: formatCurrency(result.sellingPrice) },
              ...(result.discount ? [{ label: "Discount", value: `-${formatCurrency(result.discount)}`, color: "#16a34a" }] : []),
              ...(result.gstRate != null ? [{ label: `GST (${result.gstRate}%)`, value: formatCurrency(result.gstAmount ?? 0) }] : []),
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>{label}</span>
                <span style={{ fontWeight: 500, color: color ?? "#111827" }}>{value}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Total Amount</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#059669" }}>{formatCurrency(result.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#fffbeb", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#92400e" }}>
        <strong>Priority:</strong> Group Price → Slab Price → SELLING Price → BASE Price
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────

export function PriceDrawerForm({ productId, productName, productDefaults, panelId, initialTab = "base", onSuccess }: PriceDrawerFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tabs — single row with icon + label inline */}
      <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", background: "#fff" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "9px 4px",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--color-primary, #2563eb)" : "2px solid transparent",
              marginBottom: -2,
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "var(--color-primary, #2563eb)" : "#6b7280",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name={tab.icon as any} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "base"   && <BasePricesTab  productId={productId} productDefaults={productDefaults} />}
        {activeTab === "slabs"  && <SlabPricingTab productId={productId} />}
        {activeTab === "groups" && <GroupPricesTab productId={productId} />}
        {activeTab === "calc"   && <CalculatorTab  productId={productId} />}
      </div>
    </div>
  );
}
