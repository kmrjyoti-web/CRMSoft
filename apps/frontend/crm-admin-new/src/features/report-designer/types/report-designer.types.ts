// ── Canvas Design Types ──

export type BandType = 'REPORT_TITLE' | 'PAGE_HEADER' | 'GROUP_HEADER' | 'DETAIL' | 'GROUP_FOOTER' | 'REPORT_SUMMARY' | 'PAGE_FOOTER';

export type ControlType = 'text' | 'label' | 'image' | 'table' | 'line' | 'rectangle' | 'qrcode' | 'barcode' | 'formula' | 'date' | 'serial-no' | 'page-no' | 'spacer' | 'shape' | 'signature';

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableColumn {
  field: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface ElementProperties {
  // Text
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Data binding
  dataField?: string;

  // Image
  src?: string;
  imageField?: string;

  // Border
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number;

  // Line
  lineWidth?: number;
  lineColor?: string;
  lineStyle?: string;

  // Formula
  formulaExpression?: string;
  formulaId?: string;
  outputFormat?: 'currency' | 'percentage' | 'text';

  // Table
  dataSource?: string;
  columns?: TableColumn[];

  // Date
  format?: string;

  // QR / Barcode
  barcodeType?: string;
  qrSize?: number;
}

export interface CanvasElement {
  id: string;
  type: ControlType;
  position: ElementPosition;
  properties: ElementProperties;
  locked?: boolean;
  visible?: boolean;
}

export interface CanvasBand {
  type: BandType;
  height: number;
  elements: CanvasElement[];
  collapsed?: boolean;
}

export interface CanvasFormula {
  id: string;
  name: string;
  expression: string;
}

export interface CanvasDesign {
  version: 2;
  paper: PaperSettings;
  bands: CanvasBand[];
  formulas: CanvasFormula[];
}

export interface PaperSettings {
  size: 'A4' | 'LETTER' | 'LEGAL';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
}

// ── Saved Formula Types ──

export interface SavedFormula {
  id: string;
  tenantId?: string;
  name: string;
  category: string;
  expression: string;
  description?: string;
  requiredFields: string[];
  outputType: string;
  outputFormat?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormulaPayload {
  name: string;
  category: string;
  expression: string;
  description?: string;
  requiredFields?: string[];
  outputType?: string;
  outputFormat?: string;
}

export interface EvaluateFormulaPayload {
  expression: string;
  variables?: Record<string, unknown>;
}

// ── AI Types ──

export interface AiDesignPayload {
  description: string;
  documentType: string;
}

export interface AiFormulaPayload {
  description: string;
}

export interface AiFromImagePayload {
  imageDescription: string;
  documentType: string;
}

export interface AiRefinePayload {
  currentDesign: Record<string, unknown>;
  instruction: string;
}

export interface AiFormulaResult {
  expression: string;
  name: string;
  category: string;
  description: string;
  requiredFields: string[];
}

// ── Toolbox ──

export interface ToolboxItem {
  type: ControlType;
  label: string;
  icon: string;
  group: 'basic' | 'data' | 'layout' | 'advanced';
  defaultWidth: number;
  defaultHeight: number;
  defaultProperties: Partial<ElementProperties>;
}

export interface DataFieldItem {
  path: string;
  label: string;
  group: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'image';
}

// ── History (Undo/Redo) ──

export interface HistoryEntry {
  design: CanvasDesign;
  description: string;
  timestamp: number;
}
