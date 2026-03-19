import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocumentImportService {
  private readonly logger = new Logger(DocumentImportService.name);

  // ── Extract text from uploaded file ──

  async extractFromFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }): Promise<{ title: string; content: string; contentType: string }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const title = path.basename(file.originalname, ext);

    if (ext === '.txt' || ext === '.md') {
      const content = file.buffer.toString('utf-8').trim();
      if (!content) throw new BadRequestException('File is empty');
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
      throw new BadRequestException(
        'Legacy .xls format is not supported. Please convert your file to .xlsx (Excel 2007+) and re-upload.',
      );
    }

    if (ext === '.json') {
      const raw = file.buffer.toString('utf-8').trim();
      const parsed = JSON.parse(raw);
      const content = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      return { title, content, contentType: 'json' };
    }

    throw new BadRequestException(
      `Unsupported file type: ${ext}. Supported: .txt, .md, .csv, .xlsx, .pdf, .json`,
    );
  }

  // ── Extract text from PDF ──

  private async extractFromPdf(
    buffer: Buffer,
    title: string,
  ): Promise<{ title: string; content: string; contentType: string }> {
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      const content = result.text?.trim();
      if (!content) throw new BadRequestException('PDF contains no readable text');

      this.logger.log(`PDF extracted: ${title} — ${result.numpages} pages, ${content.length} chars`);

      return {
        title: title || `PDF Document (${result.numpages} pages)`,
        content,
        contentType: 'pdf',
      };
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      this.logger.error(`PDF extraction failed: ${e.message}`);
      throw new BadRequestException(`Failed to extract text from PDF: ${e.message}`);
    }
  }

  // ── Extract text from CSV ──

  private extractFromCsv(
    buffer: Buffer,
    title: string,
  ): { title: string; content: string; contentType: string } {
    const raw = buffer.toString('utf-8').trim();
    if (!raw) throw new BadRequestException('CSV file is empty');

    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { title, content: raw, contentType: 'csv' };
    }

    // Parse header + rows into readable text records
    const headers = this.parseCsvLine(lines[0]);
    const records: string[] = [];

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
    this.logger.log(`CSV extracted: ${title} — ${headers.length} columns, ${records.length} rows`);

    return { title, content, contentType: 'csv' };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  // ── Extract text from Excel ──

  private async extractFromExcel(
    buffer: Buffer,
    title: string,
  ): Promise<{ title: string; content: string; contentType: string }> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      const allSheetText: string[] = [];

      for (const sheet of workbook.worksheets) {
        if (sheet.rowCount < 2) continue;

        const headerRow = sheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = String(cell.value ?? '').trim();
        });

        const records: string[] = [];
        for (let r = 2; r <= sheet.rowCount; r++) {
          const row = sheet.getRow(r);
          const pairs: string[] = [];
          headers.forEach((h, idx) => {
            const val = String(row.getCell(idx + 1).value ?? '').trim();
            if (h && val) pairs.push(`${h}: ${val}`);
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
      if (!content) throw new BadRequestException('Excel file contains no readable data');

      this.logger.log(`Excel extracted: ${title} — ${workbook.worksheets.length} sheets, ${content.length} chars`);

      return { title, content, contentType: 'excel' };
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      this.logger.error(`Excel extraction failed: ${e.message}`);
      throw new BadRequestException(`Failed to extract data from Excel: ${e.message}`);
    }
  }

  // ── Scrape text from URL ──

  async extractFromUrl(url: string): Promise<{ title: string; content: string; contentType: string }> {
    if (!url || !url.startsWith('http')) {
      throw new BadRequestException('Invalid URL. Must start with http:// or https://');
    }

    try {
      // Use native fetch (Node 18+) to get HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CRMBot/1.0)',
          Accept: 'text/html,application/xhtml+xml,text/plain',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch URL: HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      const body = await response.text();

      if (contentType.includes('application/pdf')) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return this.extractFromPdf(buffer, new URL(url).hostname);
      }

      // Extract text from HTML
      const text = this.htmlToText(body);
      if (!text || text.length < 10) {
        throw new BadRequestException('Could not extract meaningful text from URL');
      }

      // Extract title from HTML
      const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/is);
      const pageTitle = titleMatch?.[1]?.trim() || new URL(url).hostname;

      this.logger.log(`URL extracted: ${pageTitle} — ${text.length} chars from ${url}`);

      return {
        title: pageTitle,
        content: text,
        contentType: 'url',
      };
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      this.logger.error(`URL scraping failed: ${e.message}`);
      throw new BadRequestException(`Failed to scrape URL: ${e.message}`);
    }
  }

  // ── Simple HTML to text converter ──

  private htmlToText(html: string): string {
    let text = html;

    // Remove script, style, nav, footer, header tags and their content
    text = text.replace(/<(script|style|nav|footer|header|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Convert common block tags to newlines
    text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode common HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // Clean up whitespace
    text = text
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0)
      .join('\n');

    // Collapse multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }
}
