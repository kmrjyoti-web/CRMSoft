"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRendererPdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const PAGE_MARGIN = 40;
const COL_BLUE = '#3B82F6';
const COL_GRAY = '#F3F4F6';
const COL_DARK = '#1F2937';
const COL_MUTED = '#6B7280';
let ReportRendererPdfService = class ReportRendererPdfService {
    async render(data, options) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: PAGE_MARGIN, size: 'A4', bufferPages: true,
                layout: options?.orientation === 'landscape' ? 'landscape' : 'portrait',
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.renderTitle(doc, data, options);
            this.renderSummary(doc, data.summary);
            this.renderTables(doc, data);
            this.addPageNumbers(doc);
            doc.end();
        });
    }
    renderTitle(doc, data, options) {
        const title = options?.title || data.reportName;
        const pageWidth = doc.page.width - PAGE_MARGIN * 2;
        doc.fontSize(20).font('Helvetica-Bold').fillColor(COL_DARK)
            .text(title, PAGE_MARGIN, PAGE_MARGIN, { width: pageWidth, align: 'center' });
        doc.moveDown(0.3);
        const from = new Date(data.params.dateFrom).toLocaleDateString('en-IN');
        const to = new Date(data.params.dateTo).toLocaleDateString('en-IN');
        doc.fontSize(11).font('Helvetica').fillColor(COL_MUTED)
            .text(`Period: ${from} - ${to}`, { width: pageWidth, align: 'center' });
        if (options?.includeTimestamp !== false) {
            doc.fontSize(9).text(`Generated: ${data.generatedAt.toLocaleString('en-IN')}`, {
                width: pageWidth, align: 'center',
            });
        }
        doc.moveDown(1);
    }
    renderSummary(doc, metrics) {
        if (!metrics.length)
            return;
        doc.fontSize(14).font('Helvetica-Bold').fillColor(COL_DARK).text('Summary');
        doc.moveDown(0.5);
        const colWidth = (doc.page.width - PAGE_MARGIN * 2) / 2;
        const startY = doc.y;
        metrics.forEach((metric, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = PAGE_MARGIN + col * colWidth;
            const y = startY + row * 22;
            if (y > doc.page.height - 80) {
                doc.addPage();
                return;
            }
            doc.fontSize(10).font('Helvetica-Bold').fillColor(COL_DARK)
                .text(`${metric.label}:`, x, y, { continued: true, width: colWidth });
            doc.font('Helvetica').fillColor(COL_BLUE)
                .text(` ${this.formatMetric(metric)}`, { continued: false });
        });
        const lastRow = Math.ceil(metrics.length / 2);
        doc.y = startY + lastRow * 22 + 10;
        doc.moveDown(0.5);
    }
    renderTables(doc, data) {
        for (const table of data.tables) {
            if (table.columns.length)
                this.renderTable(doc, table.title, table.columns, table.rows);
        }
    }
    renderTable(doc, title, columns, rows) {
        const pageWidth = doc.page.width - PAGE_MARGIN * 2;
        const totalDefined = columns.reduce((s, c) => s + (c.width || 0), 0);
        const defaultW = totalDefined > 0 ? 0 : pageWidth / columns.length;
        const colWidths = columns.map(c => {
            if (!c.width)
                return defaultW || (pageWidth / columns.length);
            return (c.width / (totalDefined || 1)) * pageWidth;
        });
        if (doc.y > doc.page.height - 120)
            doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').fillColor(COL_DARK).text(title);
        doc.moveDown(0.3);
        const headerY = doc.y;
        let xPos = PAGE_MARGIN;
        doc.rect(PAGE_MARGIN, headerY, pageWidth, 18).fill(COL_BLUE);
        columns.forEach((col, i) => {
            doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
                .text(col.header, xPos + 3, headerY + 4, { width: colWidths[i] - 6, lineBreak: false });
            xPos += colWidths[i];
        });
        doc.y = headerY + 20;
        const rowHeight = 16;
        for (let r = 0; r < rows.length; r++) {
            if (doc.y + rowHeight > doc.page.height - 50)
                doc.addPage();
            const rowY = doc.y;
            if (r % 2 === 1) {
                doc.rect(PAGE_MARGIN, rowY, pageWidth, rowHeight).fill(COL_GRAY);
            }
            xPos = PAGE_MARGIN;
            columns.forEach((col, i) => {
                const val = this.formatCell(rows[r][col.key], col.format);
                doc.fontSize(7).font('Helvetica').fillColor(COL_DARK)
                    .text(val, xPos + 3, rowY + 3, { width: colWidths[i] - 6, lineBreak: false });
                xPos += colWidths[i];
            });
            doc.y = rowY + rowHeight;
        }
        doc.moveDown(1);
    }
    addPageNumbers(doc) {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).font('Helvetica').fillColor(COL_MUTED)
                .text(`Page ${i + 1} of ${pageCount}`, PAGE_MARGIN, doc.page.height - 30, { width: doc.page.width - PAGE_MARGIN * 2, align: 'center' });
        }
    }
    formatMetric(metric) {
        const v = metric.value;
        if (metric.format === 'currency')
            return `\u20B9${v.toLocaleString('en-IN')}`;
        if (metric.format === 'percent')
            return `${v.toFixed(1)}%`;
        if (metric.format === 'days')
            return `${v.toFixed(1)} days`;
        return v.toLocaleString('en-IN');
    }
    formatCell(val, format) {
        if (val === null || val === undefined)
            return '';
        if (format === 'date' && val)
            return new Date(val).toLocaleDateString('en-IN');
        if (format === 'currency' && typeof val === 'number')
            return `\u20B9${val.toLocaleString('en-IN')}`;
        if (format === 'percent' && typeof val === 'number')
            return `${val.toFixed(1)}%`;
        return String(val);
    }
};
exports.ReportRendererPdfService = ReportRendererPdfService;
exports.ReportRendererPdfService = ReportRendererPdfService = __decorate([
    (0, common_1.Injectable)()
], ReportRendererPdfService);
//# sourceMappingURL=report-renderer-pdf.service.js.map