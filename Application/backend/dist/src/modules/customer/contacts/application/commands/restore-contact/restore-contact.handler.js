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
var RestoreContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const restore_contact_command_1 = require("./restore-contact.command");
const contact_repository_interface_1 = require("../../../domain/interfaces/contact-repository.interface");
let RestoreContactHandler = RestoreContactHandler_1 = class RestoreContactHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(RestoreContactHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = await this.repo.findById(command.contactId);
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            const withEvents = this.publisher.mergeObjectContext(contact);
            withEvents.restore();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Contact ${contact.id} restored`);
        }
        catch (error) {
            this.logger.error(`RestoreContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RestoreContactHandler = RestoreContactHandler;
exports.RestoreContactHandler = RestoreContactHandler = RestoreContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(restore_contact_command_1.RestoreContactCommand),
    __param(0, (0, common_1.Inject)(contact_repository_interface_1.CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], RestoreContactHandler);
//# sourceMappingURL=restore-contact.handler.js.map