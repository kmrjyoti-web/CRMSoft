"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CanvasRendererService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRendererService = void 0;
const common_1 = require("@nestjs/common");
const formula_service_1 = require("./formula.service");
let CanvasRendererService = CanvasRendererService_1 = class CanvasRendererService {
    constructor(formulaService) {
        this.formulaService = formulaService;
        this.logger = new common_1.Logger(CanvasRendererService_1.name);
    }
    renderCanvasToHtml(design, data) {
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
    renderBand(band, data, formulas) {
        const bandType = band.type ?? 'DETAIL';
        let elementsHtml = '';
        for (const el of band.elements ?? []) {
            elementsHtml += this.renderElement(el, data, formulas);
        }
        return `<div class="band" data-band="${bandType}" style="height:${band.height}px;min-height:${band.height}px;">
${elementsHtml}
</div>\n`;
    }
    renderElement(el, data, formulas) {
        const pos = el.position ?? { x: 0, y: 0, width: 100, height: 20 };
        const props = el.properties ?? {};
        const styles = [
            `left:${pos.x}px`,
            `top:${pos.y}px`,
            `width:${pos.width}px`,
            `height:${pos.height}px`,
        ];
        if (props.fontSize)
            styles.push(`font-size:${props.fontSize}px`);
        if (props.fontWeight)
            styles.push(`font-weight:${props.fontWeight}`);
        if (props.fontStyle)
            styles.push(`font-style:${props.fontStyle}`);
        if (props.color)
            styles.push(`color:${props.color}`);
        if (props.backgroundColor)
            styles.push(`background-color:${props.backgroundColor}`);
        if (props.textAlign)
            styles.push(`text-align:${props.textAlign}`);
        if (props.borderWidth)
            styles.push(`border:${props.borderWidth}px ${props.borderStyle ?? 'solid'} ${props.borderColor ?? '#000'}`);
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
    resolveValue(el, data, formulas) {
        const props = el.properties ?? {};
        if (props.text)
            return props.text;
        if (props.dataField) {
            return this.getNestedValue(data, props.dataField) ?? '';
        }
        if (props.formulaExpression) {
            const result = this.formulaService.evaluate(props.formulaExpression, this.flattenData(data));
            if (props.outputFormat === 'currency') {
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(result ?? 0);
            }
            return String(result ?? '');
        }
        if (props.formulaId) {
            const formula = formulas.find(f => f.id === props.formulaId);
            if (formula) {
                const result = this.formulaService.evaluate(formula.expression, this.flattenData(data));
                return String(result ?? '');
            }
        }
        if (props.imageField) {
            return this.getNestedValue(data, props.imageField) ?? '';
        }
        return '';
    }
    renderTableElement(el, data, styleStr) {
        const props = el.properties ?? {};
        const columns = props.columns ?? [];
        const dataSource = props.dataSource ?? 'items';
        const items = this.getNestedValue(data, dataSource) ?? [];
        if (!columns.length)
            return `<div class="element" style="${styleStr}">[Table: No columns]</div>\n`;
        let tableHtml = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
        tableHtml += '<thead><tr>';
        for (const col of columns) {
            tableHtml += `<th style="border:1px solid #ddd;padding:4px 6px;background:#f5f5f5;text-align:${col.align ?? 'left'};font-weight:600;font-size:10px;text-transform:uppercase">${col.header}</th>`;
        }
        tableHtml += '</tr></thead>';
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
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    flattenData(data, prefix = '') {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            const fullKey = prefix ? `${prefix}_${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                Object.assign(result, this.flattenData(value, fullKey));
            }
            else {
                result[fullKey] = value;
            }
        }
        return result;
    }
};
exports.CanvasRendererService = CanvasRendererService;
exports.CanvasRendererService = CanvasRendererService = CanvasRendererService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [formula_service_1.FormulaService])
], CanvasRendererService);
//# sourceMappingURL=canvas-renderer.service.js.map