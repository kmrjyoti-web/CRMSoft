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
exports.WhatsAppTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_template_command_1 = require("../application/commands/create-template/create-template.command");
const update_template_command_1 = require("../application/commands/update-template/update-template.command");
const delete_template_command_1 = require("../application/commands/delete-template/delete-template.command");
const sync_templates_command_1 = require("../application/commands/sync-templates/sync-templates.command");
const query_1 = require("../application/queries/get-templates/query");
const query_2 = require("../application/queries/get-template-detail/query");
const template_dto_1 = require("./dto/template.dto");
let WhatsAppTemplatesController = class WhatsAppTemplatesController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto) {
        const result = await this.commandBus.execute(new create_template_command_1.CreateTemplateCommand(dto.wabaId, dto.name, dto.language || 'en', dto.category, dto.headerType, dto.headerContent, dto.bodyText, dto.footerText, dto.buttons, dto.variables, dto.sampleValues));
        return api_response_1.ApiResponse.success(result, 'Template created');
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_template_command_1.UpdateTemplateCommand(id, dto.name, dto.bodyText, dto.footerText, dto.buttons));
        return api_response_1.ApiResponse.success(result, 'Template updated');
    }
    async delete(id) {
        await this.commandBus.execute(new delete_template_command_1.DeleteTemplateCommand(id));
        return api_response_1.ApiResponse.success(null, 'Template deleted');
    }
    async list(dto) {
        const result = await this.queryBus.execute(new query_1.GetTemplatesQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status, dto.category));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async detail(id) {
        const result = await this.queryBus.execute(new query_2.GetTemplateDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async sync(wabaId) {
        const result = await this.commandBus.execute(new sync_templates_command_1.SyncTemplatesCommand(wabaId));
        return api_response_1.ApiResponse.success(result, 'Templates synced from Meta');
    }
};
exports.WhatsAppTemplatesController = WhatsAppTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.TemplateQueryDto]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)('wabaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppTemplatesController.prototype, "sync", null);
exports.WhatsAppTemplatesController = WhatsAppTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp/templates'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WhatsAppTemplatesController);
//# sourceMappingURL=whatsapp-templates.controller.js.map