"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import { Icon, Button, Input, SelectInput, NumberInput } from "@/components/ui";
import { AddressFields } from "@/components/common/AddressFields";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { LedgerSourcePicker } from "./LedgerSourcePicker";
import type { SourceEntity } from "./LedgerSourcePicker";

import {
  useCreateRichLedger,
  useUpdateLedger,
  useLedgerDetail,
  useGroupFlat,
  useCreateLedgerMapping,
} from "../hooks/useAccounts";

// ── primaryGroup → simple groupType (mirrors backend resolveGroupType) ────

const ASSET_GROUPS = new Set(['CURRENT_ASSETS','FIXED_ASSETS','INVESTMENTS','MISC_EXPENSES',
  'BANK_ACCOUNTS','CASH_IN_HAND','DEPOSITS_ASSET','LOANS_ADVANCES_ASSET',
  'STOCK_IN_HAND','SUNDRY_DEBTORS','BRANCH_DIVISIONS']);
const LIABILITY_GROUPS = new Set(['CURRENT_LIABILITIES','LOANS_LIABILITY','DUTIES_TAXES',
  'PROVISIONS','SUNDRY_CREDITORS','BANK_OD','SECURED_LOANS','UNSECURED_LOANS']);
const EQUITY_GROUPS = new Set(['CAPITAL','CAPITAL_ACCOUNT','RESERVES_SURPLUS','PROFIT_LOSS']);
const INCOME_GROUPS = new Set(['REVENUE','REVENUE_ACCOUNT','DIRECT_INCOMES']);
const EXPENSE_GROUPS = new Set(['EXPENDITURE','EXPENDITURE_ACCOUNT','DIRECT_EXPENSES','INDIRECT_EXPENSES']);

function resolveGroupType(primaryGroup: string): string {
  if (ASSET_GROUPS.has(primaryGroup)) return 'ASSET';
  if (LIABILITY_GROUPS.has(primaryGroup)) return 'LIABILITY';
  if (EQUITY_GROUPS.has(primaryGroup)) return 'EQUITY';
  if (INCOME_GROUPS.has(primaryGroup)) return 'INCOME';
  if (EXPENSE_GROUPS.has(primaryGroup)) return 'EXPENSE';
  return primaryGroup;
}

// ── Constants ─────────────────────────────────────────────────────────────

const GROUP_TYPE_OPTIONS = [
  { value: "ASSET", label: "Asset" },
  { value: "LIABILITY", label: "Liability" },
  { value: "EQUITY", label: "Equity" },
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
];

const BALANCING_OPTIONS = [
  { value: "Bill By Bill", label: "Bill By Bill" },
  { value: "On Account", label: "On Account" },
];

const OB_TYPE_OPTIONS = [
  { value: "Dr", label: "Dr (Debit)" },
  { value: "Cr", label: "Cr (Credit)" },
];

const LEDGER_TYPE_OPTIONS = [
  { value: "Registered", label: "Registered" },
  { value: "Unregistered", label: "Unregistered" },
  { value: "Composition", label: "Composition" },
  { value: "Consumer", label: "Consumer" },
];

const TABS = ["General", "GST / Tax", "Bank Details", "Contact"] as const;
type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { icon: string; color: string; bg: string; desc: string }> = {
  "General":      { icon: "list",           color: "#2563eb", bg: "#eff6ff", desc: "Party, group & address" },
  "GST / Tax":    { icon: "file-badge",    color: "#7c3aed", bg: "#f5f3ff", desc: "GSTIN, PAN & tax type" },
  "Bank Details": { icon: "landmark",      color: "#0891b2", bg: "#ecfeff", desc: "Account & IFSC" },
  "Contact":      { icon: "phone",         color: "#059669", bg: "#ecfdf5", desc: "Mobile, email & WhatsApp" },
};

// ── Types ─────────────────────────────────────────────────────────────────

interface LedgerFormProps {
  ledgerId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function LedgerForm({
  ledgerId,
  mode = "page",
  panelId,
  onSuccess,
  onCancel,
}: LedgerFormProps) {
  const isEdit = !!ledgerId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);
  const createLedger = useCreateRichLedger();
  const updateLedger = useUpdateLedger();
  const createMapping = useCreateLedgerMapping();
  const { data: detail } = useLedgerDetail(ledgerId ?? "");
  const { data: groupData } = useGroupFlat();

  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Source entity (from picker — create mode only)
  const [sourceEntity, setSourceEntity] = useState<SourceEntity | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    aliasName: "",
    groupType: "",
    accountGroupId: "",
    station: "",
    mailTo: "",
    address: "",
    country: "India",
    countryCode: "IN",
    state: "",
    stateCode: "",
    city: "",
    pincode: "",
    gstStateCode: "",
    currency: "INR",
    balancingMethod: "Bill By Bill",
    openingBalance: null as number | null,
    openingBalanceType: "Dr",
    creditDays: null as number | null,
    creditLimit: null as number | null,
    phoneOffice: "",
    mobile1: "",
    mobile2: "",
    whatsappNo: "",
    email: "",
    ledgerType: "Registered",
    panNo: "",
    gstin: "",
    gstApplicable: false,
    gstType: "",
    bankName: "",
    bankAccountNo: "",
    bankIfsc: "",
    bankBranch: "",
  });

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Pre-fill in edit mode
  useEffect(() => {
    if (!isEdit || !detail) return;
    const d = (detail as any)?.data ?? detail;
    setForm({
      code: d.code ?? "",
      name: d.name ?? "",
      aliasName: d.aliasName ?? "",
      groupType: d.groupType ?? "",
      accountGroupId: d.accountGroupId ?? "",
      station: d.station ?? "",
      mailTo: d.mailTo ?? "",
      address: d.address ?? "",
      country: d.country ?? "India",
      countryCode: d.countryCode ?? "IN",
      state: d.state ?? "",
      stateCode: d.stateCode ?? "",
      city: d.city ?? "",
      pincode: d.pincode ?? "",
      gstStateCode: d.gstStateCode ?? "",
      currency: d.currency ?? "INR",
      balancingMethod: d.balancingMethod ?? "Bill By Bill",
      openingBalance: d.openingBalance != null ? Number(d.openingBalance) : null,
      openingBalanceType: d.openingBalanceType ?? "Dr",
      creditDays: d.creditDays ?? null,
      creditLimit: d.creditLimit != null ? Number(d.creditLimit) : null,
      phoneOffice: d.phoneOffice ?? "",
      mobile1: d.mobile1 ?? "",
      mobile2: d.mobile2 ?? "",
      whatsappNo: d.whatsappNo ?? "",
      email: d.email ?? "",
      ledgerType: d.ledgerType ?? "Registered",
      panNo: d.panNo ?? "",
      gstin: d.gstin ?? "",
      gstApplicable: d.gstApplicable ?? false,
      gstType: d.gstType ?? "",
      bankName: d.bankName ?? "",
      bankAccountNo: d.bankAccountNo ?? "",
      bankIfsc: d.bankIfsc ?? "",
      bankBranch: d.bankBranch ?? "",
    });
  }, [isEdit, detail]);

  // Pre-fill from picker selection
  useEffect(() => {
    if (!sourceEntity) return;
    setForm((p) => ({
      ...p,
      name:        sourceEntity.name,
      address:     sourceEntity.address,
      city:        sourceEntity.city,
      state:       sourceEntity.state,
      pincode:     sourceEntity.pincode,
      country:     sourceEntity.country || "India",
      mobile1:     sourceEntity.mobile,
      email:       sourceEntity.email,
      phoneOffice: sourceEntity.phoneOffice,
      panNo:       sourceEntity.panNo,
      gstin:       sourceEntity.gstin,
    }));
  }, [sourceEntity]);

  // Build group options AND keep a lookup map so we can auto-derive groupType
  const groupList: any[] = useMemo(
    () => (groupData as any)?.data ?? [],
    [groupData],
  );

  const groupOptions = useMemo(
    () => groupList.map((g: any) => ({ value: g.id, label: g.name })),
    [groupList],
  );

  // Auto-set groupType from the selected group's primaryGroup field
  function handleGroupChange(groupId: string) {
    set("accountGroupId", groupId);
    const grp = groupList.find((g: any) => g.id === groupId);
    if (grp?.primaryGroup) {
      set("groupType", resolveGroupType(grp.primaryGroup));
    }
  }

  const formId = `sp-form-ledger-${ledgerId ?? "new"}`;

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          disabled: isSubmitting,
          onClick: () => {},
        },
        {
          id: "save",
          label: isSubmitting
            ? isEdit ? "Updating..." : "Saving..."
            : isEdit ? "Save Changes" : "Create Ledger",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const f = document.getElementById(formId) as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, ledgerId, formId, updatePanelConfig]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      toast.error("Party Name is required");
      return;
    }
    if (!form.accountGroupId) {
      toast.error("Account Group is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = { ...form };
      // If code is blank, omit it — backend will auto-generate
      if (!payload.code?.trim()) delete payload.code;
      if (isEdit && ledgerId) {
        await updateLedger.mutateAsync({ id: ledgerId, data: payload });
        toast.success("Ledger updated");
      } else {
        const created = await createLedger.mutateAsync(payload);
        const newLedgerId = (created as any)?.data?.id ?? (created as any)?.id;

        // Auto-create ledger mapping if a source entity was selected
        if (newLedgerId && sourceEntity) {
          const entityType = sourceEntity.type === "organization" ? "ORGANIZATION" : "CONTACT";
          await createMapping.mutateAsync({
            ledgerId: newLedgerId,
            entityType,
            entityId: sourceEntity.id,
            entityName: sourceEntity.name,
            mappingType: entityType === "ORGANIZATION" ? "SUPPLIER_CUSTOMER" : "CUSTOMER",
            gstin: sourceEntity.gstin || undefined,
            pan: sourceEntity.panNo || undefined,
          });
          toast.success("Ledger created & mapped to " + sourceEntity.name);
        } else {
          toast.success("Ledger created");
        }
      }
      if (mode === "panel" && onSuccess) onSuccess();
    } catch {
      toast.error("Failed to save ledger");
    } finally {
      setIsSubmitting(false);
    }
  }

  const tabContent: Record<Tab, React.ReactNode> = {
    General: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Input
            label="Code"
            value={form.code}
            onChange={(v) => set("code", v)}
            leftIcon={<Icon name="hash" size={16} />}
            placeholder="Leave blank to auto-generate"
          />
          {!form.code && (
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
              Auto-generate from name (e.g. RAM001)
            </div>
          )}
        </div>
        <Input
          label="Party Name *"
          value={form.name}
          onChange={(v) => set("name", v)}
          leftIcon={<Icon name="user" size={16} />}
        />
        <Input
          label="Alias Name"
          value={form.aliasName}
          onChange={(v) => set("aliasName", v)}
          leftIcon={<Icon name="tag" size={16} />}
        />
        {/* Account Group — groupType auto-derived from selection */}
        <div>
          <SelectInput
            label="Account Group *"
            value={form.accountGroupId}
            options={groupOptions}
            onChange={(v) => handleGroupChange(String(v ?? ""))}
            leftIcon={<Icon name="folder-tree" size={16} />}
          />
          {form.groupType && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <Icon name="check-circle" size={12} color="#16a34a" />
              <span style={{ fontSize: 11, color: "#16a34a" }}>
                Type auto-set: <strong>{form.groupType}</strong>
              </span>
            </div>
          )}
        </div>
        {/* Row 3: Mail To | Currency */}
        <Input
          label="Mail To"
          value={form.mailTo}
          onChange={(v) => set("mailTo", v)}
          leftIcon={<Icon name="mail" size={16} />}
        />
        <SelectInput
          label="Currency"
          value={form.currency}
          options={[
            { value: "INR", label: "₹ INR" },
            { value: "USD", label: "$ USD" },
          ]}
          onChange={(v) => set("currency", String(v ?? "INR"))}
        />
        {/* Row 4: Address full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <Input
            label="Address"
            value={form.address}
            onChange={(v) => set("address", v)}
            leftIcon={<Icon name="map" size={16} />}
          />
        </div>
        {/* Row 5: Country | State  /  City | Pincode — 2-col pairs */}
        <div style={{ gridColumn: "1 / -1" }}>
          <AddressFields
            countryCode={form.countryCode}
            stateCode={form.stateCode}
            city={form.city}
            pincode={form.pincode}
            columns={2}
            onChange={(patch) =>
              setForm((prev) => ({
                ...prev,
                ...(patch.countryCode !== undefined && { countryCode: patch.countryCode }),
                ...(patch.country   !== undefined && { country:   patch.country }),
                ...(patch.stateCode !== undefined && { stateCode: patch.stateCode }),
                ...(patch.state     !== undefined && { state:     patch.state }),
                ...(patch.city      !== undefined && { city:      patch.city }),
                ...(patch.pincode   !== undefined && { pincode:   patch.pincode }),
                ...(patch.gstStateCode !== undefined && { gstStateCode: patch.gstStateCode }),
              }))
            }
          />
        </div>
        {/* Row 6: Station/Branch | Balancing Method */}
        <Input
          label="Station / Branch"
          value={form.station}
          onChange={(v) => set("station", v)}
          leftIcon={<Icon name="map-pin" size={16} />}
        />
        <SelectInput
          label="Balancing Method"
          value={form.balancingMethod}
          options={BALANCING_OPTIONS}
          onChange={(v) => set("balancingMethod", String(v ?? "Bill By Bill"))}
        />
        {/* Row 7: Opening Balance+Dr/Cr | Credit Days */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <NumberInput
              label="Opening Balance"
              value={form.openingBalance}
              onChange={(v) => set("openingBalance", v)}
            />
          </div>
          <div style={{ width: 110 }}>
            <SelectInput
              label="Dr/Cr"
              value={form.openingBalanceType}
              options={OB_TYPE_OPTIONS}
              onChange={(v) => set("openingBalanceType", String(v ?? "Dr"))}
            />
          </div>
        </div>
        <NumberInput
          label="Credit Days"
          value={form.creditDays}
          onChange={(v) => set("creditDays", v)}
        />
        {/* Row 8: Credit Limit | (empty) */}
        <NumberInput
          label="Credit Limit (₹)"
          value={form.creditLimit}
          onChange={(v) => set("creditLimit", v)}
        />
      </div>
    ),
    "GST / Tax": (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SelectInput
          label="Ledger Type"
          value={form.ledgerType}
          options={LEDGER_TYPE_OPTIONS}
          onChange={(v) => set("ledgerType", String(v ?? ""))}
        />
        <Input
          label="PAN No"
          value={form.panNo}
          onChange={(v) => set("panNo", v)}
          leftIcon={<Icon name="credit-card" size={16} />}
        />
        <div style={{ gridColumn: "1 / -1" }}>
          <Input
            label="GSTIN"
            value={form.gstin}
            onChange={(v) => set("gstin", v)}
            leftIcon={<Icon name="file-badge" size={16} />}
          />
        </div>
        <SelectInput
          label="GST Type"
          value={form.gstType}
          options={[
            { value: "INPUT", label: "Input (Purchase)" },
            { value: "OUTPUT", label: "Output (Sale)" },
          ]}
          onChange={(v) => set("gstType", String(v ?? ""))}
        />
      </div>
    ),
    "Bank Details": (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input
          label="Bank Name"
          value={form.bankName}
          onChange={(v) => set("bankName", v)}
          leftIcon={<Icon name="landmark" size={16} />}
        />
        <Input
          label="Account No"
          value={form.bankAccountNo}
          onChange={(v) => set("bankAccountNo", v)}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <Input
          label="IFSC Code"
          value={form.bankIfsc}
          onChange={(v) => set("bankIfsc", v)}
          leftIcon={<Icon name="code" size={16} />}
        />
        <Input
          label="Branch"
          value={form.bankBranch}
          onChange={(v) => set("bankBranch", v)}
          leftIcon={<Icon name="map-pin" size={16} />}
        />
      </div>
    ),
    Contact: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input
          label="Phone (Office)"
          value={form.phoneOffice}
          onChange={(v) => set("phoneOffice", v)}
          leftIcon={<Icon name="phone" size={16} />}
        />
        <Input
          label="Mobile No. 1"
          value={form.mobile1}
          onChange={(v) => set("mobile1", v)}
          leftIcon={<Icon name="smartphone" size={16} />}
        />
        <Input
          label="Mobile No. 2"
          value={form.mobile2}
          onChange={(v) => set("mobile2", v)}
          leftIcon={<Icon name="smartphone" size={16} />}
        />
        <Input
          label="WhatsApp No"
          value={form.whatsappNo}
          onChange={(v) => set("whatsappNo", v)}
          leftIcon={<Icon name="message-circle" size={16} />}
        />
        <div style={{ gridColumn: "1 / -1" }}>
          <Input
            label="Email"
            value={form.email}
            onChange={(v) => set("email", v)}
            leftIcon={<Icon name="mail" size={16} />}
          />
        </div>
      </div>
    ),
  };

  const inner = (
    <form id={formId} onSubmit={handleSubmit}>
      {/* ── Inline party search (create mode only) ── */}
      {!isEdit && (
        <LedgerSourcePicker
          selected={sourceEntity}
          onSelect={(entity) => setSourceEntity(entity)}
        />
      )}

      {/* Tab bar — smart card style */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        marginBottom: 20,
      }}>
        {TABS.map((tab) => {
          const meta = TAB_META[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
                padding: "10px 12px",
                border: `1.5px solid ${isActive ? meta.color : "#e2e8f0"}`,
                borderRadius: 10,
                background: isActive ? meta.bg : "white",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: isActive ? `0 2px 8px ${meta.color}22` : "none",
                position: "relative",
                overflow: "hidden",
                textAlign: "left",
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: meta.color,
                  borderRadius: "10px 10px 0 0",
                }} />
              )}
              {/* Icon circle */}
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive ? meta.color : "#f1f5f9",
                flexShrink: 0,
              }}>
                <span style={{ color: isActive ? "white" : "#64748b", display: "flex" }}>
                  <Icon name={meta.icon as any} size={15} />
                </span>
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? meta.color : "#0f172a",
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}>
                  {tab}
                </div>
                <div style={{
                  fontSize: 10,
                  color: isActive ? meta.color : "#94a3b8",
                  lineHeight: 1.3,
                  opacity: isActive ? 0.8 : 1,
                }}>
                  {meta.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content card */}
      <div style={{
        background: "white",
        border: `1.5px solid ${TAB_META[activeTab].color}33`,
        borderRadius: 12,
        padding: 20,
        boxShadow: `0 1px 6px ${TAB_META[activeTab].color}11`,
      }}>
        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
          paddingBottom: 12, borderBottom: `1px solid ${TAB_META[activeTab].color}22`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: TAB_META[activeTab].bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: TAB_META[activeTab].color, display: "flex" }}>
              <Icon name={TAB_META[activeTab].icon as any} size={14} />
            </span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{activeTab}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{TAB_META[activeTab].desc}</div>
          </div>
        </div>
        {tabContent[activeTab]}
      </div>

      {mode === "page" && (
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => onCancel?.()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit ? "Updating..." : "Creating..."
              : isEdit ? "Save Changes" : "Create Ledger"}
          </Button>
        </div>
      )}
    </form>
  );

  if (mode === "panel") return <div className="p-4">{inner}</div>;
  return <div className="p-6">{inner}</div>;
}
