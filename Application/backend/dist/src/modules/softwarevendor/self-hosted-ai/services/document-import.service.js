"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DocumentImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentImportService = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const ExcelJS = require("exceljs");
let DocumentImportService = DocumentImportService_1 = class DocumentImportService {
    constructor() {
        this.logger = new common_1.Logger(DocumentImportService_1.name);
    }
    async extractFromFile(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        const title = path.basename(file.originalname, ext);
        if (ext === '.txt' || ext === '.md') {
            const content = file.buffer.toString('utf-8').trim();
            if (!content)
                throw new common_1.BadRequestException('File is empty');
            return { title, content, contentType: ext.replace('.', '') };
        }
        if (ext === '.csv') {
            return this.extractFromCsv(file.buffer, title);
        }
        if (ext === '.pdf') {
            return this.extractFromPdf(file.buffer, title);
        }
        if (ext === '.xlsx') {
            return this.extractFromExcel(file.buffer, title);
        }
        if (ext === '.xls') {
            throw new common_1.BadRequestException('Legacy .xls format is not supported. Please convert your file to .xlsx (Excel 2007+) and re-upload.');
        }
        if (ext === '.json') {
            const raw = file.buffer.toString('utf-8').trim();
            const parsed = JSON.parse(raw);
            const content = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
            return { title, content, contentType: 'json' };
        }
        throw new common_1.BadRequestException(`Unsupported file type: ${ext}. Supported: .txt, .md, .csv, .xlsx, .pdf, .json`);
    }
    async extractFromPdf(buffer, title) {
        try {
            const pdfParse = require('pdf-parse');
            const result = await pdfParse(buffer);
            const content = result.text?.trim();
            if (!content)
                throw new common_1.BadRequestException('PDF contains no readable text');
            this.logger.log(`PDF extracted: ${title} � ${result.numpages} pages, ${content.length} chars`);
            return {
                title: title || `PDF Document (${result.numpages} pages)`,
                content,
                contentType: 'pdf',
            };
        }
        catch (e) {
            if (e instanceof common_1.BadRequestException)
                throw e;
            this.logger.error(`PDF extraction failed: ${(e instanceof Error ? e.message : String(e))}`);
            throw new common_1.BadRequestException(`Failed to extract text from PDF: ${e.message}`);
        }
    }
    extractFromCsv(buffer, title) {
        const raw = buffer.toString('utf-8').trim();
        if (!raw)
            throw new common_1.BadRequestException('CSV file is empty');
        const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
            return { title, content: raw, contentType: 'csv' };
        }
        const headers = this.parseCsvLine(lines[0]);
        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            const pairs = headers
                .map((h, idx) => `${h}: ${values[idx] ?? ''}`)
                .filter((p) => !p.endsWith(': '));
            if (pairs.length > 0) {
                records.push(`Record ${i}:\n${pairs.join('\n')}`);
            }
        }
        const content = records.join('\n\n');
        this.logger.log(`CSV extracted: ${title} � ${headers.length} columns, ${records.length} rows`);
        return { title, content, contentType: 'csv' };
    }
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (ch === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    }
    async extractFromExcel(buffer, title) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const allSheetText = [];
            for (const sheet of workbook.worksheets) {
                if (sheet.rowCount < 2)
                    continue;
                const headerRow = sheet.getRow(1);
                const headers = [];
                headerRow.eachCell((cell, colNumber) => {
                    headers[colNumber - 1] = String(cell.value ?? '').trim();
                });
                const records = [];
                for (let r = 2; r <= sheet.rowCount; r++) {
                    const row = sheet.getRow(r);
                    const pairs = [];
                    headers.forEach((h, idx) => {
                        const val = String(row.getCell(idx + 1).value ?? '').trim();
                        if (h && val)
                            pairs.push(`${h}: ${val}`);
                    });
                    if (pairs.length > 0) {
                        records.push(`Record ${r - 1}:\n${pairs.join('\n')}`);
                    }
                }
                if (records.length > 0) {
                    const sheetHeader = workbook.worksheets.length > 1 ? `\n=== Sheet: ${sheet.name} ===\n\n` : '';
                    allSheetText.push(sheetHeader + records.join('\n\n'));
                }
            }
            const content = allSheetText.join('\n\n').trim();
            if (!content)
                throw new common_1.BadRequestException('Excel file contains no readable data');
            this.logger.log(`Excel extracted: ${title} � ${workbook.worksheets.length} sheets, ${content.length} chars`);
            return { title, content, contentType: 'excel' };
        }
        catch (e) {
            if (e instanceof common_1.BadRequestException)
                throw e;
            this.logger.error(`Excel extraction failed: ${(e instanceof Error ? e.message : String(e))}`);
            throw new common_1.BadRequestException(`Failed to extract data from Excel: ${e.message}`);
        }
    }
    async extractFromUrl(url) {
        if (!url || !url.startsWith('http')) {
            throw new common_1.BadRequestException('Invalid URL. Must start with http:// or https://');
        }
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; CRMBot/1.0)',
                    Accept: 'text/html,application/xhtml+xml,text/plain',
                },
                signal: AbortSignal.timeout(15000),
            });
            if (!response.ok) {
                throw new common_1.BadRequestException(`Failed to fetch URL: HTTP ${response.status}`);
            }
            const contentType = response.headers.get('content-type') ?? '';
            const body = await response.text();
            if (contentType.includes('application/pdf')) {
                const buffer = Buffer.from(await response.arrayBuffer());
                return this.extractFromPdf(buffer, new URL(url).hostname);
            }
            const text = this.htmlToText(body);
            if (!text || text.length < 10) {
                throw new common_1.BadRequestException('Could not extract meaningful text from URL');
            }
            const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/is);
            const pageTitle = titleMatch?.[1]?.trim() || new URL(url).hostname;
            this.logger.log(`URL extracted: ${pageTitle} � ${text.length} chars from ${url}`);
            return {
                title: pageTitle,
                content: text,
                contentType: 'url',
            };
        }
        catch (e) {
            if (e instanceof common_1.BadRequestException)
                throw e;
            this.logger.error(`URL scraping failed: ${(e instanceof Error ? e.message : String(e))}`);
            throw new common_1.BadRequestException(`Failed to scrape URL: ${e.message}`);
        }
    }
    htmlToText(html) {
        let text = html;
        text = text.replace(/<(script|style|nav|footer|header|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
        text = text.replace(/<!--[\s\S]*?-->/g, '');
        text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<[^>]+>/g, ' ');
        text = text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        text = text
            .split('\n')
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .filter((line) => line.length > 0)
            .join('\n');
        text = text.replace(/\n{3,}/g, '\n\n');
        return text.trim();
    }
};
exports.DocumentImportService = DocumentImportService;
exports.DocumentImportService = DocumentImportService = DocumentImportService_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentImportService);
//# sourceMappingURL=document-import.service.js.map