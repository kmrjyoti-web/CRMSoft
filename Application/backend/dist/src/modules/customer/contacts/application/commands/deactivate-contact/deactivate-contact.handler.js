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
var DeactivateContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_contact_command_1 = require("./deactivate-contact.command");
const contact_repository_interface_1 = require("../../../domain/interfaces/contact-repository.interface");
let DeactivateContactHandler = DeactivateContactHandler_1 = class DeactivateContactHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(DeactivateContactHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = await this.repo.findById(command.contactId);
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            const withEvents = this.publisher.mergeObjectContext(contact);
            withEvents.deactivate();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Contact ${contact.id} deactivated`);
        }
        catch (error) {
            this.logger.error(`DeactivateContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivateContactHandler = DeactivateContactHandler;
exports.DeactivateContactHandler = DeactivateContactHandler = DeactivateContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_contact_command_1.DeactivateContactCommand),
    __param(0, (0, common_1.Inject)(contact_repository_interface_1.CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], DeactivateContactHandler);
//# sourceMappingURL=deactivate-contact.handler.js.map