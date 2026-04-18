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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const create_lead_command_1 = require("../application/commands/create-lead/create-lead.command");
const quick_create_lead_command_1 = require("../application/commands/quick-create-lead/quick-create-lead.command");
const allocate_lead_command_1 = require("../application/commands/allocate-lead/allocate-lead.command");
const change_lead_status_command_1 = require("../application/commands/change-lead-status/change-lead-status.command");
const update_lead_command_1 = require("../application/commands/update-lead/update-lead.command");
const get_lead_by_id_query_1 = require("../application/queries/get-lead-by-id/get-lead-by-id.query");
const get_leads_list_query_1 = require("../application/queries/get-leads-list/get-leads-list.query");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const quick_create_lead_dto_1 = require("./dto/quick-create-lead.dto");
const allocate_lead_dto_1 = require("./dto/allocate-lead.dto");
const change_lead_status_dto_1 = require("./dto/change-lead-status.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const lead_query_dto_1 = require("./dto/lead-query.dto");
const deactivate_lead_command_1 = require("../application/commands/deactivate-lead/deactivate-lead.command");
const reactivate_lead_command_1 = require("../application/commands/reactivate-lead/reactivate-lead.command");
const soft_delete_lead_command_1 = require("../application/commands/soft-delete-lead/soft-delete-lead.command");
const restore_lead_command_1 = require("../application/commands/restore-lead/restore-lead.command");
const permanent_delete_lead_command_1 = require("../application/commands/permanent-delete-lead/permanent-delete-lead.command");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const data_masking_interceptor_1 = require("../../../softwarevendor/table-config/data-masking.interceptor");
const workflow_engine_service_1 = require("../../../../core/workflow/workflow-engine.service");
let LeadsController = class LeadsController {
    constructor(commandBus, queryBus, workflowEngine) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.workflowEngine = workflowEngine;
    }
    async quickCreate(dto, userId) {
        const result = await this.commandBus.execute(new quick_create_lead_command_1.QuickCreateLeadCommand(userId, dto.contactId, dto.inlineContact, dto.organizationId, dto.inlineOrganization, dto.priority, dto.expectedValue, dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined, dto.notes, dto.filterIds));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(result.leadId));
        return api_response_1.ApiResponse.success({ ...lead, rawContactId: result.rawContactId }, 'Lead created');
    }
    async create(dto, userId) {
        const id = await this.commandBus.execute(new create_lead_command_1.CreateLeadCommand(dto.contactId, userId, dto.organizationId, dto.priority, dto.expectedValue, dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined, dto.notes, dto.filterIds));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead created');
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new get_leads_list_query_1.GetLeadsListQuery(query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc', query.search, query.isActive, query.status, query.priority, query.allocatedToId, query.contactId, query.organizationId));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async findById(id) {
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_lead_command_1.UpdateLeadCommand(id, {
            priority: dto.priority,
            expectedValue: dto.expectedValue,
            expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
            notes: dto.notes,
        }, dto.filterIds));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead updated');
    }
    async allocate(id, dto) {
        await this.commandBus.execute(new allocate_lead_command_1.AllocateLeadCommand(id, dto.allocatedToId));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead allocated');
    }
    async changeStatus(id, dto) {
        await this.commandBus.execute(new change_lead_status_command_1.ChangeLeadStatusCommand(id, dto.status, dto.reason));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, `Status changed to ${dto.status}`);
    }
    async getTransitions(id) {
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success({
            currentStatus: lead.status,
            validNextStatuses: lead.validNextStatuses,
            isTerminal: lead.isTerminal,
        });
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_lead_command_1.DeactivateLeadCommand(id));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead deactivated');
    }
    async reactivate(id) {
        await this.commandBus.execute(new reactivate_lead_command_1.ReactivateLeadCommand(id));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead reactivated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_lead_command_1.SoftDeleteLeadCommand(id, userId));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_lead_command_1.RestoreLeadCommand(id));
        const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
        return api_response_1.ApiResponse.success(lead, 'Lead restored');
    }
    async getWorkflowStatus(id, userId) {
        let status = await this.workflowEngine.getEntityStatus('LEAD', id);
        if (!status) {
            const lead = await this.queryBus.execute(new get_lead_by_id_query_1.GetLeadByIdQuery(id));
            if (!lead)
                return api_response_1.ApiResponse.success(null);
            try {
                const instance = await this.workflowEngine.initializeWorkflow('LEAD', id, userId);
                if (lead.status !== 'NEW') {
                    await this.workflowEngine.fastForwardToState(instance.id, lead.status, userId);
                }
                status = await this.workflowEngine.getEntityStatus('LEAD', id);
            }
            catch {
                return api_response_1.ApiResponse.success(null);
            }
        }
        return api_response_1.ApiResponse.success(status);
    }
    async getWorkflowTransitions(id, userId) {
        const status = await this.workflowEngine.getEntityStatus('LEAD', id);
        if (!status)
            return api_response_1.ApiResponse.success([]);
        const transitions = await this.workflowEngine.getAvailableTransitions(status.instanceId, userId);
        return api_response_1.ApiResponse.success(transitions);
    }
    async executeWorkflowTransition(id, body, userId) {
        const status = await this.workflowEngine.getEntityStatus('LEAD', id);
        if (!status)
            return api_response_1.ApiResponse.success(null, 'No workflow instance found');
        const result = await this.workflowEngine.executeTransition(status.instanceId, body.transitionCode, userId, body.comment);
        return api_response_1.ApiResponse.success(result, 'Transition executed');
    }
    async getWorkflowHistory(id) {
        const status = await this.workflowEngine.getEntityStatus('LEAD', id);
        if (!status)
            return api_response_1.ApiResponse.success([]);
        const history = await this.workflowEngine.getInstanceHistory(status.instanceId);
        return api_response_1.ApiResponse.success(history);
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_lead_command_1.PermanentDeleteLeadCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'Lead permanently deleted');
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)('quick-create'),
    (0, swagger_1.ApiOperation)({ summary: 'Quick-create lead with inline contact/organization (single atomic request)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quick_create_lead_dto_1.QuickCreateLeadDto, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "quickCreate", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new lead for a verified contact' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor),
    (0, data_masking_interceptor_1.MaskTable)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'List leads (paginated, filtered by status/priority/owner/contact/org)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lead_query_dto_1.LeadQueryDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead by ID (contact, org, activities, demos, quotations, filters)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lead details (non-terminal only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/allocate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Allocate lead to sales executive (NEW/VERIFIED only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, allocate_lead_dto_1.AllocateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "allocate", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change lead status (state machine validated)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_lead_status_dto_1.ChangeLeadStatusDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id/transitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get valid next statuses for a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getTransitions", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate lead (hide from default views)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate deactivated lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete lead (mark as deleted, recoverable)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)(':id/workflow-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow status for a lead (lazy-initializes if missing)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getWorkflowStatus", null);
__decorate([
    (0, common_1.Get)(':id/workflow-transitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available workflow transitions for a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getWorkflowTransitions", null);
__decorate([
    (0, common_1.Post)(':id/workflow-transition'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a workflow transition on a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "executeWorkflowTransition", null);
__decorate([
    (0, common_1.Get)(':id/workflow-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow transition history for a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getWorkflowHistory", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a soft-deleted lead (irreversible)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "permanentDelete", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('Leads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        workflow_engine_service_1.WorkflowEngineService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map