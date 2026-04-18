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
exports.RawContactsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const create_raw_contact_command_1 = require("../application/commands/create-raw-contact/create-raw-contact.command");
const verify_raw_contact_command_1 = require("../application/commands/verify-raw-contact/verify-raw-contact.command");
const reject_raw_contact_command_1 = require("../application/commands/reject-raw-contact/reject-raw-contact.command");
const mark_duplicate_command_1 = require("../application/commands/mark-duplicate/mark-duplicate.command");
const reopen_raw_contact_command_1 = require("../application/commands/reopen-raw-contact/reopen-raw-contact.command");
const update_raw_contact_command_1 = require("../application/commands/update-raw-contact/update-raw-contact.command");
const deactivate_raw_contact_command_1 = require("../application/commands/deactivate-raw-contact/deactivate-raw-contact.command");
const reactivate_raw_contact_command_1 = require("../application/commands/reactivate-raw-contact/reactivate-raw-contact.command");
const soft_delete_raw_contact_command_1 = require("../application/commands/soft-delete-raw-contact/soft-delete-raw-contact.command");
const restore_raw_contact_command_1 = require("../application/commands/restore-raw-contact/restore-raw-contact.command");
const permanent_delete_raw_contact_command_1 = require("../application/commands/permanent-delete-raw-contact/permanent-delete-raw-contact.command");
const get_raw_contact_by_id_query_1 = require("../application/queries/get-raw-contact-by-id/get-raw-contact-by-id.query");
const get_raw_contacts_list_query_1 = require("../application/queries/get-raw-contacts-list/get-raw-contacts-list.query");
const create_raw_contact_dto_1 = require("./dto/create-raw-contact.dto");
const verify_raw_contact_dto_1 = require("./dto/verify-raw-contact.dto");
const reject_raw_contact_dto_1 = require("./dto/reject-raw-contact.dto");
const update_raw_contact_dto_1 = require("./dto/update-raw-contact.dto");
const raw_contact_query_dto_1 = require("./dto/raw-contact-query.dto");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const data_masking_interceptor_1 = require("../../../softwarevendor/table-config/data-masking.interceptor");
let RawContactsController = class RawContactsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const id = await this.commandBus.execute(new create_raw_contact_command_1.CreateRawContactCommand(dto.firstName, dto.lastName, userId, dto.source, dto.companyName, dto.designation, dto.department, dto.notes, dto.communications, dto.filterIds));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact created');
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new get_raw_contacts_list_query_1.GetRawContactsListQuery(query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc', query.search, query.isActive, query.status, query.source, query.companyName, query.firstName, query.lastName, query.createdAtFrom, query.createdAtTo));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async findById(id) {
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_raw_contact_command_1.UpdateRawContactCommand(id, dto));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact updated');
    }
    async verify(id, dto, userId) {
        const contactId = await this.commandBus.execute(new verify_raw_contact_command_1.VerifyRawContactCommand(id, userId, dto.organizationId, dto.contactOrgRelationType));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success({ ...rc, contactId }, 'Raw contact verified → Contact created');
    }
    async reject(id, dto) {
        await this.commandBus.execute(new reject_raw_contact_command_1.RejectRawContactCommand(id, dto.reason));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact rejected');
    }
    async markDuplicate(id) {
        await this.commandBus.execute(new mark_duplicate_command_1.MarkDuplicateCommand(id));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Marked as duplicate');
    }
    async reopen(id) {
        await this.commandBus.execute(new reopen_raw_contact_command_1.ReopenRawContactCommand(id));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact reopened');
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_raw_contact_command_1.DeactivateRawContactCommand(id));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact deactivated');
    }
    async reactivate(id) {
        await this.commandBus.execute(new reactivate_raw_contact_command_1.ReactivateRawContactCommand(id));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact reactivated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_raw_contact_command_1.SoftDeleteRawContactCommand(id, userId));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_raw_contact_command_1.RestoreRawContactCommand(id));
        const rc = await this.queryBus.execute(new get_raw_contact_by_id_query_1.GetRawContactByIdQuery(id));
        return api_response_1.ApiResponse.success(rc, 'Raw contact restored');
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_raw_contact_command_1.PermanentDeleteRawContactCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'Raw contact permanently deleted');
    }
};
exports.RawContactsController = RawContactsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new raw contact with communications' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_raw_contact_dto_1.CreateRawContactDto, String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor),
    (0, data_masking_interceptor_1.MaskTable)('raw-contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'List raw contacts (paginated, filtered)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [raw_contact_query_dto_1.RawContactQueryDto]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get raw contact by ID (with communications)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update raw contact (RAW status only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_raw_contact_dto_1.UpdateRawContactDto]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify RAW → creates Contact + updates Communications' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, verify_raw_contact_dto_1.VerifyRawContactDto, String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject raw contact' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_raw_contact_dto_1.RejectRawContactDto]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/mark-duplicate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark raw contact as duplicate' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "markDuplicate", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reopen rejected raw contact → back to RAW' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate raw contact (hide from default views)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate deactivated raw contact' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete raw contact (mark as deleted, recoverable)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted raw contact' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a soft-deleted raw contact (irreversible)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawContactsController.prototype, "permanentDelete", null);
exports.RawContactsController = RawContactsController = __decorate([
    (0, swagger_1.ApiTags)('Raw Contacts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('raw-contacts'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], RawContactsController);
//# sourceMappingURL=raw-contacts.controller.js.map