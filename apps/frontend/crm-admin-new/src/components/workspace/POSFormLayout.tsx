"use client";

import { useCallback, useMemo } from "react";
import { Icon } from "@/components/ui";
import { useTabStore } from "@/stores/tab.store";
import { POSItemTable, type LineItem } from "./POSItemTable";

// ── Summary panel ─────────────────────────────────────

function SummaryPanel({
  items,
  hasTax,
  hasDiscount,
  notes,
  onNotesChange,
  onSave,
  isSaving,
  entityLabel,
  entityId,
  onEntityChange,
}: {
  items: LineItem[];
  hasTax: boolean;
  hasDiscount: boolean;
  notes: string;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  entityLabel: string;
  entityId: string;
  onEntityChange: (v: string) => void;
}) {
  const subtotal = items.reduce((acc, i) => acc + i.qty * i.rate, 0);
  const discountAmount = items.reduce(
    (acc, i) => acc + (i.qty * i.rate * (i.discPct ?? 0)) / 100,
    0,
  );
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = items.reduce(
    (acc, i) => acc + ((i.qty * i.rate - (i.qty * i.rate * (i.discPct ?? 0)) / 100) * (i.taxPct ?? 0)) / 100,
    0,
  );
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="pos-summary-panel">
      {/* Entity selector */}
      <div className="pos-summary-section">
        <label className="pos-summary-label">{entityLabel}</label>
        <input
          className="pos-summary-input"
          placeholder={`Enter ${entityLabel} ID…`}
          value={entityId}
          onChange={(e) => onEntityChange(e.target.value)}
        />
      </div>

      {/* Totals */}
      <div className="pos-summary-section">
        <div className="pos-summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        {hasDiscount && discountAmount > 0 && (
          <div className="pos-summary-row discount">
            <span>Discount</span>
            <span>−₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {hasTax && taxAmount > 0 && (
          <div className="pos-summary-row">
            <span>Tax</span>
            <span>+₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="pos-summary-total">
          <span>Grand Total</span>
          <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="pos-summary-section">
        <label className="pos-summary-label">Notes</label>
        <textarea
          className="pos-summary-textarea"
          rows={3}
          placeholder="Additional notes…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      {/* Save */}
      <button
        className="pos-save-btn"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <><Icon name="loader" size={15} /> Saving…</>
        ) : (
          <><Icon name="save" size={15} /> Save Document</>
        )}
      </button>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────

export function POSFormLayout() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const updateTabData = useTabStore((s) => s.updateTabData);
  const setTabDirty = useTabStore((s) => s.setTabDirty);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId],
  );

  const handleItemsChange = useCallback(
    (items: LineItem[]) => {
      if (!activeTabId) return;
      updateTabData(activeTabId, { items });
    },
    [activeTabId, updateTabData],
  );

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      if (!activeTabId) return;
      updateTabData(activeTabId, { [field]: value });
    },
    [activeTabId, updateTabData],
  );

  const handleSave = useCallback(() => {
    if (!activeTabId) return;
    // Actual API call would happen here — for now mark clean
    setTabDirty(activeTabId, false);
  }, [activeTabId, setTabDirty]);

  if (!activeTab) {
    return (
      <div className="pos-no-tab">
        <Icon name="file-plus" size={40} />
        <p>No active tab. Open a document from the tab bar.</p>
      </div>
    );
  }

  const { formData, documentType } = activeTab;

  // Lazy import config inside component (already imported via store)
  // We inline column detection from formData
  const items: LineItem[] = Array.isArray(formData.items) ? formData.items : [];

  // Column list from DOCUMENT_CONFIG — already on the tab (we can derive from store)
  // Determine columns by checking formData flags stored in config
  const columnsByType: Record<string, string[]> = {
    SALE_INVOICE: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    SALE_ORDER: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    QUOTATION: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    PROFORMA_INVOICE: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    DELIVERY_CHALLAN: ["#", "Item", "Qty", "Unit", "Batch", "Serial", "Location"],
    SALE_RETURN: ["#", "Item", "Qty", "Unit", "Rate", "Reason", "Amount"],
    CREDIT_NOTE: ["#", "Item", "Qty", "Unit", "Rate", "Tax%", "Amount"],
    PURCHASE_ORDER: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    PURCHASE_INVOICE: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    GOODS_RECEIPT: ["#", "Item", "Qty", "Unit", "Amount"],
    DEBIT_NOTE: ["#", "Item", "Qty", "Unit", "Rate", "Tax%", "Amount"],
    RFQ: ["#", "Item", "Qty", "Unit", "Amount"],
    JOURNAL_ENTRY: ["#", "Ledger", "Debit", "Credit", "Narration"],
    PAYMENT_IN: ["#", "Invoice", "Amount"],
    PAYMENT_OUT: ["#", "Invoice", "Amount"],
    WARRANTY_CLAIM: ["Product", "Serial", "Issue", "Type"],
  };
  const columns = columnsByType[documentType] ?? ["#", "Item", "Qty", "Rate", "Amount"];

  const hasTax = columns.includes("Tax%");
  const hasDiscount = columns.includes("Disc%");

  const entityLabel = ["PURCHASE_ORDER", "PURCHASE_INVOICE", "GOODS_RECEIPT", "DEBIT_NOTE", "RFQ", "PAYMENT_OUT"].includes(documentType)
    ? "Vendor ID"
    : "Customer ID";

  const entityField = ["PURCHASE_ORDER", "PURCHASE_INVOICE", "GOODS_RECEIPT", "DEBIT_NOTE", "RFQ", "PAYMENT_OUT"].includes(documentType)
    ? "vendorId"
    : "customerId";

  return (
    <div className="pos-form-layout">
      {/* Left: item table (60%) */}
      <div className="pos-items-area">
        <div className="pos-items-header">
          <span
            className="pos-items-dot"
            style={{ background: activeTab.color }}
          />
          <span>{activeTab.title}</span>
          {activeTab.isDirty && (
            <span className="pos-unsaved-badge">Unsaved</span>
          )}
        </div>
        <POSItemTable
          columns={columns}
          items={items}
          onChange={handleItemsChange}
        />
      </div>

      {/* Right: summary (40%) */}
      <SummaryPanel
        items={items}
        hasTax={hasTax}
        hasDiscount={hasDiscount}
        notes={formData.notes ?? ""}
        onNotesChange={(v) => handleFieldChange("notes", v)}
        onSave={handleSave}
        entityLabel={entityLabel}
        entityId={(formData[entityField] as string) ?? ""}
        onEntityChange={(v) => handleFieldChange(entityField, v)}
      />
    </div>
  );
}
