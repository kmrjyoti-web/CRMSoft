"use client";

import type { ActionButton } from "@/stores/side-panel.store";

import { ButtonRenderer } from "./ButtonRenderer";

interface SidePanelFooterProps {
  buttons?: ActionButton[];
  onClose: () => void;
}

export function SidePanelFooter({ buttons, onClose }: SidePanelFooterProps) {
  // Default Cancel + Save when no custom buttons provided
  if (!buttons || buttons.length === 0) {
    return (
      <div className="sp-footer">
        <button className="sp-btn sp-btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="sp-btn sp-btn--primary">
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="sp-footer">
      {buttons.map((btn) => (
        <ButtonRenderer key={btn.id} btn={btn} />
      ))}
    </div>
  );
}
