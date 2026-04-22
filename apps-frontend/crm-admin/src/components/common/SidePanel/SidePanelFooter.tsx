"use client";

import type { ReactNode } from "react";
import type { ActionButton } from "@/stores/side-panel.store";

import { ButtonRenderer } from "./ButtonRenderer";

interface SidePanelFooterProps {
  buttons?: ActionButton[];
  footerLeft?: ReactNode;
  onClose: () => void;
}

export function SidePanelFooter({ buttons, footerLeft, onClose }: SidePanelFooterProps) {
  const rightButtons =
    !buttons || buttons.length === 0 ? (
      <>
        <button className="sp-btn sp-btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="sp-btn sp-btn--primary">Save</button>
      </>
    ) : (
      buttons.map((btn) => <ButtonRenderer key={btn.id} btn={btn} />)
    );

  return (
    <div className="sp-footer" style={{ justifyContent: footerLeft ? "space-between" : "flex-end" }}>
      {footerLeft && <div className="flex items-center gap-2">{footerLeft}</div>}
      <div className="flex items-center gap-2">{rightButtons}</div>
    </div>
  );
}
