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
exports.CommitImportHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const import_executor_service_1 = require("../../../services/import-executor.service");
const result_report_service_1 = require("../../../services/result-report.service");
const commit_import_command_1 = require("./commit-import.command");
let CommitImportHandler = class CommitImportHandler {
    constructor(prisma, executor, reportService) {
        this.prisma = prisma;
        this.executor = executor;
        this.reportService = reportService;
    }
    async execute(cmd) {
        const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
        await this.prisma.working.importJob.update({
            where: { id: cmd.jobId },
            data: { status: 'IMPORTING', startedAt: new Date() },
        });
        const rows = await this.prisma.working.importRow.findMany({
            where: { importJobId: cmd.jobId },
            orderBy: { rowNumber: 'asc' },
        });
        let created = 0, updated = 0, skipped = 0, failed = 0;
        for (const row of rows) {
            if (row.rowStatus === 'IMPORTED' || row.rowStatus === 'SKIPPED') {
                if (row.rowStatus === 'SKIPPED')
                    skipped++;
                continue;
            }
            if (row.userAction === 'SKIP' || row.rowStatus === 'INVALID') {
                await this.prisma.working.importRow.update({
                    where: { id: row.id },
                    data: { rowStatus: 'SKIPPED', importAction: 'SKIPPED' },
                });
                skipped++;
                continue;
            }
            const shouldImport = row.rowStatus === 'VALID' ||
                row.userAction === 'ACCEPT' ||
                row.userAction === 'FORCE_CREATE';
            if (!shouldImport) {
                await this.prisma.working.importRow.update({
                    where: { id: row.id },
                    data: { rowStatus: 'SKIPPED', importAction: 'SKIPPED' },
                });
                skipped++;
                continue;
            }
            const result = await this.executor.executeRow({
                rowNumber: row.rowNumber,
                mappedData: (row.userEditedData || row.mappedData || {}),
                userAction: row.userAction || undefined,
                duplicateOfEntityId: row.duplicateOfEntityId || undefined,
            }, job.targetEntity, cmd.createdById);
            if (result.success) {
                if (result.action === 'CREATED')
                    created++;
                else if (result.action === 'UPDATED')
                    updated++;
                else if (result.action === 'SKIPPED')
                    skipped++;
                await this.prisma.working.importRow.update({
                    where: { id: row.id },
                    data: {
                        rowStatus: 'IMPORTED',
                        importAction: result.action,
                        importedEntityId: result.entityId,
                        importedAt: new Date(),
                    },
                });
            }
            else {
                failed++;
                await this.prisma.working.importRow.update({
                    where: { id: row.id },
                    data: { rowStatus: 'FAILED', importAction: 'FAILED', importError: result.error },
                });
            }
        }
        await this.prisma.working.importJob.update({
            where: { id: cmd.jobId },
            data: {
                status: 'COMPLETED',
                importedCount: created,
                updatedCount: updated,
                skippedRows: skipped,
                failedCount: failed,
                completedAt: new Date(),
            },
        });
        if (job.profileId) {
            await this.prisma.working.importProfile.update({
                where: { id: job.profileId },
                data: {
                    usageCount: { increment: 1 },
                    lastUsedAt: new Date(),
                    totalImported: { increment: created + updated },
                    avgSuccessRate: job.totalRows > 0 ? ((created + updated) / job.totalRows) * 100 : 0,
                },
            });
        }
        try {
            await this.reportService.generateReport(cmd.jobId);
        }
        catch {
        }
        return { created, updated, skipped, failed, total: rows.length };
    }
};
exports.CommitImportHandler = CommitImportHandler;
exports.CommitImportHandler = CommitImportHandler = __decorate([
    (0, cqrs_1.CommandHandler)(commit_import_command_1.CommitImportCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        import_executor_service_1.ImportExecutorService,
        result_report_service_1.ResultReportService])
], CommitImportHandler);
//# sourceMappingURL=commit-import.handler.js.map