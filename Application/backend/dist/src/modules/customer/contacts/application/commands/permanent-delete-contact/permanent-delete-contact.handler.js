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
var PermanentDeleteContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentDeleteContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const permanent_delete_contact_command_1 = require("./permanent-delete-contact.command");
const contact_repository_interface_1 = require("../../../domain/interfaces/contact-repository.interface");
let PermanentDeleteContactHandler = PermanentDeleteContactHandler_1 = class PermanentDeleteContactHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(PermanentDeleteContactHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = await this.repo.findById(command.contactId);
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            if (!contact.isDeleted) {
                throw new common_1.BadRequestException('Contact must be soft-deleted before permanent deletion');
            }
            await this.repo.delete(command.contactId);
            this.logger.log(`Contact ${command.contactId} permanently deleted`);
        }
        catch (error) {
            this.logger.error(`PermanentDeleteContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PermanentDeleteContactHandler = PermanentDeleteContactHandler;
exports.PermanentDeleteContactHandler = PermanentDeleteContactHandler = PermanentDeleteContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(permanent_delete_contact_command_1.PermanentDeleteContactCommand),
    __param(0, (0, common_1.Inject)(contact_repository_interface_1.CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PermanentDeleteContactHandler);
//# sourceMappingURL=permanent-delete-contact.handler.js.map