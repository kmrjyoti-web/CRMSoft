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
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const add_communication_command_1 = require("../application/commands/add-communication/add-communication.command");
const update_communication_command_1 = require("../application/commands/update-communication/update-communication.command");
const delete_communication_command_1 = require("../application/commands/delete-communication/delete-communication.command");
const set_primary_command_1 = require("../application/commands/set-primary/set-primary.command");
const mark_verified_command_1 = require("../application/commands/mark-verified/mark-verified.command");
const link_to_entity_command_1 = require("../application/commands/link-to-entity/link-to-entity.command");
const get_communication_by_id_query_1 = require("../application/queries/get-communication-by-id/get-communication-by-id.query");
const get_communications_by_entity_query_1 = require("../application/queries/get-communications-by-entity/get-communications-by-entity.query");
const add_communication_dto_1 = require("./dto/add-communication.dto");
const update_communication_dto_1 = require("./dto/update-communication.dto");
const link_to_entity_dto_1 = require("./dto/link-to-entity.dto");
const communications_query_dto_1 = require("./dto/communications-query.dto");
const api_response_1 = require("../../../../common/utils/api-response");
let CommunicationsController = class CommunicationsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async add(dto) {
        const id = await this.commandBus.execute(new add_communication_command_1.AddCommunicationCommand(dto.type, dto.value, dto.priorityType, dto.isPrimary, dto.label, dto.rawContactId, dto.contactId, dto.organizationId, dto.leadId));
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm, 'Communication added');
    }
    async findByEntity(query) {
        const comms = await this.queryBus.execute(new get_communications_by_entity_query_1.GetCommunicationsByEntityQuery(query.entityType, query.entityId, query.type));
        return api_response_1.ApiResponse.success(comms);
    }
    async findById(id) {
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_communication_command_1.UpdateCommunicationCommand(id, dto));
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm, 'Communication updated');
    }
    async remove(id) {
        await this.commandBus.execute(new delete_communication_command_1.DeleteCommunicationCommand(id));
        return api_response_1.ApiResponse.success(null, 'Communication deleted');
    }
    async setPrimary(id) {
        await this.commandBus.execute(new set_primary_command_1.SetPrimaryCommunicationCommand(id));
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm, 'Set as primary');
    }
    async markVerified(id) {
        await this.commandBus.execute(new mark_verified_command_1.MarkVerifiedCommand(id));
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm, 'Communication verified');
    }
    async linkToEntity(id, dto) {
        await this.commandBus.execute(new link_to_entity_command_1.LinkToEntityCommand(id, dto.entityType, dto.entityId));
        const comm = await this.queryBus.execute(new get_communication_by_id_query_1.GetCommunicationByIdQuery(id));
        return api_response_1.ApiResponse.success(comm, `Linked to ${dto.entityType}`);
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add communication (phone/email/etc.) to an entity' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_communication_dto_1.AddCommunicationDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "add", null);
__decorate([
    (0, common_1.Get)('by-entity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all communications for an entity (contact/rawContact/org/lead)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [communications_query_dto_1.CommunicationsByEntityDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get communication by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update communication value/priority/label' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_communication_dto_1.UpdateCommunicationDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete communication' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/set-primary'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set as primary (unsets other primary of same type)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "setPrimary", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark communication as verified (OTP/email confirmed)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "markVerified", null);
__decorate([
    (0, common_1.Post)(':id/link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link communication to an additional entity' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_to_entity_dto_1.LinkToEntityDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "linkToEntity", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, swagger_1.ApiTags)('Communications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map