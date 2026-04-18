"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRendererCsvService = void 0;
const common_1 = require("@nestjs/common");
let ReportRendererCsvService = class ReportRendererCsvService {
    async render(data, _options) {
        const table = data.tables[0];
        if (!table || !table.columns.length) {
            return Buffer.from('No data available', 'utf-8');
        }
        const lines = [];
        lines.push(table.columns.map(col => this.escape(col.header)).join(','));
        for (const row of table.rows) {
            const values = table.columns.map(col => {
                const raw = row[col.key];
                const formatted = this.formatValue(raw, col.format);
                return this.escape(formatted);
            });
            lines.push(values.join(','));
        }
        const bom = '\uFEFF';
        return Buffer.from(bom + lines.join('\n'), 'utf-8');
    }
    escape(val) {
        if (val === null || val === undefined)
            return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
    formatValue(val, format) {
        if (val === null || val === undefined)
            return '';
        switch (format) {
            case 'currency':
                return typeof val === 'number'
                    ? `\u20B9${val.toLocaleString('en-IN')}` : String(val);
            case 'date':
                return val ? new Date(val).toLocaleDateString('en-IN') : '';
            case 'percent':
                return typeof val === 'number' ? `${val.toFixed(1)}%` : String(val);
            case 'number':
                return typeof val === 'number' ? val.toLocaleString('en-IN') : String(val);
            default:
                return String(val);
        }
    }
};
exports.ReportRendererCsvService = ReportRendererCsvService;
exports.ReportRendererCsvService = ReportRendererCsvService = __decorate([
    (0, common_1.Injectable)()
], ReportRendererCsvService);
//# sourceMappingURL=report-renderer-csv.service.js.map