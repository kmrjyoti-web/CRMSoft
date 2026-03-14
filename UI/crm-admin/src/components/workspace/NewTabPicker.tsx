"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { useTabStore, DOCUMENT_CONFIG, type DocumentType } from "@/stores/tab.store";

// ── Document groups for display ───────────────────────

const GROUPS: { label: string; types: DocumentType[] }[] = [
  {
    label: "Sales",
    types: ["SALE_INVOICE", "SALE_ORDER", "QUOTATION", "PROFORMA_INVOICE", "DELIVERY_CHALLAN", "SALE_RETURN", "CREDIT_NOTE"],
  },
  {
    label: "Procurement",
    types: ["PURCHASE_ORDER", "PURCHASE_INVOICE", "GOODS_RECEIPT", "DEBIT_NOTE", "RFQ"],
  },
  {
    label: "Accounts",
    types: ["JOURNAL_ENTRY", "PAYMENT_IN", "PAYMENT_OUT"],
  },
  {
    label: "Post-Sales",
    types: ["WARRANTY_CLAIM"],
  },
];

// ── Props ─────────────────────────────────────────────

interface NewTabPickerProps {
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────

export function NewTabPicker({ onClose }: NewTabPickerProps) {
  const addTab = useTabStore((s) => s.addTab);
  const router = useRouter();

  const handlePick = (type: DocumentType) => {
    const tabId = addTab(type);
    const config = DOCUMENT_CONFIG[type];
    router.push(`${config.listPath}?tab=${tabId}`);
    onClose();
  };

  return (
    <div className="pos-picker-overlay" onClick={onClose}>
      <div className="pos-picker-box" onClick={(e) => e.stopPropagation()}>
        <div className="pos-picker-header">
          <span>New Document Tab</span>
          <button className="pos-picker-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="pos-picker-body">
          {GROUPS.map((group) => (
            <div key={group.label} className="pos-picker-group">
              <div className="pos-picker-group-label">{group.label}</div>
              <div className="pos-picker-grid">
                {group.types.map((type) => {
                  const cfg = DOCUMENT_CONFIG[type];
                  return (
                    <button
                      key={type}
                      className="pos-picker-card"
                      onClick={() => handlePick(type)}
                      style={{ "--card-color": cfg.color } as React.CSSProperties}
                    >
                      <span
                        className="pos-picker-icon"
                        style={{ color: cfg.color }}
                      >
                        <Icon name={cfg.icon as any} size={18} />
                      </span>
                      <span className="pos-picker-name">{cfg.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
