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
exports.ContactOrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const link_contact_to_org_command_1 = require("../application/commands/link-contact-to-org/link-contact-to-org.command");
const unlink_contact_from_org_command_1 = require("../application/commands/unlink-contact-from-org/unlink-contact-from-org.command");
const set_primary_contact_command_1 = require("../application/commands/set-primary-contact/set-primary-contact.command");
const change_relation_type_command_1 = require("../application/commands/change-relation-type/change-relation-type.command");
const update_mapping_command_1 = require("../application/commands/update-mapping/update-mapping.command");
const get_by_id_query_1 = require("../application/queries/get-by-id/get-by-id.query");
const get_by_contact_query_1 = require("../application/queries/get-by-contact/get-by-contact.query");
const get_by_organization_query_1 = require("../application/queries/get-by-organization/get-by-organization.query");
const link_contact_to_org_dto_1 = require("./dto/link-contact-to-org.dto");
const change_relation_type_dto_1 = require("./dto/change-relation-type.dto");
const update_mapping_dto_1 = require("./dto/update-mapping.dto");
const api_response_1 = require("../../../../common/utils/api-response");
let ContactOrganizationsController = class ContactOrganizationsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async link(dto) {
        const id = await this.commandBus.execute(new link_contact_to_org_command_1.LinkContactToOrgCommand(dto.contactId, dto.organizationId, dto.relationType, dto.isPrimary, dto.designation, dto.department, dto.startDate ? new Date(dto.startDate) : undefined));
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping, 'Contact linked to organization');
    }
    async findById(id) {
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping);
    }
    async findByContact(contactId, activeOnly) {
        const orgs = await this.queryBus.execute(new get_by_contact_query_1.GetOrgsByContactQuery(contactId, activeOnly !== 'false'));
        return api_response_1.ApiResponse.success(orgs);
    }
    async findByOrg(orgId, activeOnly) {
        const contacts = await this.queryBus.execute(new get_by_organization_query_1.GetContactsByOrgQuery(orgId, activeOnly !== 'false'));
        return api_response_1.ApiResponse.success(contacts);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_mapping_command_1.UpdateMappingCommand(id, dto));
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping, 'Mapping updated');
    }
    async setPrimary(id) {
        await this.commandBus.execute(new set_primary_contact_command_1.SetPrimaryContactCommand(id));
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping, 'Set as primary contact');
    }
    async changeRelation(id, dto) {
        await this.commandBus.execute(new change_relation_type_command_1.ChangeRelationTypeCommand(id, dto.relationType));
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping, `Relation changed to ${dto.relationType}`);
    }
    async unlink(id) {
        await this.commandBus.execute(new unlink_contact_from_org_command_1.UnlinkContactFromOrgCommand(id));
        const mapping = await this.queryBus.execute(new get_by_id_query_1.GetContactOrgByIdQuery(id));
        return api_response_1.ApiResponse.success(mapping, 'Contact unlinked from organization');
    }
};
exports.ContactOrganizationsController = ContactOrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Link contact to organization' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [link_contact_to_org_dto_1.LinkContactToOrgDto]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "link", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mapping by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by-contact/:contactId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all organizations for a contact' }),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "findByContact", null);
__decorate([
    (0, common_1.Get)('by-org/:organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all contacts for an organization (with primary comms)' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "findByOrg", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update mapping (designation/department)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_mapping_dto_1.UpdateMappingDto]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/set-primary'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set contact as primary for the organization' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "setPrimary", null);
__decorate([
    (0, common_1.Post)(':id/change-relation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change relation type (EMPLOYEE → DIRECTOR, etc.)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_relation_type_dto_1.ChangeRelationTypeDto]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "changeRelation", null);
__decorate([
    (0, common_1.Post)(':id/unlink'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink contact from organization (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactOrganizationsController.prototype, "unlink", null);
exports.ContactOrganizationsController = ContactOrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('Contact Organizations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contact-organizations'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ContactOrganizationsController);
//# sourceMappingURL=contact-organizations.controller.js.map