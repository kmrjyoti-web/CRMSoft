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
var DeactivateRawContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateRawContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_raw_contact_command_1 = require("./deactivate-raw-contact.command");
const raw_contact_repository_interface_1 = require("../../../domain/interfaces/raw-contact-repository.interface");
let DeactivateRawContactHandler = DeactivateRawContactHandler_1 = class DeactivateRawContactHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(DeactivateRawContactHandler_1.name);
    }
    async execute(command) {
        try {
            const rawContact = await this.repo.findById(command.rawContactId);
            if (!rawContact)
                throw new common_1.NotFoundException(`RawContact ${command.rawContactId} not found`);
            const withEvents = this.publisher.mergeObjectContext(rawContact);
            withEvents.deactivate();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`RawContact ${rawContact.id} deactivated`);
        }
        catch (error) {
            this.logger.error(`DeactivateRawContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivateRawContactHandler = DeactivateRawContactHandler;
exports.DeactivateRawContactHandler = DeactivateRawContactHandler = DeactivateRawContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_raw_contact_command_1.DeactivateRawContactCommand),
    __param(0, (0, common_1.Inject)(raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], DeactivateRawContactHandler);
//# sourceMappingURL=deactivate-raw-contact.handler.js.map