// Source: Angular components/shortcuts/shortcuts.component.ts
import React from "react";
import {
  MARG_COMMON_KEYS,
  MARG_NAVIGATION_KEYS,
  MARG_SALE_WINDOW_KEYS,
  MARG_ITEM_LIST_KEYS,
} from "../core/marg.config";
import type { ShortcutItem } from "../core/marg.types";

export interface MargShortcutsProps {
  onClose: () => void;
}

function ShortcutRows({ items }: { items: ShortcutItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="shortcut-row">
          <span className="label">{item.label}</span>
          <span className="keys">{item.keys}</span>
        </div>
      ))}
    </>
  );
}

export const MargShortcuts: React.FC<MargShortcutsProps> = ({ onClose }) => {
  return (
    <div className="marg-shortcut-overlay" onClick={onClose}>
      <div
        className="marg-shortcut-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="title">
            <span>⌨️</span>
            <span>SHORTCUT KEYS</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="shortcut-grid">
            {/* Left Column — Common Keys */}
            <div className="shortcut-column">
              <div className="group-title">COMMON KEYS</div>
              <div className="group-content">
                <ShortcutRows items={MARG_COMMON_KEYS} />
              </div>
            </div>

            {/* Right Column */}
            <div className="shortcut-column">
              <div className="group-section">
                <div className="group-title">NAVIGATION</div>
                <div className="group-content">
                  <ShortcutRows items={MARG_NAVIGATION_KEYS} />
                </div>
              </div>

              <div className="group-section">
                <div className="group-title">SALE WINDOW</div>
                <div className="group-content">
                  <ShortcutRows items={MARG_SALE_WINDOW_KEYS} />
                </div>
              </div>

              <div className="group-section">
                <div className="group-title">
                  ITEM LIST ON BILLING WINDOW
                </div>
                <div className="group-content">
                  <ShortcutRows items={MARG_ITEM_LIST_KEYS} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MargShortcuts.displayName = "MargShortcuts";
