"use client";

import { useState } from "react";

import { Icon } from "@/components/ui";

import { useSidePanelStore } from "@/stores/side-panel.store";

export function SidePanelTaskbar() {
  const panels = useSidePanelStore((s) => s.panels);
  const setPanelState = useSidePanelStore((s) => s.setPanelState);
  const closePanel = useSidePanelStore((s) => s.closePanel);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const minimizedPanels = Object.values(panels).filter((p) => p.state === "minimized");

  if (minimizedPanels.length === 0) return null;

  return (
    <div className="sp-taskbar">
      {minimizedPanels.map((panel) => (
        <div key={panel.config.id} className="sp-taskbar__wrapper">
          {/* Windows-style Preview Popup */}
          {previewId === panel.config.id && (
            <div
              className="sp-taskbar__preview"
              onClick={() => {
                setPanelState(panel.config.id, "normal");
                setPreviewId(null);
              }}
            >
              <div className="sp-taskbar__preview-header">
                <span className="sp-taskbar__preview-title">{panel.config.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closePanel(panel.config.id);
                  }}
                  className="sp-taskbar__preview-close"
                  title="Close"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
              <div className="sp-taskbar__preview-body">
                <div className="sp-taskbar__preview-content">
                  {panel.config.content}
                </div>
              </div>
            </div>
          )}

          {/* Minimized Tab */}
          <div
            className={`sp-taskbar__tab${previewId === panel.config.id ? " sp-taskbar__tab--active" : ""}`}
          >
            <div
              className="sp-taskbar__tab-main"
              onClick={() => setPreviewId(previewId === panel.config.id ? null : panel.config.id)}
            >
              <span className="sp-taskbar__tab-label">{panel.config.title}</span>
              <div
                className="sp-taskbar__tab-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setPanelState(panel.config.id, "normal");
                    setPreviewId(null);
                  }}
                  className="sp-taskbar__tab-btn"
                  title="Restore"
                >
                  <Icon name="maximize" size={14} />
                </button>
                <button
                  onClick={() => closePanel(panel.config.id)}
                  className="sp-taskbar__tab-btn sp-taskbar__tab-btn--close"
                  title="Close"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
