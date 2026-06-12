"use client";

import { useRef, useCallback } from "react";
import { Icon } from "@/components/ui";

// ── Types ──────────────────────────────────────────────

export interface LineItem {
  id: string;
  itemName: string;
  hsnCode?: string;
  qty: number;
  unit?: string;
  rate: number;
  discPct?: number;
  taxPct?: number;
  amount: number;
}

interface POSItemTableProps {
  columns: string[];
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

// ── Helpers ───────────────────────────────────────────

function calcAmount(item: LineItem): number {
  const base = item.qty * item.rate;
  const afterDisc = base - (base * (item.discPct ?? 0)) / 100;
  const withTax = afterDisc + (afterDisc * (item.taxPct ?? 0)) / 100;
  return Math.round(withTax * 100) / 100;
}

function newBlankLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    itemName: "",
    qty: 1,
    rate: 0,
    discPct: 0,
    taxPct: 0,
    amount: 0,
  };
}

// ── Cell ──────────────────────────────────────────────

function EditCell({
  value,
  type = "text",
  align = "left",
  tabIndex,
  onFocus,
  onChange,
  onTab,
  onShiftTab,
  onEnter,
}: {
  value: string | number;
  type?: "text" | "number";
  align?: "left" | "right";
  tabIndex?: number;
  onFocus?: () => void;
  onChange: (v: string) => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onEnter?: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      onTab?.();
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      onShiftTab?.();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <input
      type={type}
      tabIndex={tabIndex}
      value={value}
      onFocus={(e) => {
        onFocus?.();
        e.target.select();
      }}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontSize: 13,
        textAlign: align,
        padding: "0 4px",
        color: "#0f172a",
      }}
    />
  );
}

// ── Main Table ────────────────────────────────────────

export function POSItemTable({ columns, items, onChange }: POSItemTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  const showHSN = columns.includes("HSN");
  const showUnit = columns.includes("Unit");
  const showDisc = columns.includes("Disc%");
  const showTax = columns.includes("Tax%");
  const showBatch = columns.includes("Batch");
  const showSerial = columns.includes("Serial");
  const showLocation = columns.includes("Location");
  const showDebit = columns.includes("Debit");
  const showCredit = columns.includes("Credit");
  const showNarration = columns.includes("Narration");
  const showReason = columns.includes("Reason");

  const updateItem = useCallback(
    (index: number, field: keyof LineItem, rawVal: string) => {
      const updated = items.map((item, i) => {
        if (i !== index) return item;
        const numFields: (keyof LineItem)[] = ["qty", "rate", "discPct", "taxPct", "amount"];
        const next = {
          ...item,
          [field]: numFields.includes(field) ? parseFloat(rawVal) || 0 : rawVal,
        };
        next.amount = calcAmount(next);
        return next;
      });
      onChange(updated);
    },
    [items, onChange],
  );

  const addRow = useCallback(() => {
    onChange([...items, newBlankLine()]);
  }, [items, onChange]);

  const removeRow = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  const focusCell = useCallback((row: number, col: number) => {
    if (!tableRef.current) return;
    const cells = tableRef.current.querySelectorAll<HTMLInputElement>(
      `tr[data-row="${row}"] input`,
    );
    cells[col]?.focus();
  }, []);

  return (
    <div className="pos-item-table-wrapper">
      <table ref={tableRef} className="pos-item-table">
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th>Item</th>
            {showHSN && <th style={{ width: 80 }}>HSN</th>}
            <th style={{ width: 70 }}>Qty</th>
            {showUnit && <th style={{ width: 70 }}>Unit</th>}
            <th style={{ width: 90 }}>Rate</th>
            {showDisc && <th style={{ width: 70 }}>Disc%</th>}
            {showTax && <th style={{ width: 70 }}>Tax%</th>}
            {showBatch && <th style={{ width: 90 }}>Batch</th>}
            {showSerial && <th style={{ width: 90 }}>Serial</th>}
            {showLocation && <th style={{ width: 90 }}>Location</th>}
            {showDebit && <th style={{ width: 90, textAlign: "right" }}>Debit</th>}
            {showCredit && <th style={{ width: 90, textAlign: "right" }}>Credit</th>}
            {showNarration && <th>Narration</th>}
            {showReason && <th style={{ width: 100 }}>Reason</th>}
            <th style={{ width: 90, textAlign: "right" }}>Amount</th>
            <th style={{ width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIdx) => {
            let colIdx = 0;
            const nextCell = () => {
              const c = colIdx;
              colIdx++;
              return c;
            };

            return (
              <tr key={item.id} data-row={rowIdx}>
                <td style={{ textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                  {rowIdx + 1}
                </td>
                <td>
                  <EditCell
                    value={item.itemName}
                    tabIndex={rowIdx * 100 + nextCell()}
                    onChange={(v) => updateItem(rowIdx, "itemName", v)}
                    onTab={() => focusCell(rowIdx, colIdx)}
                    onEnter={addRow}
                  />
                </td>
                {showHSN && (
                  <td>
                    <EditCell
                      value={item.hsnCode ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "hsnCode", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                <td>
                  <EditCell
                    value={item.qty}
                    type="number"
                    align="right"
                    tabIndex={rowIdx * 100 + nextCell()}
                    onChange={(v) => updateItem(rowIdx, "qty", v)}
                    onTab={() => focusCell(rowIdx, colIdx)}
                    onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                  />
                </td>
                {showUnit && (
                  <td>
                    <EditCell
                      value={item.unit ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "unit", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                <td>
                  <EditCell
                    value={item.rate}
                    type="number"
                    align="right"
                    tabIndex={rowIdx * 100 + nextCell()}
                    onChange={(v) => updateItem(rowIdx, "rate", v)}
                    onTab={() => focusCell(rowIdx, colIdx)}
                    onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                  />
                </td>
                {showDisc && (
                  <td>
                    <EditCell
                      value={item.discPct ?? 0}
                      type="number"
                      align="right"
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "discPct", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showTax && (
                  <td>
                    <EditCell
                      value={item.taxPct ?? 0}
                      type="number"
                      align="right"
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "taxPct", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showBatch && (
                  <td>
                    <EditCell
                      value={(item as any).batch ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "hsnCode" as any, v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showSerial && (
                  <td>
                    <EditCell
                      value={(item as any).serial ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "unit" as any, v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showLocation && (
                  <td>
                    <EditCell
                      value={(item as any).location ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "unit" as any, v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showDebit && (
                  <td>
                    <EditCell
                      value={item.rate}
                      type="number"
                      align="right"
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "rate", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showCredit && (
                  <td>
                    <EditCell
                      value={item.discPct ?? 0}
                      type="number"
                      align="right"
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "discPct", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showNarration && (
                  <td>
                    <EditCell
                      value={item.hsnCode ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "hsnCode", v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                {showReason && (
                  <td>
                    <EditCell
                      value={(item as any).reason ?? ""}
                      tabIndex={rowIdx * 100 + nextCell()}
                      onChange={(v) => updateItem(rowIdx, "unit" as any, v)}
                      onTab={() => focusCell(rowIdx, colIdx)}
                      onShiftTab={() => focusCell(rowIdx, colIdx - 2)}
                    />
                  </td>
                )}
                <td style={{ textAlign: "right", fontWeight: 500, fontSize: 13, color: "#0f172a", paddingRight: 8 }}>
                  ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <button
                    onClick={() => removeRow(rowIdx)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "2px 4px",
                      borderRadius: 4,
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon name="trash-2" size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add row */}
      <button className="pos-add-row-btn" onClick={addRow}>
        <Icon name="plus" size={13} />
        Add Item
      </button>
    </div>
  );
}
