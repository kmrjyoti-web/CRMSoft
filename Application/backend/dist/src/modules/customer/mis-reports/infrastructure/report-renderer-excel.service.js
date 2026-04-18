"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRendererExcelService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = require("exceljs");
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
const ALT_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
const THIN_BORDER = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' },
};
let ReportRendererExcelService = class ReportRendererExcelService {
    async render(data, options) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'MIS Reports';
        workbook.created = new Date();
        this.buildSummarySheet(workbook, data, options);
        for (const table of data.tables) {
            this.buildDataSheet(workbook, table.title, table.columns, table.rows);
        }
        const arrayBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(arrayBuffer);
    }
    buildSummarySheet(workbook, data, options) {
        const sheet = workbook.addWorksheet('Summary');
        const title = options?.title || data.reportName;
        sheet.mergeCells(1, 1, 1, 4);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = title;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        sheet.mergeCells(2, 1, 2, 4);
        const dateCell = sheet.getCell(2, 1);
        const from = new Date(data.params.dateFrom).toLocaleDateString('en-IN');
        const to = new Date(data.params.dateTo).toLocaleDateString('en-IN');
        dateCell.value = `Period: ${from} - ${to}`;
        dateCell.font = { size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center' };
        if (options?.includeTimestamp !== false) {
            sheet.mergeCells(3, 1, 3, 4);
            const tsCell = sheet.getCell(3, 1);
            tsCell.value = `Generated: ${data.generatedAt.toLocaleString('en-IN')}`;
            tsCell.font = { size: 10, italic: true, color: { argb: '6B7280' } };
            tsCell.alignment = { horizontal: 'center' };
        }
        const headerRow = 5;
        const metricHeaders = ['Metric', 'Value', 'Previous', 'Change'];
        metricHeaders.forEach((h, i) => {
            const cell = sheet.getCell(headerRow, i + 1);
            cell.value = h;
            cell.font = HEADER_FONT;
            cell.fill = HEADER_FILL;
            cell.border = THIN_BORDER;
        });
        sheet.getColumn(1).width = 30;
        sheet.getColumn(2).width = 20;
        sheet.getColumn(3).width = 20;
        sheet.getColumn(4).width = 18;
        data.summary.forEach((metric, idx) => {
            const row = headerRow + 1 + idx;
            sheet.getCell(row, 1).value = metric.label;
            sheet.getCell(row, 2).value = this.formatMetricValue(metric.value, metric.format);
            sheet.getCell(row, 3).value = metric.previousValue != null
                ? this.formatMetricValue(metric.previousValue, metric.format) : '-';
            sheet.getCell(row, 4).value = metric.changePercent != null
                ? `${metric.changeDirection === 'DOWN' ? '-' : '+'}${Math.abs(metric.changePercent).toFixed(1)}%` : '-';
            if (idx % 2 === 1) {
                for (let c = 1; c <= 4; c++)
                    sheet.getCell(row, c).fill = ALT_ROW_FILL;
            }
            for (let c = 1; c <= 4; c++)
                sheet.getCell(row, c).border = THIN_BORDER;
        });
    }
    buildDataSheet(workbook, title, columns, rows) {
        const sheetName = title.substring(0, 31).replace(/[\\/*?[\]:]/g, '');
        const sheet = workbook.addWorksheet(sheetName);
        if (columns.length > 0) {
            sheet.mergeCells(1, 1, 1, columns.length);
            const titleCell = sheet.getCell(1, 1);
            titleCell.value = title;
            titleCell.font = { size: 14, bold: true };
            titleCell.alignment = { horizontal: 'center' };
        }
        const headerRowNum = 3;
        columns.forEach((col, i) => {
            const cell = sheet.getCell(headerRowNum, i + 1);
            cell.value = col.header;
            cell.font = HEADER_FONT;
            cell.fill = HEADER_FILL;
            cell.border = THIN_BORDER;
            if (col.width)
                sheet.getColumn(i + 1).width = col.width;
        });
        rows.forEach((row, rowIdx) => {
            const excelRow = sheet.getRow(headerRowNum + 1 + rowIdx);
            columns.forEach((col, colIdx) => {
                const cell = excelRow.getCell(colIdx + 1);
                cell.value = this.formatCellValue(row[col.key], col.format);
                cell.border = THIN_BORDER;
            });
            if (rowIdx % 2 === 1) {
                excelRow.eachCell(c => { c.fill = ALT_ROW_FILL; });
            }
        });
        if (columns.length > 0 && rows.length > 0) {
            sheet.autoFilter = {
                from: { row: headerRowNum, column: 1 },
                to: { row: headerRowNum, column: columns.length },
            };
        }
    }
    formatMetricValue(value, format) {
        switch (format) {
            case 'currency': return `\u20B9${value.toLocaleString('en-IN')}`;
            case 'percent': return `${value.toFixed(1)}%`;
            case 'days': return `${value.toFixed(1)} days`;
            default: return value.toLocaleString('en-IN');
        }
    }
    formatCellValue(val, format) {
        if (val === null || val === undefined)
            return '';
        if (format === 'date' && val)
            return new Date(val).toLocaleDateString('en-IN');
        if (format === 'currency' && typeof val === 'number')
            return `\u20B9${val.toLocaleString('en-IN')}`;
        if (format === 'percent' && typeof val === 'number')
            return `${val.toFixed(1)}%`;
        return val;
    }
};
exports.ReportRendererExcelService = ReportRendererExcelService;
exports.ReportRendererExcelService = ReportRendererExcelService = __decorate([
    (0, common_1.Injectable)()
], ReportRendererExcelService);
//# sourceMappingURL=report-renderer-excel.service.js.map