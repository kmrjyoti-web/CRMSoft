import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
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
    filters?: Record<string, unknown>;
    columns?: string[];
    createdById: string;
    createdByName: string;
  }): Promise<Record<string, unknown>> {
    const job = await this.prisma.working.exportJob.create({
      data: {
        targetEntity: params.targetEntity,
        format: params.format || 'xlsx',
        filters: params.filters || undefined as any,
        columns: params.columns || [],
        createdById: params.createdById,
        createdByName: params.createdByName,
      },
    });

