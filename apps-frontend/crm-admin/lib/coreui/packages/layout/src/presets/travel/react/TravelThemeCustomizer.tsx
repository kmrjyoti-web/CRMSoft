// Travel Layout — Theme customizer drawer
import React, { useState } from "react";
import { useTravelTheme } from "../hooks/useTravelTheme";
import {
  TRAVEL_THEME_PRESETS,
  TRAVEL_AVAILABLE_FONTS,
  TRAVEL_FONT_WEIGHTS,
} from "../core/travel.config";
import type { TravelTheme } from "../core/travel.types";

export const TravelThemeCustomizer: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const theme = useTravelTheme((s) => s.theme);
  const updateTheme = useTravelTheme((s) => s.updateTheme);
  const increaseFontSize = useTravelTheme((s) => s.increaseFontSize);
  const decreaseFontSize = useTravelTheme((s) => s.decreaseFontSize);
  const increaseZoom = useTravelTheme((s) => s.increaseZoom);
  const decreaseZoom = useTravelTheme((s) => s.decreaseZoom);
  const applyPreset = useTravelTheme((s) => s.applyPreset);
  const reset = useTravelTheme((s) => s.reset);

  const update = (key: keyof TravelTheme, value: unknown) => {
    updateTheme({ [key]: value } as Partial<TravelTheme>);
  };

  return (
    <>
      <div className="travel-customizer-toggle" onClick={() => setOpen(!isOpen)}>
        ⚙
      </div>

      <div className={`travel-customizer-panel${isOpen ? " open" : ""}`}>
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
              {TRAVEL_THEME_PRESETS.map((p, i) => (
                <div
                  key={i}
                  className="preset-item"
                  title={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: `linear-gradient(135deg, ${p.meshColor1} 33%, ${p.meshColor2} 66%, ${p.meshColor3} 100%)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="section">
            <h4>Colors</h4>
            <div className="control-group">
              <label>Accent Color</label>
              <input
                type="color"
                value={theme.accent}
                onChange={(e) => update("accent", e.target.value)}
              />
            </div>
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
          </div>

          {/* Appearance */}
          <div className="section">
            <h4>Appearance</h4>
            <div className="control-group">
              <label>Font Family</label>
              <select
                value={theme.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value)}
                style={{ width: 160, padding: 4 }}
              >
                {TRAVEL_AVAILABLE_FONTS.map((f) => (
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
                style={{ width: 160, padding: 4 }}
              >
                {TRAVEL_FONT_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Font Size ({theme.fontSize}px)</label>
              <div className="size-controls">
                <button className="icon-btn" onClick={decreaseFontSize}>-</button>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={theme.fontSize}
                  onChange={(e) => update("fontSize", Number(e.target.value))}
                />
                <button className="icon-btn" onClick={increaseFontSize}>+</button>
              </div>
            </div>

            <div className="control-group">
              <label>Zoom ({theme.zoom}%)</label>
              <div className="size-controls">
                <button className="icon-btn" onClick={decreaseZoom}>-</button>
                <input
                  type="range"
                  min={70}
                  max={150}
                  step={5}
                  value={theme.zoom}
                  onChange={(e) => update("zoom", Number(e.target.value))}
                />
                <button className="icon-btn" onClick={increaseZoom}>+</button>
              </div>
            </div>
          </div>

          {/* Glassmorphism */}
          <div className="section">
            <h4>Glassmorphism</h4>
            <div className="control-group">
              <label>Glass Opacity ({Math.round(theme.glassOpacity * 100)}%)</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={theme.glassOpacity}
                onChange={(e) => update("glassOpacity", Number(e.target.value))}
                style={{ width: 160 }}
              />
            </div>
          </div>

          {/* Mesh Gradient */}
          <div className="section">
            <h4>Mesh Gradient</h4>
            <div className="toggle-row">
              <label>Enable Gradient</label>
              <input
                type="checkbox"
                checked={theme.meshEnabled}
                onChange={(e) => update("meshEnabled", e.target.checked)}
              />
            </div>
            {theme.meshEnabled && (
              <div className="control-group" style={{ marginTop: 8 }}>
                <label>Animation Speed ({theme.meshSpeed}s)</label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={theme.meshSpeed}
                  onChange={(e) => update("meshSpeed", Number(e.target.value))}
                  style={{ width: 160 }}
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

          {/* Theme Mode */}
          <div className="section">
            <h4>Theme Mode</h4>
            <div className="mode-selector">
              <button
                className={theme.themeMode === "light" ? "active" : ""}
                onClick={() => update("themeMode", "light")}
              >
                Light
              </button>
              <button
                className={theme.themeMode === "dark" ? "active" : ""}
                onClick={() => update("themeMode", "dark")}
              >
                Dark
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

TravelThemeCustomizer.displayName = "TravelThemeCustomizer";
