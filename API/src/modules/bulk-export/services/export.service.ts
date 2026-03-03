import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

/** Column definition for entity export */
interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

const ENTITY_COLUMNS: Record<string, ExportColumn[]> = {
  CONTACT: [
    { key: 'firstName', header: 'First Name', width: 15 },
    { key: 'lastName', header: 'Last Name', width: 15 },
    { key: 'designation', header: 'Designation', width: 15 },
    { key: 'department', header: 'Department', width: 15 },
    { key: 'organization', header: 'Organization', width: 25 },
    { key: 'notes', header: 'Notes', width: 30 },
  ],
  ORGANIZATION: [
    { key: 'name', header: 'Name', width: 25 },
    { key: 'website', header: 'Website', width: 25 },
    { key: 'gstNumber', header: 'GST Number', width: 20 },
    { key: 'industry', header: 'Industry', width: 15 },
    { key: 'city', header: 'City', width: 15 },
    { key: 'state', header: 'State', width: 15 },
    { key: 'pincode', header: 'Pincode', width: 10 },
  ],
  LEAD: [
    { key: 'leadNumber', header: 'Lead Number', width: 20 },
    { key: 'status', header: 'Status', width: 15 },
    { key: 'priority', header: 'Priority', width: 12 },
    { key: 'expectedValue', header: 'Expected Value', width: 15 },
    { key: 'contact', header: 'Contact', width: 25 },
    { key: 'organization', header: 'Organization', width: 25 },
  ],
  PRODUCT: [
    { key: 'name', header: 'Name', width: 25 },
    { key: 'code', header: 'Code', width: 15 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'description', header: 'Description', width: 30 },
  ],
};

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create an export job and generate the file */
  async createExport(params: {
    targetEntity: string;
    format: string;
    filters?: any;
    columns?: string[];
    createdById: string;
    createdByName: string;
  }): Promise<any> {
    const job = await this.prisma.exportJob.create({
      data: {
        targetEntity: params.targetEntity,
        format: params.format || 'xlsx',
        filters: params.filters || undefined,
        columns: params.columns || [],
        createdById: params.createdById,
        createdByName: params.createdByName,
      },
    });

    // Generate async — don't block response
    this.generateExportFile(job.id, params).catch(err => {
      console.error('Export generation failed:', err.message);
    });

    return job;
  }

  /** Generate export file */
  private async generateExportFile(jobId: string, params: any): Promise<void> {
    try {
      const records = await this.queryRecords(params.targetEntity, params.filters);
      const columns = ENTITY_COLUMNS[params.targetEntity] || [];
      const dir = path.join(process.cwd(), 'uploads', 'exports');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filePath = path.join(dir, `export-${jobId.slice(0, 8)}.xlsx`);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(params.targetEntity);
      sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 15 }));

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };

      for (const record of records) {
        const row: Record<string, any> = {};
        for (const col of columns) {
          row[col.key] = this.extractExportValue(record, col.key);
        }
        sheet.addRow(row);
      }

      sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };
      await workbook.xlsx.writeFile(filePath);

      const stat = fs.statSync(filePath);
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          fileUrl: `/exports/export-${jobId.slice(0, 8)}.xlsx`,
          fileSize: stat.size,
          recordCount: records.length,
          completedAt: new Date(),
        },
      });
    } catch (error: any) {
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: { status: 'FAILED' },
      });
    }
  }

  /** Query records by entity type with optional filters */
  private async queryRecords(entity: string, filters?: any): Promise<any[]> {
    const where: any = { ...(filters || {}), isActive: true };

    switch (entity) {
      case 'CONTACT':
        return this.prisma.contact.findMany({
          where, include: { organization: { select: { name: true } } }, take: 10000,
        });
      case 'ORGANIZATION':
        return this.prisma.organization.findMany({ where, take: 10000 });
      case 'LEAD':
        return this.prisma.lead.findMany({
          where: filters || {},
          include: { contact: { select: { firstName: true, lastName: true } }, organization: { select: { name: true } } },
          take: 10000,
        });
      case 'PRODUCT':
        return this.prisma.product.findMany({ where, take: 10000 });
      default:
        return [];
    }
  }

  /** Extract value for export column from record */
  private extractExportValue(record: any, key: string): string {
    if (key === 'organization') return record.organization?.name || '';
    if (key === 'contact') return `${record.contact?.firstName || ''} ${record.contact?.lastName || ''}`.trim();
    if (key === 'expectedValue') return record.expectedValue ? Number(record.expectedValue).toString() : '';
    return record[key] != null ? String(record[key]) : '';
  }

  /** Generate a blank template for an entity type */
  async generateTemplate(entityType: string): Promise<Buffer> {
    const columns = ENTITY_COLUMNS[entityType] || [];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template');
    sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 15 }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
