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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const ENTITY_COLUMNS = {
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
let ExportService = class ExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createExport(params) {
        const job = await this.prisma.working.exportJob.create({
            data: {
                targetEntity: params.targetEntity,
                format: params.format || 'xlsx',
                filters: params.filters || undefined,
                columns: params.columns || [],
                createdById: params.createdById,
                createdByName: params.createdByName,
            },
        });
        this.generateExportFile(job.id, params).catch(err => {
            console.error('Export generation failed:', err.message);
        });
        return job;
    }
    async generateExportFile(jobId, params) {
        try {
            const records = await this.queryRecords(params.targetEntity, params.filters);
            const columns = ENTITY_COLUMNS[params.targetEntity] || [];
            const dir = path.join(process.cwd(), 'uploads', 'exports');
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, `export-${jobId.slice(0, 8)}.xlsx`);
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet(params.targetEntity);
            sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 15 }));
            const headerRow = sheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
            for (const record of records) {
                const row = {};
                for (const col of columns) {
                    row[col.key] = this.extractExportValue(record, col.key);
                }
                sheet.addRow(row);
            }
            sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };
            await workbook.xlsx.writeFile(filePath);
            const stat = fs.statSync(filePath);
            await this.prisma.working.exportJob.update({
                where: { id: jobId },
                data: {
                    status: 'COMPLETED',
                    fileUrl: `/exports/export-${jobId.slice(0, 8)}.xlsx`,
                    fileSize: stat.size,
                    recordCount: records.length,
                    completedAt: new Date(),
                },
            });
        }
        catch (error) {
            await this.prisma.working.exportJob.update({
                where: { id: jobId },
                data: { status: 'FAILED' },
            });
        }
    }
    async queryRecords(entity, filters) {
        const where = { ...(filters || {}), isActive: true };
        switch (entity) {
            case 'CONTACT':
                return this.prisma.working.contact.findMany({
                    where, include: { organization: { select: { name: true } } }, take: 10000,
                });
            case 'ORGANIZATION':
                return this.prisma.working.organization.findMany({ where, take: 10000 });
            case 'LEAD':
                return this.prisma.working.lead.findMany({
                    where: filters || {},
                    include: { contact: { select: { firstName: true, lastName: true } }, organization: { select: { name: true } } },
                    take: 10000,
                });
            case 'PRODUCT':
                return this.prisma.working.product.findMany({ where, take: 10000 });
            default:
                return [];
        }
    }
    extractExportValue(record, key) {
        if (key === 'organization')
            return record.organization?.name || '';
        if (key === 'contact')
            return `${record.contact?.firstName || ''} ${record.contact?.lastName || ''}`.trim();
        if (key === 'expectedValue')
            return record.expectedValue ? Number(record.expectedValue).toString() : '';
        return record[key] != null ? String(record[key]) : '';
    }
    async generateTemplate(entityType) {
        const columns = ENTITY_COLUMNS[entityType] || [];
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Template');
        sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 15 }));
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map