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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const audit_skip_decorator_1 = require("../../../core/identity/audit/decorators/audit-skip.decorator");
const upload_file_command_1 = require("../application/commands/upload-file/upload-file.command");
const select_profile_command_1 = require("../application/commands/select-profile/select-profile.command");
const apply_mapping_command_1 = require("../application/commands/apply-mapping/apply-mapping.command");
const save_profile_command_1 = require("../application/commands/save-profile/save-profile.command");
const validate_rows_command_1 = require("../application/commands/validate-rows/validate-rows.command");
const commit_import_command_1 = require("../application/commands/commit-import/commit-import.command");
const cancel_import_command_1 = require("../application/commands/cancel-import/cancel-import.command");
const row_action_command_1 = require("../application/commands/row-action/row-action.command");
const row_bulk_action_command_1 = require("../application/commands/row-bulk-action/row-bulk-action.command");
const edit_row_command_1 = require("../application/commands/edit-row/edit-row.command");
const revalidate_row_command_1 = require("../application/commands/revalidate-row/revalidate-row.command");
const get_job_list_query_1 = require("../application/queries/get-job-list/get-job-list.query");
const get_job_detail_query_1 = require("../application/queries/get-job-detail/get-job-detail.query");
const get_validation_summary_query_1 = require("../application/queries/get-validation-summary/get-validation-summary.query");
const get_duplicates_query_1 = require("../application/queries/get-duplicates/get-duplicates.query");
const get_job_result_query_1 = require("../application/queries/get-job-result/get-job-result.query");
const get_job_rows_query_1 = require("../application/queries/get-job-rows/get-job-rows.query");
const get_row_detail_query_1 = require("../application/queries/get-row-detail/get-row-detail.query");
const get_mapping_suggestions_query_1 = require("../application/queries/get-mapping-suggestions/get-mapping-suggestions.query");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const mapping_dto_1 = require("./dto/mapping.dto");
const row_action_dto_1 = require("./dto/row-action.dto");
const result_report_service_1 = require("../services/result-report.service");
let ImportController = class ImportController {
    constructor(commandBus, queryBus, reportService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.reportService = reportService;
    }
    async upload(file, dto, user) {
        const result = await this.commandBus.execute(new upload_file_command_1.UploadFileCommand(file.originalname, file.mimetype, file.size, file.buffer, dto.targetEntity, user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim()));
        return api_response_1.ApiResponse.success(result, 'File uploaded and parsed');
    }
    async selectProfile(jobId, dto) {
        const result = await this.commandBus.execute(new select_profile_command_1.SelectProfileCommand(jobId, dto.profileId));
        return api_response_1.ApiResponse.success(result);
    }
    async applyMapping(jobId, dto) {
        const result = await this.commandBus.execute(new apply_mapping_command_1.ApplyMappingCommand(jobId, dto.fieldMapping, dto.validationRules, dto.duplicateCheckFields, dto.duplicateStrategy, dto.fuzzyMatchEnabled, dto.fuzzyMatchFields, dto.fuzzyThreshold, dto.defaultValues));
        return api_response_1.ApiResponse.success(result, 'Mapping applied');
    }
    async saveProfile(jobId, dto) {
        const result = await this.commandBus.execute(new save_profile_command_1.SaveProfileCommand(jobId, dto.name, dto.description, dto.sourceSystem));
        return api_response_1.ApiResponse.success(result, 'Profile saved');
    }
    async validate(jobId) {
        this.commandBus.execute(new validate_rows_command_1.ValidateRowsCommand(jobId)).catch(() => { });
        return api_response_1.ApiResponse.success({ jobId, status: 'VALIDATING' }, 'Validation started');
    }
    async getStatus(jobId) {
        const job = await this.queryBus.execute(new get_job_detail_query_1.GetJobDetailQuery(jobId));
        return api_response_1.ApiResponse.success({
            jobId: job.id,
            status: job.status,
            totalRows: job.totalRows,
            validRows: job.validRows,
            invalidRows: job.invalidRows,
            importedCount: job.importedCount,
            skippedRows: job.skippedRows,
            failedCount: job.failedCount,
            duplicateExactRows: job.duplicateExactRows,
            duplicateInFileRows: job.duplicateInFileRows,
        });
    }
    async commit(jobId, userId) {
        this.commandBus.execute(new commit_import_command_1.CommitImportCommand(jobId, userId)).catch(async (err) => {
            console.error(`[Import] Job ${jobId} failed:`, err.message);
            try {
                const { PrismaClient } = require('@prisma/working-client');
                const prisma = new PrismaClient();
                await prisma.importJob.update({
                    where: { id: jobId },
                    data: { status: 'FAILED' },
                });
                await prisma.$disconnect();
            }
            catch { }
        });
        return api_response_1.ApiResponse.success({ jobId, status: 'IMPORTING' }, 'Import started');
    }
    async cancel(jobId) {
        const result = await this.commandBus.execute(new cancel_import_command_1.CancelImportCommand(jobId));
        return api_response_1.ApiResponse.success(result, 'Import cancelled');
    }
    async listJobs(query) {
        const result = await this.queryBus.execute(new get_job_list_query_1.GetJobListQuery(query.userId, query.status, +query.page, +query.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getJob(jobId) {
        const result = await this.queryBus.execute(new get_job_detail_query_1.GetJobDetailQuery(jobId));
        return api_response_1.ApiResponse.success(result);
    }
    async validationSummary(jobId) {
        const result = await this.queryBus.execute(new get_validation_summary_query_1.GetValidationSummaryQuery(jobId));
        return api_response_1.ApiResponse.success(result);
    }
    async duplicates(jobId, q) {
        const result = await this.queryBus.execute(new get_duplicates_query_1.GetDuplicatesQuery(jobId, +q.page, +q.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async result(jobId) {
        const result = await this.queryBus.execute(new get_job_result_query_1.GetJobResultQuery(jobId));
        return api_response_1.ApiResponse.success(result);
    }
    async downloadReport(jobId, type) {
        const summary = await this.reportService.getResultSummary(jobId);
        const url = type === 'failed' ? summary.failedReportUrl : summary.reportUrl;
        return api_response_1.ApiResponse.success({ downloadUrl: url });
    }
    async getRows(jobId, q) {
        const result = await this.queryBus.execute(new get_job_rows_query_1.GetJobRowsQuery(jobId, q.status, +q.page, +q.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getRow(jobId, rowId) {
        const result = await this.queryBus.execute(new get_row_detail_query_1.GetRowDetailQuery(jobId, rowId));
        return api_response_1.ApiResponse.success(result);
    }
    async editRow(jobId, rowId, dto) {
        const result = await this.commandBus.execute(new edit_row_command_1.EditRowCommand(jobId, rowId, dto.editedData));
        return api_response_1.ApiResponse.success(result, 'Row updated');
    }
    async rowAction(jobId, rowId, dto) {
        const result = await this.commandBus.execute(new row_action_command_1.RowActionCommand(jobId, rowId, dto.action));
        return api_response_1.ApiResponse.success(result);
    }
    async revalidateRow(jobId, rowId) {
        const result = await this.commandBus.execute(new revalidate_row_command_1.RevalidateRowCommand(jobId, rowId));
        return api_response_1.ApiResponse.success(result);
    }
    async bulkAction(jobId, dto) {
        const result = await this.commandBus.execute(new row_bulk_action_command_1.RowBulkActionCommand(jobId, dto.action));
        return api_response_1.ApiResponse.success(result);
    }
    async mappingSuggestions(entity, headers) {
        const fileHeaders = headers ? headers.split(',').map((h) => h.trim()).filter(Boolean) : undefined;
        const result = await this.queryBus.execute(new get_mapping_suggestions_query_1.GetMappingSuggestionsQuery(entity, fileHeaders));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)(':jobId/select-profile'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upload_file_dto_1.SelectProfileDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "selectProfile", null);
__decorate([
    (0, common_1.Post)(':jobId/mapping'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mapping_dto_1.ApplyMappingDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "applyMapping", null);
__decorate([
    (0, common_1.Post)(':jobId/save-profile'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upload_file_dto_1.SaveProfileDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "saveProfile", null);
__decorate([
    (0, common_1.Post)(':jobId/validate'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    (0, common_1.HttpCode)(202),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)(':jobId/status'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(':jobId/commit'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    (0, common_1.HttpCode)(202),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "commit", null);
__decorate([
    (0, common_1.Post)(':jobId/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Get)(':jobId'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "getJob", null);
__decorate([
    (0, common_1.Get)(':jobId/validation-summary'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "validationSummary", null);
__decorate([
    (0, common_1.Get)(':jobId/duplicates'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "duplicates", null);
__decorate([
    (0, common_1.Get)(':jobId/result'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "result", null);
__decorate([
    (0, common_1.Get)(':jobId/result/download'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "downloadReport", null);
__decorate([
    (0, common_1.Get)(':jobId/rows'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "getRows", null);
__decorate([
    (0, common_1.Get)(':jobId/rows/:rowId'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Param)('rowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "getRow", null);
__decorate([
    (0, common_1.Put)(':jobId/rows/:rowId'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, row_action_dto_1.EditRowDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "editRow", null);
__decorate([
    (0, common_1.Post)(':jobId/rows/:rowId/action'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, row_action_dto_1.RowActionDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "rowAction", null);
__decorate([
    (0, common_1.Post)(':jobId/rows/:rowId/revalidate'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Param)('rowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "revalidateRow", null);
__decorate([
    (0, common_1.Post)(':jobId/rows/bulk-action'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, row_action_dto_1.RowBulkActionDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "bulkAction", null);
__decorate([
    (0, common_1.Get)('mapping-suggestions/:targetEntity'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('targetEntity')),
    __param(1, (0, common_1.Query)('headers')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "mappingSuggestions", null);
exports.ImportController = ImportController = __decorate([
    (0, common_1.Controller)('import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, audit_skip_decorator_1.AuditSkip)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        result_report_service_1.ResultReportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map