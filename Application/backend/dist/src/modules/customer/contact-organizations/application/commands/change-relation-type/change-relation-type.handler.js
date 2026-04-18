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
var ChangeRelationTypeHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRelationTypeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const change_relation_type_command_1 = require("./change-relation-type.command");
const contact_org_repository_interface_1 = require("../../../domain/interfaces/contact-org-repository.interface");
let ChangeRelationTypeHandler = ChangeRelationTypeHandler_1 = class ChangeRelationTypeHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(ChangeRelationTypeHandler_1.name);
    }
    async execute(command) {
        try {
            const mapping = await this.repo.findById(command.mappingId);
            if (!mapping)
                throw new common_1.NotFoundException(`Mapping ${command.mappingId} not found`);
            if (!mapping.isActive)
                throw new Error('Cannot change relation on deactivated mapping');
            const withEvents = this.publisher.mergeObjectContext(mapping);
            withEvents.changeRelationType(command.relationType);
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Mapping ${command.mappingId} relation → ${command.relationType}`);
        }
        catch (error) {
            this.logger.error(`ChangeRelationTypeHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChangeRelationTypeHandler = ChangeRelationTypeHandler;
exports.ChangeRelationTypeHandler = ChangeRelationTypeHandler = ChangeRelationTypeHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(change_relation_type_command_1.ChangeRelationTypeCommand),
    __param(0, (0, common_1.Inject)(contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], ChangeRelationTypeHandler);
//# sourceMappingURL=change-relation-type.handler.js.map