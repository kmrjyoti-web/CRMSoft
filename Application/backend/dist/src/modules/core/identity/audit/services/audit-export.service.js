"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
let AuditExportService = AuditExportService_1 = class AuditExportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditExportService_1.name);
        this.exportDir = path.join(process.cwd(), 'tmp', 'reports');
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir, { recursive: true });
        }
    }
    async exportAuditTrail(params) {
        const where = {
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.entityType)
            where.entityType = params.entityType;
        if (params.entityId)
            where.entityId = params.entityId;
        if (params.userId)
            where.performedById = params.userId;
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
            oldValues: log.fieldChanges.map(fc => fc.oldDisplayValue || '�').join(', '),
            newValues: log.fieldChanges.map(fc => fc.newDisplayValue || '�').join(', '),
            performedBy: log.performedByName || '',
            ipAddress: log.ipAddress || '',
            source: log.source || '',
            module: log.module || '',
        }));
        const fileName = `audit_trail_${Date.now()}.${params.format.toLowerCase()}`;
        const filePath = path.join(this.exportDir, fileName);
        const columns = [
            { key: 'timestamp', header: 'Timestamp', width: 22 },
            { key: 'entityType', header: 'Entity Type', width: 16 },
            { key: 'entityLabel', header: 'Entity', width: 25 },
            { key: 'action', header: 'Action', width: 14 },
            { key: 'summary', header: 'Summary', width: 50 },
            { key: 'changedFields', header: 'Changed Fields', width: 30 },
            { key: 'oldValues', header: 'Old Values', width: 30 },
            { key: 'newValues', header: 'New Values', width: 30 },
            { key: 'performedBy', header: 'Performed By', width: 20 },
            { key: 'ipAddress', header: 'IP Address', width: 16 },
            { key: 'source', header: 'Source', width: 12 },
            { key: 'module', header: 'Module', width: 14 },
        ];
        if (params.format === 'XLSX') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Audit Trail');
            sheet.mergeCells(1, 1, 1, columns.length);
            const titleCell = sheet.getCell(1, 1);
            titleCell.value = 'Audit Trail Export';
            titleCell.font = { size: 16, bold: true };
            titleCell.alignment = { horizontal: 'center' };
            const headerRow = sheet.getRow(3);
            columns.forEach((col, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = col.header;
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
                sheet.getColumn(i + 1).width = col.width;
            });
            data.forEach((row, rowIdx) => {
                const excelRow = sheet.getRow(rowIdx + 4);
                columns.forEach((col, colIdx) => {
                    excelRow.getCell(colIdx + 1).value = String(row[col.key] ?? '');
                });
                if (rowIdx % 2 === 1) {
                    excelRow.eachCell(c => {
                        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
                    });
                }
            });
            sheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: columns.length } };
            const buffer = await workbook.xlsx.writeBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));
        }
        else {
            const escape = (val) => {
                if (val === null || val === undefined)
                    return '';
                const str = String(val);
                return str.includes(',') || str.includes('"') || str.includes('\n')
                    ? `"${str.replace(/"/g, '""')}"` : str;
            };
            const header = columns.map(c => escape(c.header)).join(',');
            const rows = data.map(row => columns.map(c => escape(row[c.key])).join(','));
            fs.writeFileSync(filePath, [header, ...rows].join('\n'));
        }
        await this.prisma.reportExportLog.create({
            data: {
                reportType: 'CUSTOM',
                format: params.format,
                filters: { entityType: params.entityType, dateFrom: params.dateFrom, dateTo: params.dateTo },
                recordCount: data.length,
                fileUrl: filePath,
                fileSize: fs.statSync(filePath).size,
                status: 'COMPLETED',
                generatedAt: new Date(),
                exportedById: params.exportedById,
                exportedByName: 'System',
            },
        });
        return { fileUrl: filePath, recordCount: data.length };
    }
};
exports.AuditExportService = AuditExportService;
exports.AuditExportService = AuditExportService = AuditExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditExportService);
//# sourceMappingURL=audit-export.service.js.map