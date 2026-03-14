import { Injectable, Logger } from '@nestjs/common';
import { FormulaService } from './formula.service';

interface CanvasElement {
  id: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  properties: Record<string, any>;
}

interface CanvasBand {
  type: string;
  height: number;
  elements: CanvasElement[];
}

interface CanvasDesign {
  version: number;
  paper: { size: string; orientation: string; margins: { top: number; right: number; bottom: number; left: number } };
  bands: CanvasBand[];
  formulas?: { id: string; name: string; expression: string }[];
}

@Injectable()
export class CanvasRendererService {
  private readonly logger = new Logger(CanvasRendererService.name);

  constructor(private readonly formulaService: FormulaService) {}

  /**
   * Convert a v2 canvas JSON design to full HTML for PDF generation.
   */
  renderCanvasToHtml(design: CanvasDesign, data: Record<string, any>): string {
    const paper = design.paper ?? { size: 'A4', orientation: 'portrait', margins: { top: 20, right: 15, bottom: 20, left: 15 } };

    const pageWidth = paper.orientation === 'landscape' ? 297 : 210;

    let bandsHtml = '';
    for (const band of design.bands ?? []) {
      bandsHtml += this.renderBand(band, data, design.formulas ?? []);
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
  .page { width: ${pageWidth}mm; padding: ${paper.margins.top}mm ${paper.margins.right}mm ${paper.margins.bottom}mm ${paper.margins.left}mm; }
  .band { position: relative; width: 100%; overflow: hidden; }
  .element { position: absolute; overflow: hidden; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
${bandsHtml}
</div>
</body>
</html>`;
  }

  private renderBand(band: CanvasBand, data: Record<string, any>, formulas: { id: string; name: string; expression: string }[]): string {
    const bandType = band.type ?? 'DETAIL';
    let elementsHtml = '';

    for (const el of band.elements ?? []) {
      elementsHtml += this.renderElement(el, data, formulas);
    }

    return `<div class="band" data-band="${bandType}" style="height:${band.height}px;min-height:${band.height}px;">
${elementsHtml}
</div>\n`;
  }

  private renderElement(el: CanvasElement, data: Record<string, any>, formulas: { id: string; name: string; expression: string }[]): string {
    const pos = el.position ?? { x: 0, y: 0, width: 100, height: 20 };
    const props = el.properties ?? {};

    // Common styles
    const styles: string[] = [
      `left:${pos.x}px`,
      `top:${pos.y}px`,
      `width:${pos.width}px`,
      `height:${pos.height}px`,
    ];

    if (props.fontSize) styles.push(`font-size:${props.fontSize}px`);
    if (props.fontWeight) styles.push(`font-weight:${props.fontWeight}`);
    if (props.fontStyle) styles.push(`font-style:${props.fontStyle}`);
    if (props.color) styles.push(`color:${props.color}`);
    if (props.backgroundColor) styles.push(`background-color:${props.backgroundColor}`);
    if (props.textAlign) styles.push(`text-align:${props.textAlign}`);
    if (props.borderWidth) styles.push(`border:${props.borderWidth}px ${props.borderStyle ?? 'solid'} ${props.borderColor ?? '#000'}`);

    const styleStr = styles.join(';');
    const resolvedValue = this.resolveValue(el, data, formulas);

    switch (el.type) {
      case 'text':
      case 'label':
        return `<div class="element" style="${styleStr}">${resolvedValue}</div>\n`;

      case 'image':
        const src = resolvedValue || props.src || '';
        return `<div class="element" style="${styleStr}"><img src="${src}" style="width:100%;height:100%;object-fit:contain;" /></div>\n`;

      case 'line':
        return `<div class="element" style="${styleStr};border-bottom:${props.lineWidth ?? 1}px ${props.lineStyle ?? 'solid'} ${props.lineColor ?? '#000'}"></div>\n`;

      case 'rectangle':
      case 'shape':
        return `<div class="element" style="${styleStr};border-radius:${props.borderRadius ?? 0}px"></div>\n`;

      case 'table':
        return this.renderTableElement(el, data, styleStr);

      case 'formula':
        return `<div class="element" style="${styleStr}">${resolvedValue}</div>\n`;

      case 'qrcode':
        return `<div class="element" style="${styleStr}">[QR: ${resolvedValue}]</div>\n`;

      case 'barcode':
        return `<div class="element" style="${styleStr}">[Barcode: ${resolvedValue}]</div>\n`;

      case 'date':
        const dateVal = props.format === 'DD/MM/YYYY'
          ? new Date().toLocaleDateString('en-IN')
          : new Date().toLocaleDateString();
        return `<div class="element" style="${styleStr}">${dateVal}</div>\n`;

      case 'serial-no':
        return `<div class="element" style="${styleStr}">#</div>\n`;

      case 'page-no':
        return `<div class="element" style="${styleStr}">Page 1</div>\n`;

      case 'spacer':
        return `<div class="element" style="${styleStr}"></div>\n`;

      case 'signature':
        const sigSrc = resolvedValue || '';
        return sigSrc
          ? `<div class="element" style="${styleStr}"><img src="${sigSrc}" style="max-width:100%;max-height:100%;" /></div>\n`
          : `<div class="element" style="${styleStr};border-bottom:1px solid #333;margin-top:auto"><span style="font-size:9px;color:#888">Authorized Signatory</span></div>\n`;

      default:
        return `<div class="element" style="${styleStr}">${resolvedValue}</div>\n`;
    }
  }

  private resolveValue(el: CanvasElement, data: Record<string, any>, formulas: { id: string; name: string; expression: string }[]): string {
    const props = el.properties ?? {};

    // Static text
    if (props.text) return props.text;

    // Data binding
    if (props.dataField) {
      return this.getNestedValue(data, props.dataField) ?? '';
    }

    // Formula evaluation
    if (props.formulaExpression) {
      const result = this.formulaService.evaluate(props.formulaExpression, this.flattenData(data));
      if (props.outputFormat === 'currency') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(result ?? 0);
      }
      return String(result ?? '');
    }

    // Formula reference by id
    if (props.formulaId) {
      const formula = formulas.find(f => f.id === props.formulaId);
      if (formula) {
        const result = this.formulaService.evaluate(formula.expression, this.flattenData(data));
        return String(result ?? '');
      }
    }

    // Image field binding
    if (props.imageField) {
      return this.getNestedValue(data, props.imageField) ?? '';
    }

    return '';
  }

  private renderTableElement(el: CanvasElement, data: Record<string, any>, styleStr: string): string {
    const props = el.properties ?? {};
    const columns: { field: string; header: string; width?: number; align?: string }[] = props.columns ?? [];
    const dataSource = props.dataSource ?? 'items';
    const items: any[] = this.getNestedValue(data, dataSource) ?? [];

    if (!columns.length) return `<div class="element" style="${styleStr}">[Table: No columns]</div>\n`;

    let tableHtml = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    // Header
    tableHtml += '<thead><tr>';
    for (const col of columns) {
      tableHtml += `<th style="border:1px solid #ddd;padding:4px 6px;background:#f5f5f5;text-align:${col.align ?? 'left'};font-weight:600;font-size:10px;text-transform:uppercase">${col.header}</th>`;
    }
    tableHtml += '</tr></thead>';

    // Body
    tableHtml += '<tbody>';
    items.forEach((item, idx) => {
      tableHtml += '<tr>';
      for (const col of columns) {
        const val = col.field === '#' ? idx + 1 : (item[col.field] ?? '');
        tableHtml += `<td style="border:1px solid #eee;padding:4px 6px;text-align:${col.align ?? 'left'}">${val}</td>`;
      }
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    return `<div class="element" style="${styleStr}">${tableHtml}</div>\n`;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private flattenData(data: Record<string, any>, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const fullKey = prefix ? `${prefix}_${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, this.flattenData(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }
}
