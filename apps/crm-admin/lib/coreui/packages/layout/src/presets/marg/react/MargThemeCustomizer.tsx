// Source: Angular components/customizer/theme-customizer.component.ts
import React, { useState } from "react";
import { useMargTheme } from "../hooks/useMargTheme";
import {
  MARG_THEME_PRESETS,
  MARG_AVAILABLE_FONTS,
  MARG_FONT_WEIGHTS,
  MARG_BACKGROUND_IMAGES,
} from "../core/marg.config";
import type { MargTheme } from "../core/marg.types";

export const MargThemeCustomizer: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const theme = useMargTheme((s) => s.theme);
  const updateTheme = useMargTheme((s) => s.updateTheme);
  const increaseFontSize = useMargTheme((s) => s.increaseFontSize);
  const decreaseFontSize = useMargTheme((s) => s.decreaseFontSize);
  const increaseZoom = useMargTheme((s) => s.increaseZoom);
  const decreaseZoom = useMargTheme((s) => s.decreaseZoom);
  const applyPreset = useMargTheme((s) => s.applyPreset);
  const reset = useMargTheme((s) => s.reset);

  const update = (key: keyof MargTheme, value: unknown) => {
    updateTheme({ [key]: value } as Partial<MargTheme>);
  };

  return (
    <>
      <div className="customizer-toggle" onClick={() => setOpen(!isOpen)}>
        ⚙️
      </div>

      <div className={`customizer-panel${isOpen ? " open" : ""}`}>
        <div className="panel-header">
          <h3>Theme Settings</h3>
          <button className="close-btn" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="panel-content">
          {/* Color Presets */}
          <div className="section">
            <h4>Color Presets</h4>
            <div className="presets-grid">
              {MARG_THEME_PRESETS.map((p, i) => (
                <div
                  key={i}
                  className="preset-item"
                  title={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: `linear-gradient(135deg, ${p.sidebarBg} 50%, ${p.headerBg} 50%)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="section">
            <h4>Colors</h4>
            <div className="control-group">
              <label>Header Background</label>
              <input
                type="color"
                value={theme.headerBg}
                onChange={(e) => update("headerBg", e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Sidebar Background</label>
              <input
                type="color"
                value={theme.sidebarBg}
                onChange={(e) => update("sidebarBg", e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Sidebar Text</label>
              <input
                type="color"
                value={theme.sidebarText}
                onChange={(e) => update("sidebarText", e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Accent Color</label>
              <input
                type="color"
                value={theme.accent}
                onChange={(e) => update("accent", e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Icon Color</label>
              <input
                type="color"
                value={theme.iconColor}
                onChange={(e) => update("iconColor", e.target.value)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="section">
            <h4>Appearance</h4>
            <div className="control-group">
              <label>Font Family</label>
              <select
                value={theme.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value)}
                style={{ width: 140, padding: 4 }}
              >
                {MARG_AVAILABLE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Font Weight</label>
              <select
                value={theme.fontWeight}
                onChange={(e) => update("fontWeight", e.target.value)}
                style={{ width: 140, padding: 4 }}
              >
                {MARG_FONT_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Font Size ({theme.fontSize}px)</label>
              <div className="size-controls">
                <button className="icon-btn" onClick={decreaseFontSize}>
                  -
                </button>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={theme.fontSize}
                  onChange={(e) => update("fontSize", Number(e.target.value))}
                />
                <button className="icon-btn" onClick={increaseFontSize}>
                  +
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Zoom ({theme.zoom}%)</label>
              <div className="size-controls">
                <button className="icon-btn" onClick={decreaseZoom}>
                  -
                </button>
                <input
                  type="range"
                  min={70}
                  max={150}
                  step={5}
                  value={theme.zoom}
                  onChange={(e) => update("zoom", Number(e.target.value))}
                />
                <button className="icon-btn" onClick={increaseZoom}>
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <h4 style={{ margin: 0 }}>Background</h4>
              <label style={{ fontSize: 11, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={theme.bgFullPage}
                  onChange={(e) => update("bgFullPage", e.target.checked)}
                />{" "}
                Full Page
              </label>
            </div>

            <div className="bg-selector">
              {MARG_BACKGROUND_IMAGES.map((bg, i) => (
                <div
                  key={i}
                  className={`bg-option${theme.bgImage === bg.value ? " active" : ""}`}
                  onClick={() => update("bgImage", bg.value)}
                  title={bg.label}
                  style={{ backgroundImage: bg.value || "none" }}
                >
                  {!bg.value && <span>None</span>}
                </div>
              ))}
            </div>

            {theme.bgImage && (
              <div className="control-group" style={{ marginTop: 15 }}>
                <label>
                  Opacity ({Math.round(theme.bgOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={theme.bgOpacity}
                  onChange={(e) => update("bgOpacity", Number(e.target.value))}
                  style={{ width: 140 }}
                />
              </div>
            )}
          </div>

          {/* Menu Orientation */}
          <div className="section">
            <h4>Menu Orientation</h4>
            <div className="mode-selector">
              <button
                className={theme.menuPosition === "vertical" ? "active" : ""}
                onClick={() => update("menuPosition", "vertical")}
              >
                Vertical
              </button>
              <button
                className={theme.menuPosition === "horizontal" ? "active" : ""}
                onClick={() => update("menuPosition", "horizontal")}
              >
                Horizontal
              </button>
            </div>
          </div>

          <div className="actions">
            <button className="reset-btn" onClick={reset}>
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

MargThemeCustomizer.displayName = "MargThemeCustomizer";
