/** Density level names. */
export type DensityLevel = "compact" | "comfortable" | "spacious";

/** Configuration for a single density level. */
export interface DensityConfig {
  level: DensityLevel;
  baseFontSize: string;
  lineHeight: string;
  componentPadding: string;
  componentGap: string;
  tableCellPadding: string;
  inputHeight: string;
  buttonHeight: string;
}
