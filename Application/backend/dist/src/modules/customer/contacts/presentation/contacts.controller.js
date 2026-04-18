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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const create_contact_command_1 = require("../application/commands/create-contact/create-contact.command");
const update_contact_command_1 = require("../application/commands/update-contact/update-contact.command");
const deactivate_contact_command_1 = require("../application/commands/deactivate-contact/deactivate-contact.command");
const reactivate_contact_command_1 = require("../application/commands/reactivate-contact/reactivate-contact.command");
const soft_delete_contact_command_1 = require("../application/commands/soft-delete-contact/soft-delete-contact.command");
const restore_contact_command_1 = require("../application/commands/restore-contact/restore-contact.command");
const permanent_delete_contact_command_1 = require("../application/commands/permanent-delete-contact/permanent-delete-contact.command");
const get_contact_by_id_query_1 = require("../application/queries/get-contact-by-id/get-contact-by-id.query");
const get_contacts_list_query_1 = require("../application/queries/get-contacts-list/get-contacts-list.query");
const get_contacts_dashboard_query_1 = require("../application/queries/get-contacts-dashboard/get-contacts-dashboard.query");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const update_contact_dto_1 = require("./dto/update-contact.dto");
const contact_query_dto_1 = require("./dto/contact-query.dto");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const data_masking_interceptor_1 = require("../../../softwarevendor/table-config/data-masking.interceptor");
let ContactsController = class ContactsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const id = await this.commandBus.execute(new create_contact_command_1.CreateContactCommand(dto.firstName, dto.lastName, userId, dto.designation, dto.department, dto.notes, dto.communications, dto.organizationId, dto.orgRelationType, dto.filterIds));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact created');
    }
    async getDashboard(tenantId, dateFrom, dateTo) {
        const result = await this.queryBus.execute(new get_contacts_dashboard_query_1.GetContactsDashboardQuery(tenantId, dateFrom, dateTo));
        return api_response_1.ApiResponse.success(result);
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new get_contacts_list_query_1.GetContactsListQuery(query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc', query.search, query.isActive, query.designation, query.department, query.organizationId));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async findById(id) {
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact);
    }
    async update(id, dto, userId) {
        await this.commandBus.execute(new update_contact_command_1.UpdateContactCommand(id, userId, dto, dto.filterIds, dto.communications, dto.organizationId));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact updated');
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_contact_command_1.DeactivateContactCommand(id));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact deactivated');
    }
    async reactivate(id) {
        await this.commandBus.execute(new reactivate_contact_command_1.ReactivateContactCommand(id));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact reactivated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_contact_command_1.SoftDeleteContactCommand(id, userId));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_contact_command_1.RestoreContactCommand(id));
        const contact = await this.queryBus.execute(new get_contact_by_id_query_1.GetContactByIdQuery(id));
        return api_response_1.ApiResponse.success(contact, 'Contact restored');
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_contact_command_1.PermanentDeleteContactCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'Contact permanently deleted');
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create verified contact directly (with comms + org link)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_dto_1.CreateContactDto, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'CRM dashboard stats, charts, and recent contacts' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor),
    (0, data_masking_interceptor_1.MaskTable)('contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'List contacts (paginated, search across name/phone/email/org)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_query_dto_1.ContactQueryDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact by ID (with comms, orgs, leads, filters, raw contacts)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update contact (active only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contact_dto_1.UpdateContactDto, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate contact (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate deactivated contact' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete contact (mark as deleted, recoverable)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted contact' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a soft-deleted contact (irreversible)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "permanentDelete", null);
exports.ContactsController = ContactsController = __decorate([
    (0, swagger_1.ApiTags)('Contacts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map