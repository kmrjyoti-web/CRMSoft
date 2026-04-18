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
exports.WorkflowAdminController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const update_workflow_dto_1 = require("./dto/update-workflow.dto");
const workflow_query_dto_1 = require("./dto/workflow-query.dto");
const create_workflow_command_1 = require("../application/commands/create-workflow/create-workflow.command");
const update_workflow_command_1 = require("../application/commands/update-workflow/update-workflow.command");
const publish_workflow_command_1 = require("../application/commands/publish-workflow/publish-workflow.command");
const clone_workflow_command_1 = require("../application/commands/clone-workflow/clone-workflow.command");
const validate_workflow_command_1 = require("../application/commands/validate-workflow/validate-workflow.command");
const get_workflow_list_query_1 = require("../application/queries/get-workflow-list/get-workflow-list.query");
const get_workflow_by_id_query_1 = require("../application/queries/get-workflow-by-id/get-workflow-by-id.query");
const get_workflow_visual_query_1 = require("../application/queries/get-workflow-visual/get-workflow-visual.query");
let WorkflowAdminController = class WorkflowAdminController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const workflow = await this.commandBus.execute(new create_workflow_command_1.CreateWorkflowCommand(dto.name, dto.code, dto.entityType, userId, dto.description, dto.isDefault, dto.configJson));
        return api_response_1.ApiResponse.success(workflow, 'Workflow created');
    }
    async findAll(q) {
        const result = await this.queryBus.execute(new get_workflow_list_query_1.GetWorkflowListQuery(q.page ?? 1, q.limit ?? 20, q.sortOrder ?? 'desc', q.search, q.entityType));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async findById(id) {
        const workflow = await this.queryBus.execute(new get_workflow_by_id_query_1.GetWorkflowByIdQuery(id));
        return api_response_1.ApiResponse.success(workflow);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_workflow_command_1.UpdateWorkflowCommand(id, dto));
        const workflow = await this.queryBus.execute(new get_workflow_by_id_query_1.GetWorkflowByIdQuery(id));
        return api_response_1.ApiResponse.success(workflow, 'Workflow updated');
    }
    async publish(id) {
        const result = await this.commandBus.execute(new publish_workflow_command_1.PublishWorkflowCommand(id));
        return api_response_1.ApiResponse.success(result, 'Workflow published');
    }
    async clone(id, userId) {
        const clone = await this.commandBus.execute(new clone_workflow_command_1.CloneWorkflowCommand(id, userId));
        return api_response_1.ApiResponse.success(clone, 'Workflow cloned');
    }
    async getVisual(id) {
        const visual = await this.queryBus.execute(new get_workflow_visual_query_1.GetWorkflowVisualQuery(id));
        return api_response_1.ApiResponse.success(visual);
    }
    async validate(id) {
        const result = await this.commandBus.execute(new validate_workflow_command_1.ValidateWorkflowCommand(id));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.WorkflowAdminController = WorkflowAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow definition' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List workflows (paginated)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workflow_query_dto_1.WorkflowQueryDto]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow details with states and transitions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update workflow definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workflow_dto_1.UpdateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish workflow (increment version, validate)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Clone workflow with all states and transitions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "clone", null);
__decorate([
    (0, common_1.Get)(':id/visual'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow diagram data (nodes + edges)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "getVisual", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate workflow structure' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowAdminController.prototype, "validate", null);
exports.WorkflowAdminController = WorkflowAdminController = __decorate([
    (0, swagger_1.ApiTags)('Workflows - Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WorkflowAdminController);
//# sourceMappingURL=workflow-admin.controller.js.map