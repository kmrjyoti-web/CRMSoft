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
var PermanentDeleteRawContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentDeleteRawContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const permanent_delete_raw_contact_command_1 = require("./permanent-delete-raw-contact.command");
const raw_contact_repository_interface_1 = require("../../../domain/interfaces/raw-contact-repository.interface");
let PermanentDeleteRawContactHandler = PermanentDeleteRawContactHandler_1 = class PermanentDeleteRawContactHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(PermanentDeleteRawContactHandler_1.name);
    }
    async execute(command) {
        try {
            const rawContact = await this.repo.findById(command.rawContactId);
            if (!rawContact)
                throw new common_1.NotFoundException(`RawContact ${command.rawContactId} not found`);
            if (!rawContact.isDeleted) {
                throw new common_1.BadRequestException('RawContact must be soft-deleted before permanent deletion');
            }
            await this.repo.delete(command.rawContactId);
            this.logger.log(`RawContact ${command.rawContactId} permanently deleted`);
        }
        catch (error) {
            this.logger.error(`PermanentDeleteRawContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PermanentDeleteRawContactHandler = PermanentDeleteRawContactHandler;
exports.PermanentDeleteRawContactHandler = PermanentDeleteRawContactHandler = PermanentDeleteRawContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(permanent_delete_raw_contact_command_1.PermanentDeleteRawContactCommand),
    __param(0, (0, common_1.Inject)(raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PermanentDeleteRawContactHandler);
//# sourceMappingURL=permanent-delete-raw-contact.handler.js.map