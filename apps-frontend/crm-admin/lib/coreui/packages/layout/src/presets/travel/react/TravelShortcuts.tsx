// Travel Layout — Shortcuts modal component
import React from "react";
import {
  TRAVEL_COMMON_KEYS,
  TRAVEL_NAVIGATION_KEYS,
  TRAVEL_BOOKING_KEYS,
  TRAVEL_INVOICE_KEYS,
} from "../core/travel.config";
import type { ShortcutItem } from "../core/travel.types";

export interface TravelShortcutsProps {
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

export const TravelShortcuts: React.FC<TravelShortcutsProps> = ({ onClose }) => {
  return (
    <div className="travel-shortcut-overlay" onClick={onClose}>
      <div
        className="travel-shortcut-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="title">
            <span>⌨</span>
            <span>KEYBOARD SHORTCUTS</span>
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
                <ShortcutRows items={TRAVEL_COMMON_KEYS} />
              </div>
            </div>

            {/* Right Column */}
            <div className="shortcut-column">
              <div className="group-section">
                <div className="group-title">NAVIGATION</div>
                <div className="group-content">
                  <ShortcutRows items={TRAVEL_NAVIGATION_KEYS} />
                </div>
              </div>

              <div className="group-section">
                <div className="group-title">BOOKINGS</div>
                <div className="group-content">
                  <ShortcutRows items={TRAVEL_BOOKING_KEYS} />
                </div>
              </div>

              <div className="group-section">
                <div className="group-title">INVOICING</div>
                <div className="group-content">
                  <ShortcutRows items={TRAVEL_INVOICE_KEYS} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TravelShortcuts.displayName = "TravelShortcuts";
