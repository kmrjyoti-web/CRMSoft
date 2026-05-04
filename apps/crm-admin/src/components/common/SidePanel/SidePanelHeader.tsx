"use client";

import { Icon } from "@/components/ui";

import type { PanelConfig, PanelState } from "@/stores/side-panel.store";

import { ButtonRenderer } from "./ButtonRenderer";

interface SidePanelHeaderProps {
  config: PanelConfig;
  state: PanelState;
  onMinimize: () => void;
  onMaximize: () => void;
  onFullScreen: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export function SidePanelHeader({
  config,
  state,
  onMinimize,
  onMaximize,
  onFullScreen,
  onRestore,
  onClose,
}: SidePanelHeaderProps) {
  const { title, newTabUrl, headerButtons } = config;
  const isMaximized = state === "maximized";
  const isFullscreen = state === "fullscreen";

  return (
    <div className="sp-header">
      {/* Left: Title + Custom header buttons */}
      <div className="sp-header__left">
        <h2 className="sp-header__title">{title}</h2>
        {headerButtons && headerButtons.length > 0 && (
          <div className="sp-header__custom-actions">
            {headerButtons.map((btn) => (
              <ButtonRenderer key={btn.id} btn={btn} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Built-in action buttons */}
      <div className="sp-header__actions">
        <button
          className="sp-header__btn"
          onClick={onMinimize}
          title="Minimize"
        >
          <Icon name="minus" size={16} />
        </button>
        <button
          className="sp-header__btn"
          onClick={isMaximized ? onRestore : onMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          <Icon name="maximize" size={16} />
        </button>
        <button
          className="sp-header__btn"
          onClick={isFullscreen ? onRestore : onFullScreen}
          title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        >
          <Icon name="expand" size={16} />
        </button>
        {newTabUrl && (
          <button
            className="sp-header__btn"
            onClick={() => window.open(newTabUrl, "_blank")}
            title="Open in new tab"
          >
            <Icon name="external-link" size={16} />
          </button>
        )}
        <button
          className="sp-header__btn sp-header__btn--close"
          onClick={onClose}
          title="Close"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
