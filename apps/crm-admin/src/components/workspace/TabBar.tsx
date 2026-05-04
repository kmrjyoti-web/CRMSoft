"use client";

import { useState, useCallback } from "react";
import { Icon } from "@/components/ui";
import { useTabStore } from "@/stores/tab.store";
import { NewTabPicker } from "./NewTabPicker";

// ── Tab Item ───────────────────────────────────────────

function TabItem({
  id,
  title,
  icon,
  color,
  isDirty,
  isActive,
  onSwitch,
  onClose,
}: {
  id: string;
  title: string;
  icon: string;
  color: string;
  isDirty: boolean;
  isActive: boolean;
  onSwitch: () => void;
  onClose: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`pos-tab-item${isActive ? " active" : ""}`}
      onClick={onSwitch}
      title={title}
      style={{ "--tab-color": color } as React.CSSProperties}
    >
      {/* Color dot */}
      <span className="pos-tab-dot" style={{ background: color }} />

      {/* Icon */}
      <span className="pos-tab-icon">
        <Icon name={icon as any} size={13} />
      </span>

      {/* Title */}
      <span className="pos-tab-title">{title}</span>

      {/* Dirty / close button */}
      <button
        className="pos-tab-close"
        onClick={onClose}
        title={isDirty ? "Unsaved changes — click to close" : "Close tab"}
      >
        {isDirty ? (
          <span className="pos-tab-dirty-dot" />
        ) : (
          <Icon name="x" size={11} />
        )}
      </button>
    </div>
  );
}

// ── Confirm Close Dialog ───────────────────────────────

function ConfirmCloseDialog({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="pos-confirm-overlay" onClick={onCancel}>
      <div className="pos-confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="pos-confirm-icon">
          <Icon name="alert-triangle" size={22} />
        </div>
        <h3 className="pos-confirm-title">Unsaved Changes</h3>
        <p className="pos-confirm-msg">
          <strong>{title}</strong> has unsaved changes. Close anyway?
        </p>
        <div className="pos-confirm-actions">
          <button className="pos-btn-secondary" onClick={onCancel}>
            Keep Editing
          </button>
          <button className="pos-btn-danger" onClick={onConfirm}>
            Close Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab Bar ────────────────────────────────────────────

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const switchTab = useTabStore((s) => s.switchTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const closeAllTabs = useTabStore((s) => s.closeAllTabs);

  const [pendingClose, setPendingClose] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleClose = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const tab = tabs.find((t) => t.id === id);
      if (tab?.isDirty) {
        setPendingClose(id);
      } else {
        closeTab(id);
      }
    },
    [tabs, closeTab],
  );

  const confirmClose = useCallback(() => {
    if (pendingClose) {
      closeTab(pendingClose);
      setPendingClose(null);
    }
  }, [pendingClose, closeTab]);

  if (tabs.length === 0) return null;

  const pendingTab = pendingClose ? tabs.find((t) => t.id === pendingClose) : null;

  return (
    <>
      <div className="pos-tab-bar">
        {/* Tabs list */}
        <div className="pos-tabs-scroll">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              id={tab.id}
              title={tab.title}
              icon={tab.icon}
              color={tab.color}
              isDirty={tab.isDirty}
              isActive={tab.id === activeTabId}
              onSwitch={() => switchTab(tab.id)}
              onClose={(e) => handleClose(e, tab.id)}
            />
          ))}
        </div>

        {/* Right toolbar */}
        <div className="pos-tab-toolbar">
          <button
            className="pos-tab-action"
            title="New Document Tab"
            onClick={() => setShowPicker(true)}
          >
            <Icon name="plus" size={14} />
          </button>
          <button
            className="pos-tab-action"
            title="Close All Tabs"
            onClick={closeAllTabs}
          >
            <Icon name="x-square" size={14} />
          </button>
        </div>
      </div>

      {/* New tab picker */}
      {showPicker && <NewTabPicker onClose={() => setShowPicker(false)} />}

      {/* Confirm dirty-close */}
      {pendingTab && (
        <ConfirmCloseDialog
          title={pendingTab.title}
          onConfirm={confirmClose}
          onCancel={() => setPendingClose(null)}
        />
      )}
    </>
  );
}
