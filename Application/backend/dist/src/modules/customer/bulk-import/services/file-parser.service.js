"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserService = void 0;
const common_1 = require("@nestjs/common");
const Papa = require("papaparse");
const ExcelJS = require("exceljs");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 10000;
let FileParserService = class FileParserService {
    async parse(buffer, fileName, fileSize) {
        if (fileSize > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds limit of 10MB`);
        }
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'csv' || ext === 'txt') {
            return this.parseCsv(buffer);
        }
        if (ext === 'xlsx') {
            return this.parseExcelXlsx(buffer);
        }
        if (ext === 'xls') {
            throw new common_1.BadRequestException('Legacy .xls format is not supported. Please convert your file to .xlsx (Excel 2007+) and re-upload.');
        }
        throw new common_1.BadRequestException(`Unsupported file type: .${ext}. Use CSV, XLS, or XLSX.`);
    }
    parseCsv(buffer) {
        let content = buffer.toString('utf-8');
        if (content.charCodeAt(0) === 0xfeff) {
            content = content.slice(1);
        }
        content = content.replace(/\0/g, '');
        const result = Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
        });
        if (result.errors?.length > 0 && result.data.length === 0) {
            throw new common_1.BadRequestException(`CSV parse error: ${result.errors[0].message}`);
        }
        const headers = result.meta.fields || [];
        const rows = result.data.slice(0, MAX_ROWS);
        if (rows.length === 0) {
            throw new common_1.BadRequestException('File contains no data rows');
        }
        return {
            headers,
            rows,
            totalRows: rows.length,
            sampleData: rows.slice(0, 5),
        };
    }
    async parseExcelXlsx(buffer) {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.load(buffer);
        }
        catch {
            throw new common_1.BadRequestException('Failed to parse Excel file. Ensure the file is a valid .xlsx (Excel 2007+) format.');
        }
        const sheet = workbook.worksheets[0];
        if (!sheet || sheet.rowCount < 2) {
            throw new common_1.BadRequestException('Excel file has no data rows');
        }
        const headerRow = sheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            headers[colNumber - 1] = String(cell.value || '').trim();
        });
        const rows = [];
        for (let r = 2; r <= Math.min(sheet.rowCount, MAX_ROWS + 1); r++) {
            const row = sheet.getRow(r);
            const rowData = {};
            let hasData = false;
            headers.forEach((h, idx) => {
                const cell = row.getCell(idx + 1);
                const val = cell.value != null ? String(cell.value).trim() : '';
                if (val)
                    hasData = true;
                rowData[h] = val;
            });
            if (hasData)
                rows.push(rowData);
        }
        if (rows.length === 0) {
            throw new common_1.BadRequestException('File contains no data rows');
        }
        return {
            headers,
            rows,
            totalRows: rows.length,
            sampleData: rows.slice(0, 5),
        };
    }
};
exports.FileParserService = FileParserService;
exports.FileParserService = FileParserService = __decorate([
    (0, common_1.Injectable)()
], FileParserService);
//# sourceMappingURL=file-parser.service.js.map