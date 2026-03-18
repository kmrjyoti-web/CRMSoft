import { Injectable, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  sampleData: Record<string, string>[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 10000;

@Injectable()
export class FileParserService {
  /** Parse uploaded file (CSV or Excel) into structured rows */
  async parse(buffer: Buffer, fileName: string, fileSize: number): Promise<ParsedFile> {
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds limit of 10MB`);
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'txt') {
      return this.parseCsv(buffer);
    }
    if (ext === 'xlsx') {
      return this.parseExcelXlsx(buffer);
    }
    if (ext === 'xls') {
      return this.parseExcelXls(buffer);
    }
    throw new BadRequestException(`Unsupported file type: .${ext}. Use CSV, XLS, or XLSX.`);
  }

  /** Parse CSV buffer using papaparse, handles BOM */
  private parseCsv(buffer: Buffer): ParsedFile {
    let content = buffer.toString('utf-8');
    // Strip BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    // Strip null bytes (can come from Excel-saved CSVs)
    content = content.replace(/\0/g, '');

    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (result.errors?.length > 0 && result.data.length === 0) {
      throw new BadRequestException(`CSV parse error: ${result.errors[0].message}`);
    }

    const headers = result.meta.fields || [];
    const rows = (result.data as Record<string, string>[]).slice(0, MAX_ROWS);

    if (rows.length === 0) {
      throw new BadRequestException('File contains no data rows');
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
      sampleData: rows.slice(0, 5),
    };
  }

  /** Parse .xlsx using ExcelJS */
  private async parseExcelXlsx(buffer: Buffer): Promise<ParsedFile> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch {
      // Fallback to SheetJS if ExcelJS fails
      return this.parseExcelXls(buffer);
    }
    const sheet = workbook.worksheets[0];

    if (!sheet || sheet.rowCount < 2) {
      throw new BadRequestException('Excel file has no data rows');
    }

    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value || '').trim();
    });

    const rows: Record<string, string>[] = [];
    for (let r = 2; r <= Math.min(sheet.rowCount, MAX_ROWS + 1); r++) {
      const row = sheet.getRow(r);
      const rowData: Record<string, string> = {};
      let hasData = false;

      headers.forEach((h, idx) => {
        const cell = row.getCell(idx + 1);
        const val = cell.value != null ? String(cell.value).trim() : '';
        if (val) hasData = true;
        rowData[h] = val;
      });

      if (hasData) rows.push(rowData);
    }

    if (rows.length === 0) {
      throw new BadRequestException('File contains no data rows');
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
      sampleData: rows.slice(0, 5),
    };
  }

  /** Parse .xls (legacy binary) using SheetJS */
  private parseExcelXls(buffer: Buffer): ParsedFile {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('Excel file has no sheets');
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false, // Return formatted strings
    });

    if (jsonData.length === 0) {
      throw new BadRequestException('File contains no data rows');
    }

    const headers = Object.keys(jsonData[0]).map((h) => h.trim());
    const rows = jsonData.slice(0, MAX_ROWS).map((row) => {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        clean[k.trim()] = v != null ? String(v).trim().replace(/\0/g, '') : '';
      }
      return clean;
    });

    return {
      headers,
      rows,
      totalRows: rows.length,
      sampleData: rows.slice(0, 5),
    };
  }
}
