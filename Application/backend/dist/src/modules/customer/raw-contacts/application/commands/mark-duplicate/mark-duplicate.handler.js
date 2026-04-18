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
var MarkDuplicateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkDuplicateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_duplicate_command_1 = require("./mark-duplicate.command");
const raw_contact_repository_interface_1 = require("../../../domain/interfaces/raw-contact-repository.interface");
let MarkDuplicateHandler = MarkDuplicateHandler_1 = class MarkDuplicateHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(MarkDuplicateHandler_1.name);
    }
    async execute(command) {
        try {
            const rawContact = await this.repo.findById(command.rawContactId);
            if (!rawContact)
                throw new common_1.NotFoundException(`RawContact ${command.rawContactId} not found`);
            const withEvents = this.publisher.mergeObjectContext(rawContact);
            withEvents.markDuplicate();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`RawContact ${rawContact.id} marked duplicate`);
        }
        catch (error) {
            this.logger.error(`MarkDuplicateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MarkDuplicateHandler = MarkDuplicateHandler;
exports.MarkDuplicateHandler = MarkDuplicateHandler = MarkDuplicateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(mark_duplicate_command_1.MarkDuplicateCommand),
    __param(0, (0, common_1.Inject)(raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], MarkDuplicateHandler);
//# sourceMappingURL=mark-duplicate.handler.js.map