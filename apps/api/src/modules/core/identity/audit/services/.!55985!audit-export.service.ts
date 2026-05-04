import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditExportService {
  private readonly logger = new Logger(AuditExportService.name);
  private readonly exportDir = path.join(process.cwd(), 'tmp', 'reports');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportAuditTrail(params: {
    format: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    dateFrom: Date;
    dateTo: Date;
    exportedById: string;
  }): Promise<{ fileUrl: string; recordCount: number }> {
    const where: any = {
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.performedById = params.userId;

    const logs = await this.prisma.identity.auditLog.findMany({
      where,
      include: { fieldChanges: true },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const data = logs.map(log => ({
      timestamp: log.createdAt.toISOString(),
      entityType: log.entityType,
      entityLabel: log.entityLabel || '',
      action: log.action,
      summary: log.summary,
      changedFields: log.fieldChanges.map(fc => fc.fieldLabel || fc.fieldName).join(', '),
