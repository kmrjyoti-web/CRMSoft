import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocumentImportService {
  private readonly logger = new Logger(DocumentImportService.name);

  // -- Extract text from uploaded file --

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

  // -- Extract text from PDF --

  private async extractFromPdf(
    buffer: Buffer,
    title: string,
  ): Promise<{ title: string; content: string; contentType: string }> {
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      const content = result.text?.trim();
      if (!content) throw new BadRequestException('PDF contains no readable text');

