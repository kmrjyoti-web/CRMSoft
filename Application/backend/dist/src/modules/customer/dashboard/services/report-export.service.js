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
var ReportExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
let ReportExportService = ReportExportService_1 = class ReportExportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReportExportService_1.name);
        this.exportDir = path.join(process.cwd(), 'tmp', 'reports');
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir, { recursive: true });
        }
    }
    async exportReport(params) {
        const startTime = Date.now();
        const { reportType, format, filters } = params;
        const { columns, data } = await this.queryReportData(reportType, filters);
        const fileName = `${reportType}_${Date.now()}.${format.toLowerCase()}`;
        const filePath = path.join(this.exportDir, fileName);
        let fileSize = 0;
        if (format === 'XLSX') {
            const buffer = await this.generateExcel({ columns, data, sheetName: reportType, title: reportType.replace(/_/g, ' '), filters });
            fs.writeFileSync(filePath, buffer);
            fileSize = buffer.length;
        }
        else if (format === 'CSV') {
            const csv = this.generateCsv(columns, data);
            fs.writeFileSync(filePath, csv);
            fileSize = Buffer.byteLength(csv);
        }
        else {
            const json = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, json);
            fileSize = Buffer.byteLength(json);
        }
        const duration = Date.now() - startTime;
        await this.prisma.working.reportExportLog.create({
            data: {
                reportType: reportType, format: format, filters: filters,
                recordCount: data.length, fileUrl: filePath, fileSize, status: 'COMPLETED',
                generatedAt: new Date(), duration,
                exportedById: params.exportedById, exportedByName: params.exportedByName,
            },
        });
        return { fileUrl: filePath, recordCount: data.length, fileSize, duration };
    }
    async queryReportData(reportType, filters) {
        const dateFilter = {};
        if (filters.dateFrom)
            dateFilter.gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            dateFilter.lte = new Date(filters.dateTo);
        const hasDateFilter = Object.keys(dateFilter).length > 0;
        switch (reportType) {
            case 'LEAD_REPORT': {
                const where = {};
                if (hasDateFilter)
                    where.createdAt = dateFilter;
                if (filters.status)
                    where.status = filters.status;
                if (filters.userId)
                    where.allocatedToId = filters.userId;
                const leads = await this.prisma.working.lead.findMany({
                    where, include: { contact: { select: { firstName: true, lastName: true } },
                        organization: { select: { name: true } },
                        allocatedTo: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'desc' },
                });
                return {
                    columns: [
                        { key: 'leadNumber', header: 'Lead #', width: 18 },
                        { key: 'contactName', header: 'Contact Name', width: 22 },
                        { key: 'organizationName', header: 'Organization', width: 25 },
                        { key: 'status', header: 'Status', width: 15 },
                        { key: 'priority', header: 'Priority', width: 12 },
                        { key: 'expectedValue', header: 'Expected Value', width: 18, format: 'currency' },
                        { key: 'allocatedTo', header: 'Allocated To', width: 20 },
                        { key: 'createdAt', header: 'Created Date', width: 15, format: 'date' },
                    ],
                    data: leads.map(l => ({
                        leadNumber: l.leadNumber, contactName: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
                        organizationName: l.organization?.name || '', status: l.status, priority: l.priority,
                        expectedValue: Number(l.expectedValue || 0),
                        allocatedTo: l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned',
                        createdAt: l.createdAt,
                    })),
                };
            }
            case 'ACTIVITY_REPORT': {
                const where = {};
                if (hasDateFilter)
                    where.createdAt = dateFilter;
                if (filters.userId)
                    where.createdById = filters.userId;
                const activities = await this.prisma.working.activity.findMany({
                    where, include: { lead: { select: { leadNumber: true } },
                        createdByUser: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'desc' },
                });
                return {
                    columns: [
                        { key: 'date', header: 'Date', width: 15, format: 'date' },
                        { key: 'type', header: 'Type', width: 12 },
                        { key: 'subject', header: 'Subject', width: 30 },
                        { key: 'outcome', header: 'Outcome', width: 20 },
                        { key: 'leadNumber', header: 'Lead #', width: 18 },
                        { key: 'performedBy', header: 'Performed By', width: 20 },
                    ],
                    data: activities.map(a => ({
                        date: a.createdAt, type: a.type, subject: a.subject, outcome: a.outcome || '',
                        leadNumber: a.lead?.leadNumber || '', performedBy: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
                    })),
                };
            }
            case 'QUOTATION_REPORT': {
                const where = {};
                if (hasDateFilter)
                    where.createdAt = dateFilter;
                if (filters.status)
                    where.status = filters.status;
                const quotations = await this.prisma.working.quotation.findMany({
                    where, include: { lead: { select: { leadNumber: true } },
                        createdByUser: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'desc' },
                });
                return {
                    columns: [
                        { key: 'quotationNo', header: 'Quotation #', width: 20 },
                        { key: 'leadNumber', header: 'Lead #', width: 18 },
                        { key: 'status', header: 'Status', width: 14 },
                        { key: 'totalAmount', header: 'Total Amount', width: 18, format: 'currency' },
                        { key: 'createdBy', header: 'Created By', width: 20 },
                        { key: 'createdAt', header: 'Created Date', width: 15, format: 'date' },
                    ],
                    data: quotations.map(q => ({
                        quotationNo: q.quotationNo, leadNumber: q.lead?.leadNumber || '', status: q.status,
                        totalAmount: Number(q.totalAmount), createdBy: `${q.createdByUser.firstName} ${q.createdByUser.lastName}`,
                        createdAt: q.createdAt,
                    })),
                };
            }
            default:
                return { columns: [], data: [] };
        }
    }
    async generateExcel(params) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(params.sheetName.replace(/_/g, ' '));
        sheet.mergeCells(1, 1, 1, params.columns.length);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = params.title.replace(/_/g, ' ');
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        const headerRow = sheet.getRow(3);
        params.columns.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            if (col.width)
                sheet.getColumn(i + 1).width = col.width;
        });
        params.data.forEach((row, rowIdx) => {
            const excelRow = sheet.getRow(rowIdx + 4);
            params.columns.forEach((col, colIdx) => {
                const cell = excelRow.getCell(colIdx + 1);
                let val = row[col.key];
                if (col.format === 'date' && val)
                    val = new Date(val).toLocaleDateString('en-IN');
                if (col.format === 'currency' && typeof val === 'number')
                    val = `?${val.toLocaleString('en-IN')}`;
                cell.value = val;
            });
            if (rowIdx % 2 === 1) {
                excelRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }; });
            }
        });
        sheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: params.columns.length } };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    generateCsv(columns, data) {
        const escape = (val) => {
            if (val === null || val === undefined)
                return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"` : str;
        };
        const header = columns.map(c => escape(c.header)).join(',');
        const rows = data.map(row => columns.map(c => {
            let val = row[c.key];
            if (c.format === 'date' && val)
                val = new Date(val).toLocaleDateString('en-IN');
            return escape(val);
        }).join(','));
        return [header, ...rows].join('\n');
    }
    async getExportHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.working.reportExportLog.findMany({
                where: { exportedById: userId }, orderBy: { createdAt: 'desc' }, skip, take: limit,
            }),
            this.prisma.working.reportExportLog.count({ where: { exportedById: userId } }),
        ]);
        return { data, total, page, limit };
    }
};
exports.ReportExportService = ReportExportService;
exports.ReportExportService = ReportExportService = ReportExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportExportService);
//# sourceMappingURL=report-export.service.js.map