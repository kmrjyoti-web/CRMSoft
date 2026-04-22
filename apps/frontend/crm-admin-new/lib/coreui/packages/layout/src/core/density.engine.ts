import type { DensityConfig, DensityLevel } from "./density.types";

/** Pre-defined density configurations. */
const densityPresets: Record<DensityLevel, DensityConfig> = {
  compact: {
    level: "compact",
    baseFontSize: "13px",
    lineHeight: "1.35",
    componentPadding: "4px 8px",
    componentGap: "4px",
    tableCellPadding: "4px 8px",
    inputHeight: "28px",
    buttonHeight: "28px",
  },
  comfortable: {
    level: "comfortable",
    baseFontSize: "14px",
    lineHeight: "1.5",
    componentPadding: "8px 16px",
    componentGap: "8px",
    tableCellPadding: "8px 12px",
    inputHeight: "36px",
    buttonHeight: "36px",
  },
  spacious: {
    level: "spacious",
    baseFontSize: "16px",
    lineHeight: "1.65",
    componentPadding: "12px 24px",
    componentGap: "12px",
    tableCellPadding: "12px 16px",
    inputHeight: "44px",
    buttonHeight: "44px",
  },
};

/** Resolve a density configuration by level name. */
export function resolveDensity(level: DensityLevel): DensityConfig {
  return densityPresets[level];
}

/** Generate CSS custom properties for a density configuration. */
export function generateDensityCSS(config: DensityConfig): string {
  const lines = [
    `  --density-font-size: ${config.baseFontSize};`,
    `  --density-line-height: ${config.lineHeight};`,
    `  --density-component-padding: ${config.componentPadding};`,
    `  --density-component-gap: ${config.componentGap};`,
    `  --density-table-cell-padding: ${config.tableCellPadding};`,
    `  --density-input-height: ${config.inputHeight};`,
    `  --density-button-height: ${config.buttonHeight};`,
  ];
  return `:root {\n${lines.join("\n")}\n}`;
}
