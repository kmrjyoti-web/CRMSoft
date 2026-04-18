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
var DeleteProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const delete_profile_command_1 = require("./delete-profile.command");
let DeleteProfileHandler = DeleteProfileHandler_1 = class DeleteProfileHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.importProfile.update({
                where: { id: cmd.profileId },
                data: { status: 'ARCHIVED' },
            });
        }
        catch (error) {
            this.logger.error(`DeleteProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteProfileHandler = DeleteProfileHandler;
exports.DeleteProfileHandler = DeleteProfileHandler = DeleteProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_profile_command_1.DeleteProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteProfileHandler);
//# sourceMappingURL=delete-profile.handler.js.map