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
var UnlinkContactFromOrgHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnlinkContactFromOrgHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const unlink_contact_from_org_command_1 = require("./unlink-contact-from-org.command");
const contact_org_repository_interface_1 = require("../../../domain/interfaces/contact-org-repository.interface");
let UnlinkContactFromOrgHandler = UnlinkContactFromOrgHandler_1 = class UnlinkContactFromOrgHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(UnlinkContactFromOrgHandler_1.name);
    }
    async execute(command) {
        try {
            const mapping = await this.repo.findById(command.mappingId);
            if (!mapping)
                throw new common_1.NotFoundException(`Mapping ${command.mappingId} not found`);
            if (!mapping.isActive) {
                throw new Error('Mapping is already deactivated');
            }
            const withEvents = this.publisher.mergeObjectContext(mapping);
            withEvents.deactivate();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Unlinked: Contact ${mapping.contactId} from Org ${mapping.organizationId}`);
        }
        catch (error) {
            this.logger.error(`UnlinkContactFromOrgHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UnlinkContactFromOrgHandler = UnlinkContactFromOrgHandler;
exports.UnlinkContactFromOrgHandler = UnlinkContactFromOrgHandler = UnlinkContactFromOrgHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(unlink_contact_from_org_command_1.UnlinkContactFromOrgCommand),
    __param(0, (0, common_1.Inject)(contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], UnlinkContactFromOrgHandler);
//# sourceMappingURL=unlink-contact-from-org.handler.js.map