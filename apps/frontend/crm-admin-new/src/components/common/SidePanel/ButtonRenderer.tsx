"use client";

import { Icon } from "@/components/ui";

import type { ActionButton } from "@/stores/side-panel.store";

export function ButtonRenderer({ btn }: { btn: ActionButton }) {
  const isGhost = btn.variant === "ghost";

  const variantClass =
    btn.variant === "primary"
      ? "sp-btn--primary"
      : btn.variant === "danger"
        ? "sp-btn--danger"
        : btn.variant === "ghost"
          ? "sp-btn--ghost"
          : "sp-btn--secondary";

  return (
    <button
      className={`sp-btn ${variantClass}`}
      onClick={btn.onClick}
      title={btn.label}
      disabled={btn.disabled || btn.loading}
    >
      {btn.loading && (
        <span className="crm-spinner" style={{ display: "inline-flex" }}>
          <Icon name="loader" size={isGhost ? 16 : 18} />
        </span>
      )}
      {!btn.loading && (btn.showAs === "icon" || btn.showAs === "both") && btn.icon && (
        <Icon name={btn.icon as any} size={isGhost ? 16 : 18} />
      )}
      {(btn.showAs === "text" || btn.showAs === "both") && <span>{btn.label}</span>}
    </button>
  );
}
